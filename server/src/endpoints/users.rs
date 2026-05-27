use std::fmt::Debug;

use axum::{
    Json,
    extract::{Path, State},
};
use axum::http::StatusCode;
use serde::{Serialize};
use sqlx::{PgPool};

use crate::{auth::{Claims}, errors::AppError};
use crate::db;

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub name: String,
    pub tag: String,
    pub profile_picture_url: Option<String>,
    pub bio: Option<String>
}

impl From<db::users::UserRecord> for UserResponse {
    fn from(value: db::users::UserRecord) -> Self {
        UserResponse {
            name: value.name,
            tag: value.tag,
            profile_picture_url: value.profile_picture_url,
            bio: value.bio,
        }
    }
}

pub async fn user_by_tag(
    State(db_pool): State<PgPool>,
    Path(tag): Path<String>,
) -> Result<Json<UserResponse>, AppError> {
    let user = db::users::get_user_by_tag(&db_pool, &tag).await?;

    Ok(Json(user.into()))
}

pub async fn follow_user(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(tag): Path<String>,
) -> Result<(StatusCode, &'static str), AppError> {
    let user_follows = db::users::get_user_by_tag(&db_pool, &tag).await?;

    db::users::create_follow(&db_pool, &claims.sub, &user_follows.user_id)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(db_err) if db_err.constraint() == Some("followers_no_self_follow") => 
                AppError::BadRequest("Users can't follow themselves."),
            sqlx::Error::Database(db_err) if db_err.constraint() == Some("followers_unique") => 
                AppError::Conflict("Already following this user."),
            _ => AppError::Internal("Error while creating follow."),
        })?;

    Ok((StatusCode::CREATED, "Created follow successfully."))
}

pub async fn unfollow_user(
    State(db_pool): State<PgPool>,
    claims: Claims,
    Path(tag): Path<String>,
) -> Result<StatusCode, AppError> {
    let followed_user = db::users::get_user_by_tag(&db_pool, &tag).await?;
    db::users::delete_follow(&db_pool, &claims.sub, &followed_user.user_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn user_follows(
    State(db_pool): State<PgPool>,
    Path(tag): Path<String>,
) -> Result<Json<Vec<UserResponse>>, AppError> {
    let _user = db::users::get_user_by_tag(&db_pool, &tag).await?;
    let users = db::users::get_user_follows(&db_pool, &tag).await?;

    let response: Vec<UserResponse> = users
        .into_iter()
        .map(UserResponse::from)
        .collect();

    Ok(Json(response))
}

pub async fn user_followed_by(
    State(db_pool): State<PgPool>,
    Path(tag): Path<String>,
) -> Result<Json<Vec<UserResponse>>, AppError> {
    let _user = db::users::get_user_by_tag(&db_pool, &tag).await?;
    let user_following = db::users::get_user_followed_by(&db_pool, &tag).await?;

    let response: Vec<UserResponse> = user_following
        .into_iter()
        .map(UserResponse::from)
        .collect();

    Ok(Json(response))
}

pub async fn delete_user(
    State(db_pool): State<PgPool>,
    claims: Claims,
) -> Result<(StatusCode, &'static str), AppError> {
    let user = db::users::get_user_by_id(&db_pool, claims.sub).await?;
    db::users::delete_user(&db_pool, &user.user_id).await?;

    Ok((StatusCode::NO_CONTENT, "Deleted user successfully."))
}