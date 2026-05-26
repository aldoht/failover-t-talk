use sqlx::PgPool;

pub async fn create_db_pool() -> PgPool {
    let url = std::env::var("DATABASE_URL").expect("Database URL not set.");
    PgPool::connect(&url)
        .await
        .expect("Failed to connect to database.")
}

pub async fn check_exists_email(db_pool: &PgPool, email: &str) -> anyhow::Result<bool> {
    let exists: bool =
        sqlx::query_scalar!("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email)
            .fetch_one(db_pool)
            .await?
            .unwrap_or(false);

    Ok(exists)
}

pub async fn check_exists_tag(db_pool: &PgPool, tag: &str) -> anyhow::Result<bool> {
    let exists: bool =
        sqlx::query_scalar!("SELECT EXISTS(SELECT 1 FROM users WHERE tag = $1)", tag)
            .fetch_one(db_pool)
            .await?
            .unwrap_or(false);

    Ok(exists)
}
