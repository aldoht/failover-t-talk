use serde::Serialize;
use sqlx::PgPool;

#[derive(Debug, Serialize)]
pub struct MediaRecord {
    pub media_id: uuid::Uuid,
    pub url: String,
    pub post_id: Option<uuid::Uuid>,
    pub comment_id: Option<uuid::Uuid>,
}

pub async fn create_media(
    db_pool: &PgPool,
    url: String,
    post_id: Option<uuid::Uuid>,
    comment_id: Option<uuid::Uuid>,
) -> anyhow::Result<MediaRecord> {
    let rec = match post_id {
        Some(id) => {
            sqlx::query_as!(
                MediaRecord,
                r#"
            INSERT INTO media (url, post_id)
            VALUES ($1, $2)
            RETURNING media_id, url, post_id, comment_id
            "#,
                url,
                id,
            )
            .fetch_one(db_pool)
            .await?
        }
        None => {
            sqlx::query_as!(
                MediaRecord,
                r#"
            INSERT INTO media (url, post_id)
            VALUES ($1, $2)
            RETURNING media_id, url, post_id, comment_id
            "#,
                url,
                comment_id.expect("Err"),
            )
            .fetch_one(db_pool)
            .await?
        }
    };

    Ok(rec)
}
