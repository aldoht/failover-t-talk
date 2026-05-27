use std::sync::LazyLock;
use std::time::Instant;

use axum::{Json, Router, routing::{delete, get, post}, extract::{MatchedPath, Request}, middleware::{self, Next}, response::Response};
use tower::ServiceBuilder;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use prometheus::{Encoder, TextEncoder, HistogramVec, IntCounterVec, register_histogram_vec, register_int_counter_vec};
use serde::Serialize;
use tokio::net::TcpListener;
use tracing::Level;
use tracing_subscriber::{EnvFilter, fmt};

use crate::auth::init_jwt_secret;

mod db;
mod auth;
mod utils;
mod endpoints;
mod errors;

static HTTP_REQUESTS: LazyLock<IntCounterVec> = LazyLock::new(|| {
    register_int_counter_vec!(
        "http_requests_total",
        "Total HTTP requests",
        &["method", "path", "status"]
    ).unwrap()
});

static HTTP_DURATION: LazyLock<HistogramVec> = LazyLock::new(|| {
    register_histogram_vec!(
        "http_request_duration_seconds",
        "HTTP request duration in seconds",
        &["method", "path"]
    ).unwrap()
});

async fn track_metrics(req: Request, next: Next) -> Response {
    let method = req.method().to_string();
    let path = req
        .extensions()
        .get::<MatchedPath>()
        .map(|p| p.as_str().to_string())
        .unwrap_or_else(|| "unknown".to_string());

    if matches!(path.as_str(), "/health" | "/metrics") {
        return next.run(req).await;
    }

    let start = Instant::now();
    let response = next.run(req).await;
    let elapsed = start.elapsed().as_secs_f64();
    let status = response.status().as_u16().to_string();

    HTTP_REQUESTS
        .with_label_values(&[&method, &path, &status])
        .inc();
    HTTP_DURATION
        .with_label_values(&[&method, &path])
        .observe(elapsed);

    response
}

#[derive(Serialize)]
struct StatusResponse {
    status: String,
    instance: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_pool = db::utils::create_db_pool().await;
    init_jwt_secret();

    let port: u16 = std::env::var("PORT")
        .unwrap_or("8080".into())
        .parse()
        .unwrap();
    let host: String = std::env::var("HOST")
        .unwrap_or("0.0.0.0".into())
        .parse()
        .unwrap();
    
    let middleware = ServiceBuilder::new()
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO))
        )
        .layer(middleware::from_fn(track_metrics));

    fmt()
    .with_env_filter(EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info")))
    .init();

    let app: Router = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .route("/v1/api/status", get(api_status))
        .route("/v1/auth/signup", post(auth::signup))
        .route("/v1/auth/login", post(auth::login))
        .route("/v1/users/me", delete(endpoints::users::delete_user))
        .route("/v1/users/{tag}", get(endpoints::users::user_by_tag))
        .route("/v1/users/{tag}/following", get(endpoints::users::user_follows))
        .route("/v1/users/{tag}/followers", get(endpoints::users::user_followed_by))
        .route("/v1/users/{tag}/followers", post(endpoints::users::follow_user))
        .route("/v1/users/{tag}/followers/me", delete(endpoints::users::unfollow_user))
        .route("/v1/users/{tag}/posts", get(endpoints::posts::get_posts_by_tag))
        .route("/v1/posts", post(endpoints::posts::create_post))
        .route("/v1/posts/{id}", get(endpoints::posts::get_post_by_id))
        .route("/v1/posts/{id}/me", delete(endpoints::posts::delete_post))
        .route("/v1/posts/{id}/comments", get(endpoints::comments::get_post_replies))
        .route("/v1/posts/{id}/comments", post(endpoints::comments::comment_on_post))
        .route("/v1/posts/{id}/likes", post(endpoints::likes::like_post))
        .route("/v1/posts/{id}/likes/me", delete(endpoints::likes::remove_like_from_post))
        .route("/v1/comments/{id}", get(endpoints::comments::get_comment))
        .route("/v1/comments/{id}/me", delete(endpoints::comments::delete_comment))
        .route("/v1/comments/{id}/replies", get(endpoints::comments::get_comment_replies))
        .route("/v1/comments/{id}/replies", post(endpoints::comments::reply_to_comment))
        .route("/v1/comments/{id}/likes", post(endpoints::likes::like_comment))
        .route("/v1/comments/{id}/likes/me", delete(endpoints::likes::remove_like_from_comment))
        .layer(middleware)
        .with_state(db_pool);
    let listener: TcpListener = TcpListener::bind(format!("{host}:{port}")).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn api_status() -> Json<StatusResponse> {
    Json(StatusResponse {
        status: "running".into(),
        instance: std::env::var("HOSTNAME").unwrap_or("unknown".into()),
    })
}

async fn root() -> String {
    let hostname = std::env::var("HOSTNAME").unwrap_or("unknown".into());
    format!("Hello from instance: {hostname}")
}

async fn health() -> &'static str {
    "Ok"
}

async fn metrics() -> String {
    let encoder = TextEncoder::new();
    let mut buf = vec![];
    encoder.encode(&prometheus::gather(), &mut buf).unwrap();
    String::from_utf8(buf).unwrap()
}
