use std::fmt::Debug;

use axum::{Json, extract::{Path, State}, http::HeaderMap, response::{IntoResponse, Response}};
use chrono::{DateTime, Utc};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::{Claims, extract_token},
    db::{self, media::MediaRecord, posts::PostRecord, users::UserRecord},
    utils,
};

#[derive(Deserialize)]
pub struct PostRequest {
    pub text: String,
    pub url: Option<String>,
}

#[derive(Serialize)]
pub struct PostResponse {
    pub post_id: Uuid,
    pub user_name: String,
    pub user_tag: String,
    pub user_profile_pic_url: Option<String>,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub media_urls: Option<Vec<String>>,
    pub like_count: i64,
}

pub async fn create_post(
    State(db_pool): State<PgPool>,
    headers: HeaderMap,
    Json(body): Json<PostRequest>,
) -> impl IntoResponse + Debug {
    let claims: Claims = match extract_token(&headers) {
        Ok(c) => c,
        Err(e) => return e.into_response(),
    };
    let user_id: uuid::Uuid = match uuid::Uuid::parse_str(&claims.sub[..]) {
        Ok(id) => id,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Could not retrieve user's ID.",
            )
                .into_response();
        }
    };

    let post: db::posts::PostRecord =
        match db::posts::create_post(&db_pool, &user_id, &body.text).await {
            Ok(p) => p,
            Err(_) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "There was an error while writing to the database.",
                )
                    .into_response();
            }
        };

    match body.url {
        Some(u) => {
            if utils::valid_url(&u) {
                match db::media::create_media(&db_pool, &u, &Some(post.post_id), &None).await {
                    Ok(_) => {
                        return (StatusCode::OK, "Created post with media successfully.")
                            .into_response();
                    }
                    Err(_) => {
                        return (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            "There was an error when attaching media.",
                        )
                            .into_response();
                    }
                };
            }
        }
        None => {}
    };

    (StatusCode::OK, "Created post successfully.").into_response()
}

fn handle_post_media(media: Vec<MediaRecord>) -> Option<Vec<String>> {
    if media.is_empty() {
        None
    } else {
        let mut media_urls: Vec<String> = Vec::new();
        for m in media.iter() {
            media_urls.push(m.url.clone());
        }
        Some(media_urls)
    }
}

async fn create_post_response(
    post: &PostRecord,
    user: &UserRecord,
    db_pool: &PgPool
) -> Result<PostResponse, sqlx::Error> {
    let like_count = db::posts::get_post_like_count(&db_pool, &post.post_id)
        .await
        .unwrap_or(0);
    
    let media = db::media::get_media_by_post_id(db_pool, &post.post_id).await?;
    let media_urls = handle_post_media(media);
    
    Ok(
        PostResponse {
            post_id: post.post_id,
            user_name: user.name.clone(),
            user_tag: user.tag.clone(),
            user_profile_pic_url: user.profile_picture_url.clone(),
            text: post.text.clone(),
            created_at: post.created_at,
            media_urls,
            like_count,
        }
    )
}

pub async fn get_posts_by_tag(
    State(db_pool): State<PgPool>,
    Path(tag): Path<String>,
) -> Result<Response, (StatusCode, &'static str)> {
    let user = db::users::get_user_by_tag(&db_pool, &tag).await;
    let user: db::users::UserRecord = match user {
        Ok(u) => u,
        Err(_) => return Err((StatusCode::NOT_FOUND, "User with tag not found.")),
    };

    let posts = db::posts::get_posts_by_tag(&db_pool, &tag).await;
    let posts: Vec<PostResponse> = match posts {
        Ok(posts) => {
            let mut response: Vec<PostResponse> = Vec::new();
            for post in posts.iter() {
                let pr = create_post_response(post, &user, &db_pool)
                    .await
                    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Could not load media."))?;
                response.push(pr);
            }
            response
        }
        Err(_) => return Err((StatusCode::INTERNAL_SERVER_ERROR, "Could not load posts.")),
    };

    Ok(Json(posts).into_response())
}

pub async fn get_post_by_id(
    State(db_pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Response, (StatusCode, &'static str)> {
    let post = db::posts::get_post_by_id(&db_pool, id)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => (StatusCode::NOT_FOUND, "Post not found."),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, "Could not load post."),
        })?;

    let user = db::users::get_user_by_id(&db_pool, post.user_id)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Could not load post author."))?;

    let response = create_post_response(&post, &user, &db_pool)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Could not load media."))?;

    Ok(Json(response).into_response())
}