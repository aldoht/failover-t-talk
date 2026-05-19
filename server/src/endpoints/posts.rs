use axum::{
    Json,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::{Claims, authenticate},
    db::{self, media::MediaTarget, posts::PostRecord, users::UserRecord},
    errors::AppError,
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
) -> Result<(StatusCode, &'static str), AppError> {
    let claims = authenticate(&headers)?;
    
    if let Some(ref url) = body.url {
        if !utils::valid_url(url) {
            return Err(AppError::BadRequest("Invalid media URL."));
        }
    }
    
    let post = db::posts::create_post(&db_pool, &claims.sub, &body.text).await?;

    if let Some(url) = body.url {
        db::media::create_media(&db_pool, &url, MediaTarget::Post(post.post_id)).await?;
    };

    Ok((StatusCode::CREATED, "Created post successfully."))
}

// N + 1
async fn create_post_response(
    post: &PostRecord,
    user: &UserRecord,
    db_pool: &PgPool,
) -> Result<PostResponse, AppError> {
    let like_count = db::posts::get_post_like_count(&db_pool, &post.post_id)
        .await
        .unwrap_or(0);

    let media = db::media::get_media_by_post_id(db_pool, &post.post_id).await?;
    let media_urls = if media.is_empty() { None } else { Some(media.into_iter().map(|m| m.url).collect()) };

    Ok(PostResponse {
        post_id: post.post_id,
        user_name: user.name.clone(),
        user_tag: user.tag.clone(),
        user_profile_pic_url: user.profile_picture_url.clone(),
        text: post.text.clone(),
        created_at: post.created_at,
        media_urls,
        like_count,
    })
}

// N + 1
pub async fn get_posts_by_tag(
    State(db_pool): State<PgPool>,
    Path(tag): Path<String>,
) -> Result<Json<Vec<PostResponse>>, AppError> {
    let user = db::users::get_user_by_tag(&db_pool, &tag).await?;
    let posts = db::posts::get_posts_by_tag(&db_pool, &tag).await?;

    let mut response = Vec::with_capacity(posts.len());
    for post in &posts {
        response.push(create_post_response(post, &user, &db_pool).await?);
    }
    Ok(Json(response))
}

pub async fn get_post_by_id(
    State(db_pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<PostResponse>, AppError> {
    let post = db::posts::get_post_by_id(&db_pool, id).await?;
    let user = db::users::get_user_by_id(&db_pool, post.user_id).await?;
    let response = create_post_response(&post, &user, &db_pool).await?;

    Ok(Json(response))
}
