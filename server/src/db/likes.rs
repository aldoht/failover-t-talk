use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{db::media::MediaTarget, errors::AppError};

pub struct LikeRecord {
    pub like_id: Uuid,
    pub user_id: Uuid,
    pub post_id: Option<Uuid>,
    pub comment_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

pub async fn create_like(
    db_pool: &PgPool,
    target: MediaTarget,
    user_id: &Uuid,
) -> Result<(), AppError> {
    match target {
        MediaTarget::Post(post_id) => {
            sqlx::query!(
                "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
                user_id,
                post_id,
            )
            .execute(db_pool)
            .await?
        },
        MediaTarget::Comment(comment_id) => {
            sqlx::query!(
                "INSERT INTO likes (user_id, comment_id) VALUES ($1, $2)",
                user_id,
                comment_id,
            )
            .execute(db_pool)
            .await?
        }
    };

    Ok(())
}

pub async fn delete_like(
    db_pool: &PgPool,
    target: MediaTarget,
    user_id: &Uuid,
) -> Result<(), AppError> {
    match target {
        MediaTarget::Post(post_id) => {
            sqlx::query!(
                "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
                user_id,
                post_id,
            )
            .execute(db_pool)
            .await?
        },
        MediaTarget::Comment(comment_id) => {
            sqlx::query!(
                "DELETE FROM likes WHERE user_id = $1 AND comment_id = $2",
                user_id,
                comment_id,
            )
            .execute(db_pool)
            .await?
        }
    };

    Ok(())
}

pub async fn get_target_likes(
    db_pool: &PgPool,
    target: &MediaTarget,
) -> Result<i64, sqlx::Error> {
    let count: i64 = match target {
        MediaTarget::Post(post_id) => {
            sqlx::query_scalar!(
                "SELECT COUNT(*) FROM likes WHERE post_id = $1",
                post_id
            )
            .fetch_one(db_pool)
            .await?
            .unwrap_or(0)
        },
        MediaTarget::Comment(comment_id) => {
            sqlx::query_scalar!(
                "SELECT COUNT(*) FROM likes WHERE comment_id = $1",
                comment_id
            )
            .fetch_one(db_pool)
            .await?
            .unwrap_or(0)
        }
    };

    Ok(count)
}