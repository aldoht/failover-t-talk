use prometheus::{Counter, register_counter, Encoder, TextEncoder};
use tokio::net::{TcpListener};
use axum::{routing::{get}, Router};

lazy_static::lazy_static! {
    static ref REQUEST_COUNTER: Counter = register_counter!(
        "http_requests_total", "Total HTTP requests"
    ).unwrap();
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Could not load env file.");
    
    let port: u16 = std::env::var("PORT")
        .unwrap_or("8080".into())
        .parse()
        .unwrap();
    let host: String = std::env::var("HOST")
        .unwrap_or("127.0.0.1".into())
        .parse()
        .unwrap();
    let app: Router = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/metrics", get(metrics));
    let listener: TcpListener = TcpListener::bind(format!("{host}:{port}")).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> String {
    REQUEST_COUNTER.inc();
    let hostname = std::env::var("HOSTNAME").unwrap_or("unknown".into());
    format!("Hello from instance: {hostname}")
}

async fn health() -> &'static str { "Ok" }

async fn metrics() -> String {
    let encoder = TextEncoder::new();
    let mut buf = vec![];
    encoder.encode(&prometheus::gather(), &mut buf).unwrap();
    String::from_utf8(buf).unwrap()
}