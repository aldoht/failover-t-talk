use axum::{
    extract::{Path, State},
    http::{StatusCode},
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{auth::Claims, db::{self, media::MediaTarget}, errors::AppError};

async fn like(db_pool: &PgPool, target: MediaTarget, user_id: &Uuid) -> Result<StatusCode, AppError> {
    db::likes::create_like(db_pool, target, user_id).await?;
    Ok(StatusCode::CREATED)
}

async fn unlike(db_pool: &PgPool, target: MediaTarget, user_id: &Uuid) -> Result<StatusCode, AppError> {
    db::likes::delete_like(db_pool, target, user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn like_post(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let _post = db::posts::get_post_by_id(&db_pool, id).await?;
    like(&db_pool, MediaTarget::Post(id), &claims.sub).await
}

pub async fn remove_like_from_post(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let _post = db::posts::get_post_by_id(&db_pool, id).await?;
    unlike(&db_pool, MediaTarget::Post(id), &claims.sub).await
}

pub async fn like_comment(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let _comment = db::comments::get_comment_by_id(&db_pool, id).await?;
    like(&db_pool, MediaTarget::Comment(id), &claims.sub).await
}

pub async fn remove_like_from_comment(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let _comment = db::comments::get_comment_by_id(&db_pool, id).await?;
    unlike(&db_pool, MediaTarget::Comment(id), &claims.sub).await
}