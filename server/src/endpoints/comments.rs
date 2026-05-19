use axum::{Json, extract::{Path, State}};
use reqwest::StatusCode;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{auth::Claims, db::{self, comments::CommentRecord, media::MediaTarget}, errors::AppError};

#[derive(Deserialize)]
pub struct CreateCommentRequest {
    pub text: String,
}

pub async fn comment_on_post(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(post_id): Path<Uuid>,
    Json(body): Json<CreateCommentRequest>,
) -> Result<(StatusCode, Json<CommentRecord>), AppError> {
    db::posts::get_post_by_id(&db_pool, post_id).await?;
    let comment = db::comments::create_comment(
        &db_pool,
        MediaTarget::Post(post_id),
        &claims.sub,
        &body.text,
    ).await?;
    Ok((StatusCode::CREATED, Json(comment)))
}

pub async fn reply_to_comment(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(comment_id): Path<Uuid>,
    Json(body): Json<CreateCommentRequest>,
) -> Result<(StatusCode, Json<CommentRecord>), AppError> {
    let comment = db::comments::create_comment(
        &db_pool,
        MediaTarget::Comment(comment_id),
        &claims.sub,
        &body.text,
    ).await?;
    Ok((StatusCode::CREATED, Json(comment)))
}

pub async fn get_comment(
    State(db_pool): State<PgPool>,
    Path(comment_id): Path<Uuid>,
) -> Result<(StatusCode, Json<CommentRecord>), AppError> {
    let comment = db::comments::get_comment_by_id(&db_pool, comment_id).await?;
    Ok((StatusCode::OK, Json(comment)))
}