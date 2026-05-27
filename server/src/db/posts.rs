use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{PgPool};
use uuid::Uuid;

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
    text: &str,
) -> Result<PostRecord, sqlx::Error> {
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
    tag: &str,
) -> Result<Vec<PostRecord>, sqlx::Error> {
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

pub async fn get_post_by_id(
    db_pool: &PgPool,
    id: Uuid
) -> Result<PostRecord, sqlx::Error> {
    let post: PostRecord = sqlx::query_as!(
        PostRecord,
        r#"
        SELECT post_id, user_id, text, created_at FROM posts
        WHERE post_id = $1;
        "#,
        id,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(post)
}

pub async fn delete_post(
    db_pool: &PgPool,
    post_id: &Uuid,
    user_id: &Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM posts WHERE user_id = $1 AND post_id = $2",
        user_id,
        post_id,
    )
    .execute(db_pool)
    .await?;

    Ok(())
}