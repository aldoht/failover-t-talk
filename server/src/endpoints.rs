use std::fmt::Debug;

use axum::{Json, extract::{Path, State}, http::HeaderMap, response::IntoResponse};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool};

use crate::{auth::{Claims, extract_token}, db::{self, get_user_by_tag, get_user_follows}, utils};

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
    pub url: Option<String>,
}

#[derive(Deserialize)]
pub struct FollowRequest {
    pub follows_tag: String,
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
    let user_id: uuid::Uuid = match uuid::Uuid::parse_str(&claims.sub[..]) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Could not retrieve user's ID.").into_response(),
    };
    
    let post: db::PostRecord = match db::create_post(&db_pool, &user_id, &body.text).await {
        Ok(p) => p,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "There was an error while writing to the database.").into_response()
    };
    
    match body.url {
        Some(u) => {
            if utils::valid_url(&u) {
                match db::create_media(&db_pool, u, Some(post.post_id), None).await {
                    Ok(_) => return (StatusCode::OK, "Created post with media successfully.").into_response(),
                    Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "There was an error when attaching media.").into_response(),
                };
            }
        },
        None => {},
    };
    
    (StatusCode::OK, "Created post successfully.").into_response()   
}

// Check if user already follows target
pub async fn follow_user(State(db_pool): State<PgPool>, headers: HeaderMap, Json(body): Json<FollowRequest>) -> impl IntoResponse + Debug {
    let claims: Claims = match extract_token(&headers) {
        Ok(c) => c,
        Err(e) => return e.into_response(),
    };
    let user_id: uuid::Uuid = match uuid::Uuid::parse_str(&claims.sub[..]) {
        Ok(id) => id,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Could not retrieve user's ID.").into_response(),
    };
    let user_follows = get_user_by_tag(&db_pool, &body.follows_tag).await;
    
    let user_follows = match user_follows {
        Ok(u) => {
            if u.user_id == user_id {
                return (StatusCode::BAD_REQUEST, "Users can't follow themselves").into_response();
            }
            u
        },
        Err(_) => return (StatusCode::NOT_FOUND, "User with tag not found.").into_response(),
    };
    
    match db::create_follow(&db_pool, &user_id, &user_follows.user_id).await {
        Ok(_) => (StatusCode::OK, "Created follow successfully.").into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Error while creating follow in database.").into_response(),
    }
}

pub async fn user_follows(State(db_pool): State<PgPool>, Path(tag): Path<String>) -> impl IntoResponse + Debug {
    let user_following = get_user_follows(&db_pool, &tag).await;

    let users: Vec<UserResponse> = match user_following {
        Ok(users) => {
            let mut response: Vec<UserResponse> = Vec::new();
            for user in users.iter() {
                response.push(UserResponse {
                    name: user.name.clone(),
                    tag: user.tag.clone(),
                });
            };
            response
        },
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Error while getting user's follows.").into_response(),
    };

    Json(users).into_response()
}