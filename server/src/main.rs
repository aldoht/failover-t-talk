use axum::{Json, Router, routing::get};
use tower::ServiceBuilder;
use tower_http::{cors::{CorsLayer, Any}};
use prometheus::{Counter, Encoder, TextEncoder, register_counter};
use serde::Serialize;
use tokio::net::TcpListener;
mod db;

lazy_static::lazy_static! {
    static ref REQUEST_COUNTER: Counter = register_counter!(
        "http_requests_total", "Total HTTP requests"
    ).unwrap();
}

#[derive(Serialize)]
struct StatusResponse {
    status: String,
    instance: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_pool = db::create_db_pool().await;
    
    let users = db::get_users(&db_pool).await;
    println!("{:#?}", users);
    
    let new_user = db::create_user(&db_pool, "Aldo".into(), "mnStrR".into(), "test321@somemail.com".into(), "test123".into()).await;
    println!("{:#?}", new_user);

    let port: u16 = std::env::var("PORT")
        .unwrap_or("8080".into())
        .parse()
        .unwrap();
    let host: String = std::env::var("HOST")
        .unwrap_or("127.0.0.1".into())
        .parse()
        .unwrap();
    let cors: CorsLayer = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);
    let middleware = ServiceBuilder::new()
        .layer(cors);
    let app: Router = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .route("/api/status", get(api_status))
        .layer(middleware);
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
