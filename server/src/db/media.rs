use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct MediaRecord {
    pub media_id: uuid::Uuid,
    pub url: String,
    pub post_id: Option<uuid::Uuid>,
    pub comment_id: Option<uuid::Uuid>,
}

pub async fn create_media(
    db_pool: &PgPool,
    url: &String,
    post_id: &Option<uuid::Uuid>,
    comment_id: &Option<uuid::Uuid>,
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

pub async fn get_media_by_post_id(
    db_pool: &PgPool,
    post_id: &Uuid,
) -> Result<Vec<MediaRecord>, sqlx::Error> {
    let rec = sqlx::query_as!(
        MediaRecord,
        r#"
        SELECT media_id, url, post_id, comment_id FROM media AS m
        WHERE post_id = $1;
        "#,
        post_id
    )
    .fetch_all(db_pool)
    .await?;

    Ok(rec)
}