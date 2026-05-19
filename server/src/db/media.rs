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

pub enum MediaTarget {
    Post(Uuid),
    Comment(Uuid),
}

pub async fn create_media(
    db_pool: &PgPool,
    url: &str,
    target: MediaTarget,
) -> Result<MediaRecord, sqlx::Error> {
    match target {
        MediaTarget::Post(post_id) => sqlx::query_as!(
            MediaRecord,
            r#"INSERT INTO media (url, post_id) VALUES ($1, $2)
                RETURNING media_id, url, post_id, comment_id"#,
            url, post_id,
        ).fetch_one(db_pool).await,
        MediaTarget::Comment(comment_id) => sqlx::query_as!(
            MediaRecord,
            r#"INSERT INTO media (url, comment_id) VALUES ($1, $2)
                RETURNING media_id, url, post_id, comment_id"#,
            url, comment_id,
        ).fetch_one(db_pool).await,
    }
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