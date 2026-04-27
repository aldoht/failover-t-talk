use std::fmt::Debug;

use axum::{Json, extract::{Path, State}, http::HeaderMap, response::IntoResponse};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool};

use crate::{auth::{Claims, extract_token, validate_token}, db::{self, get_user_by_tag}};

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub name: String,
    pub tag: String,
}

#[derive(Deserialize)]
pub struct UserRequest {
    pub tag: String,
}

#[derive(Deserialize)]
pub struct PostRequest {
    pub text: String,
}

pub async fn user_by_tag(State(db_pool): State<PgPool>, Path(tag): Path<String>) -> impl IntoResponse + Debug {
    let user = get_user_by_tag(&db_pool, &tag).await;
    
    let user = match user {
        Ok(u) => u,
        Err(_) => return (StatusCode::NOT_FOUND, "User with tag not found.").into_response(),
    };
    
    Json(UserResponse {
        name: user.name,
        tag: user.tag,
    }).into_response()
}

pub async fn create_post(State(db_pool): State<PgPool>, headers: HeaderMap, Json(body): Json<PostRequest>) -> impl IntoResponse + Debug {
    let claims: Claims = match extract_token(&headers) {
        Ok(c) => c,
        Err(e) => return e.into_response(),
    };
    
    // create img record if available on request
    
    match db::create_post(&db_pool, &claims.subject, &body.text).await {
        Ok(post_id) => Json(post_id).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "There was an error while writing to the database.").into_response()
    }
}