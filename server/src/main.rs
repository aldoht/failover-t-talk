use std::sync::LazyLock;

use axum::{Json, Router, routing::{delete, get, post}};
use tower::ServiceBuilder;
use tower_http::{cors::{Any, CorsLayer}, trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer}};
use prometheus::{Counter, Encoder, TextEncoder, register_counter};
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

static REQUEST_COUNTER: LazyLock<Counter> = LazyLock::new(|| {
    register_counter!("http_requests_total", "Total HTTP requests").unwrap()
});

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
    let cors: CorsLayer = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);
    let middleware = ServiceBuilder::new()
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO))
        )
        .layer(cors);

    fmt()
    .with_env_filter(EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info")))
    .init();

    let app: Router = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .route("/api/status", get(api_status))
        .route("/signup", post(auth::signup))
        .route("/login", post(auth::login))
        .route("/users/{tag}", get(endpoints::users::user_by_tag))
        .route("/users/{tag}/following", get(endpoints::users::user_follows))
        .route("/users/{tag}/followers", get(endpoints::users::user_followed_by))
        .route("/follow", post(endpoints::users::follow_user))
        .route("/unfollow", delete(endpoints::users::unfollow_user))
        .route("/posts", post(endpoints::posts::create_post))
        .route("/posts/{tag}", get(endpoints::posts::get_posts_by_tag))
        .route("/post/{id}", get(endpoints::posts::get_post_by_id))
        .route("/post/{id}/like", post(endpoints::likes::like_post))
        .route("/post/{id}/unlike", delete(endpoints::likes::remove_like_from_post))
        .route("/post/{id}/replies", get(endpoints::comments::get_post_replies))
        .route("/comment/{id}", get(endpoints::comments::get_comment))
        .route("/comment/reply/{id}", post(endpoints::comments::reply_to_comment))
        .route("/comment/post/{id}", post(endpoints::comments::comment_on_post))
        .route("/comment/{id}/like", post(endpoints::likes::like_comment))
        .route("/comment/{id}/unlike", delete(endpoints::likes::remove_like_from_comment))
        .route("/comment/{id}/replies", get(endpoints::comments::get_comment_replies))
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
    REQUEST_COUNTER.inc();
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
