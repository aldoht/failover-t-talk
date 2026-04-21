use std::fmt::Debug;

use axum::{
    Json, body::Body, extract::State, http::{HeaderMap, Response, StatusCode}, response::IntoResponse
};
use chrono;
use jsonwebtoken::{self, DecodingKey, EncodingKey, Header, Validation, decode, encode, errors::Error};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::db::get_user_by_email;

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub subject: String,
    pub is_admin: bool,
    pub expiration: usize,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

fn generate_token(user_uuid: &String, is_admin: &bool) -> String {
    let expiration: usize = chrono::Utc::now()
        .checked_add_days(chrono::Days::new(1))
        .unwrap()
        .timestamp() as usize;

    let claims = Claims {
        subject: user_uuid.clone(),
        is_admin: is_admin.clone(),
        expiration,
    };

    encode(
        &Header::new(jsonwebtoken::Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_bytes()),
    )
    .unwrap()
}

fn validate_token(token: String) -> Result<Claims, Error> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_bytes()),
        &Validation::new(jsonwebtoken::Algorithm::HS256)
    )?;
    
    Ok(data.claims)
}

pub fn extract_claims(headers: &HeaderMap) -> Result<Claims, String> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(String::from("Missing Authorization header."))?;
    
    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(String::from("Invalid Authorization format."))?;
    
    validate_token(String::from(token))
        .map_err(|_| String::from("Invalid or expired token."))
}

pub async fn login(State(db_pool): State<PgPool>, Json(body): Json<LoginRequest>) -> impl IntoResponse + Debug {
    let user = get_user_by_email(&db_pool, &body.email).await;
    
    let user = match user {
        Ok(u) => u,
        Err(_) => return (StatusCode::UNAUTHORIZED, "Invalid credentials.").into_response()
    };
    
    let valid = bcrypt::verify(&body.password, &user.password).unwrap_or(false);
    if !valid {
        return (StatusCode::UNAUTHORIZED, "Invalid credentials.").into_response();
    }
    
    let token = generate_token(&user.user_id.to_string(), &user.is_admin);
    Json(LoginResponse {token}).into_response()
}