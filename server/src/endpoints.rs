use std::fmt::Debug;

use axum::{Json, extract::{Path, State}, response::IntoResponse};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool};

use crate::db::get_user_by_tag;

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub name: String,
    pub tag: String,
}

#[derive(Deserialize)]
pub struct UserRequest {
    pub tag: String,
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