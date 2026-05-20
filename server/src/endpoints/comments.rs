use axum::{Json, extract::{Path, State}};
use chrono::{DateTime, Utc};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{auth::Claims, db::{self, comments::CommentRecord, media::MediaTarget, users::UserRecord}, errors::AppError, utils};

#[derive(Deserialize)]
pub struct CreateCommentRequest {
    pub text: String,
    pub url: Option<String>,
}

#[derive(Serialize)]
pub struct CommentResponse {
    pub comment_id: Uuid,
    pub post_id: Uuid,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub parent_comment_id: Option<Uuid>,
    pub root_comment_id: Uuid,
    pub user_name: String,
    pub user_tag: String,
    pub user_profile_pic_url: Option<String>,
    pub media_urls: Vec<String>,
    pub like_count: i64,
}

pub async fn comment_on_post(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(post_id): Path<Uuid>,
    Json(body): Json<CreateCommentRequest>,
) -> Result<(StatusCode, &'static str), AppError> {
    db::posts::get_post_by_id(&db_pool, post_id).await?;
    if let Some(ref url) = body.url {
        if !utils::valid_url(url) {
            return Err(AppError::BadRequest("Invalid media URL."));
        }
    }
    let comment = db::comments::create_comment(
        &db_pool,
        MediaTarget::Post(post_id),
        &claims.sub,
        &body.text,
    ).await?;
    
    if let Some(url) = body.url {
        db::media::create_media(&db_pool, &url, MediaTarget::Comment(comment.comment_id)).await?;
    };
    
    Ok((StatusCode::CREATED, "Created comment on post successfully."))
}

pub async fn reply_to_comment(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(comment_id): Path<Uuid>,
    Json(body): Json<CreateCommentRequest>,
) -> Result<(StatusCode, &'static str), AppError> {
    if let Some(ref url) = body.url {
        if !utils::valid_url(url) {
            return Err(AppError::BadRequest("Invalid media URL."));
        }
    }
    let comment = db::comments::create_comment(
        &db_pool,
        MediaTarget::Comment(comment_id),
        &claims.sub,
        &body.text,
    ).await?;
    
    if let Some(url) = body.url {
        db::media::create_media(&db_pool, &url, MediaTarget::Comment(comment.comment_id)).await?;
    };
    
    Ok((StatusCode::CREATED, "Created reply successfully."))
}

// N + 1
async fn create_comment_response(
    comment: &CommentRecord,
    user: &UserRecord,
    db_pool: &PgPool,
) -> Result<CommentResponse, AppError> {
    let like_count = db::likes::get_target_likes(db_pool, &MediaTarget::Comment(comment.comment_id)).await?;

    let media_urls = db::media::get_target_media(db_pool, MediaTarget::Comment(comment.comment_id))
        .await?
        .into_iter()
        .map(|m| m.url)
        .collect();

    Ok(CommentResponse {
        comment_id: comment.comment_id,
        post_id: comment.post_id,
        user_name: user.name.clone(),
        user_tag: user.tag.clone(),
        user_profile_pic_url: user.profile_picture_url.clone(),
        text: comment.text.clone(),
        created_at: comment.created_at,
        media_urls,
        like_count,
        parent_comment_id: comment.parent_comment_id,
        root_comment_id: comment.root_comment_id,
    })
}

pub async fn get_comment(
    State(db_pool): State<PgPool>,
    Path(comment_id): Path<Uuid>,
) -> Result<(StatusCode, Json<CommentResponse>), AppError> {
    let comment = db::comments::get_comment_by_id(&db_pool, comment_id).await?;
    let user = db::users::get_user_by_id(&db_pool, comment.user_id).await?;
    let response = create_comment_response(&comment, &user, &db_pool).await?;
    
    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_comment_replies(
    State(db_pool): State<PgPool>,
    Path(comment_id): Path<Uuid>,
) -> Result<(StatusCode, Json<Vec<CommentResponse>>), AppError> {
    let comment = db::comments::get_comment_by_id(&db_pool, comment_id).await?;
    let user = db::users::get_user_by_id(&db_pool, comment.user_id).await?;
    let comments = db::comments::get_target_comments(&db_pool, MediaTarget::Comment(comment_id)).await?;
    
    let mut response = Vec::with_capacity(comments.len());
    for comment in &comments {
        response.push(create_comment_response(comment, &user, &db_pool).await?);
    }
    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_post_comments(
    State(db_pool): State<PgPool>,
    Path(post_id): Path<Uuid>,
) -> Result<(StatusCode, Json<Vec<CommentResponse>>), AppError> {
    let post = db::posts::get_post_by_id(&db_pool, post_id).await?;
    let user = db::users::get_user_by_id(&db_pool, post.user_id).await?;
    let comments = db::comments::get_target_comments(&db_pool, MediaTarget::Post(post_id)).await?;
    
    let mut response = Vec::with_capacity(comments.len());
    for comment in &comments {
        response.push(create_comment_response(comment, &user, &db_pool).await?);
    }
    Ok((StatusCode::OK, Json(response)))
}