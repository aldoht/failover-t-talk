use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{db::media::MediaTarget, errors::AppError};

#[derive(Serialize)]
pub struct CommentRecord {
    pub comment_id: Uuid,
    pub post_id: Uuid,
    pub user_id: Uuid,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub parent_comment_id: Option<Uuid>,
    pub root_comment_id: Uuid,
}

pub async fn get_comment_by_id(
    db_pool: &PgPool,
    id: Uuid
) -> Result<CommentRecord, sqlx::Error> {
    let comment: CommentRecord = sqlx::query_as!(
        CommentRecord,
        r#"
        SELECT * FROM comments
        WHERE comment_id = $1;
        "#,
        id,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(comment)
}

pub async fn create_comment(
    pool: &PgPool,
    target: MediaTarget,
    user_id: &Uuid,
    text: &str,
) -> Result<CommentRecord, AppError> {
    let (post_id, parent_comment_id) = match target {
        MediaTarget::Post(post_id) => (post_id, None),
        MediaTarget::Comment(parent_id) => {
            let parent_post = sqlx::query_scalar!(
                "SELECT post_id FROM comments WHERE comment_id = $1",
                parent_id
            )
            .fetch_optional(pool)
            .await?
            .ok_or(AppError::NotFound("parent comment"))?;

            (parent_post, Some(parent_id))
        }
    };

    let comment = sqlx::query_as!(
        CommentRecord,
        "INSERT INTO comments (post_id, user_id, text, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *",
        post_id,
        user_id,
        text,
        parent_comment_id
    )
    .fetch_one(pool)
    .await?;

    Ok(comment)
}