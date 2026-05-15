use chrono::NaiveDate;
use serde::Serialize;
use sqlx::PgPool;

#[derive(Debug, Serialize)]
pub struct PostRecord {
    pub post_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub text: String,
    pub creation_date: NaiveDate,
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
        RETURNING post_id, user_id, text, creation_date
        "#,
        user_id,
        text,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}
