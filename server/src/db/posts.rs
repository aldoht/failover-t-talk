use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::PgPool;

#[derive(Debug, Serialize)]
pub struct PostRecord {
    pub post_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub text: String,
    pub created_at: DateTime<Utc>,
}

pub async fn create_post(
    db_pool: &PgPool,
    user_id: &uuid::Uuid,
    text: &String,
) -> anyhow::Result<PostRecord> {
    let rec: PostRecord = sqlx::query_as!(
        PostRecord,
        r#"
        INSERT INTO posts (user_id, text)
        VALUES ($1, $2)
        RETURNING post_id, user_id, text, created_at;
        "#,
        user_id,
        text,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}

pub async fn get_posts_by_tag(
    db_pool: &PgPool,
    tag: &String,
) -> anyhow::Result<Vec<PostRecord>> {
    let posts: Vec<PostRecord> = sqlx::query_as!(
        PostRecord,
        r#"
        SELECT post_id, p.user_id, text, created_at FROM posts AS p
        INNER JOIN users AS u ON p.user_id = u.user_id
        WHERE u.tag = $1;
        "#,
        tag,
    )
    .fetch_all(db_pool)
    .await?;

    Ok(posts)
}