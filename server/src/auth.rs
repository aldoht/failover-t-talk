use axum::{
    Json,
    extract::State,
    http::{HeaderMap},
};
use chrono;
use jsonwebtoken::{
    self, DecodingKey, EncodingKey, Header, Validation, decode, encode,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use std::sync::OnceLock;

use crate::{
    db, errors::AppError, utils::{valid_bio, valid_email, valid_name, valid_password, valid_user_tag}
};

static JWT_SECRET: OnceLock<String> = OnceLock::new();

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub is_admin: bool,
    pub exp: usize,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct SignupRequest {
    pub name: String,
    pub tag: String,
    pub email: String,
    pub password: String,
    pub profile_picture_url: Option<String>,
    pub bio: Option<String>,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

pub fn init_jwt_secret() {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    JWT_SECRET.set(secret).expect("JWT_SECRET already initialized");
}

fn jwt_secret() -> &'static str {
    JWT_SECRET.get().expect("JWT_SECRET not initialized")
}

fn generate_token(user_uuid: Uuid, is_admin: bool) -> Result<String, AppError> {
    let exp = (chrono::Utc::now() + chrono::Duration::days(1)).timestamp() as usize;
    let claims = Claims {
        sub: user_uuid,
        is_admin,
        exp,
    };
    encode(
        &Header::new(jsonwebtoken::Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(jwt_secret().as_bytes()),
    )
    .map_err(AppError::from)
}

fn validate_token(token: &str) -> Result<Claims, AppError> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret().as_bytes()),
        &Validation::new(jsonwebtoken::Algorithm::HS256),
    )?;

    Ok(data.claims)
}

pub fn authenticate(headers: &HeaderMap) -> Result<Claims, AppError> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized("Missing Authorization header."))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized("Invalid Authorization format."))?;

    validate_token(token)
}

pub async fn login(
    State(db_pool): State<PgPool>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    let user = db::users::get_user_by_email(&db_pool, &body.email).await?;

    let valid = bcrypt::verify(&body.password, &user.password)
        .unwrap_or(false);
    if !valid {
        return Err(AppError::Unauthorized("Invalid credentials."));
    }

    let token = generate_token(user.user_id, user.is_admin)?;
    
    Ok(Json(LoginResponse { token }))
}

pub async fn signup(
    State(db_pool): State<PgPool>,
    Json(body): Json<SignupRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    if !valid_email(&body.email)
        || !valid_password(&body.password)
        || !valid_user_tag(&body.tag)
        || !valid_name(&body.name)
    {
        return Err(AppError::BadRequest("Invalid values."));
    }
    if let Some(bio) = &body.bio {
        if !valid_bio(bio) {
            return Err(AppError::BadRequest("Invalid bio."));
        }
    }

    let hashed_password = bcrypt::hash(&body.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::Internal("Error at signing up."))?;

    let rec = db::users::create_user(
        &db_pool,
        &body.name,
        &body.tag,
        &body.email,
        &hashed_password,
        body.profile_picture_url.as_deref(),
        body.bio.as_deref(),
    )
    .await
    .map_err(|e| match &e {
        sqlx::Error::Database(db_err) => match db_err.constraint() {
            Some("users_email_key") => AppError::Conflict("Email already registered."),
            Some("users_tag_key") => AppError::Conflict("Tag already exists."),
            _ => e.into(),
        },
        _ => e.into(), 
    })?;

    let token = generate_token(rec.user_id, rec.is_admin)?;
    Ok(Json(LoginResponse { token }))
}
