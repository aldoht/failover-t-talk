use sqlx::{PgPool};

#[derive(Debug, serde::Serialize)]
pub struct UserRecord {
    pub user_id: uuid::Uuid,
    pub name: String,
    pub tag: String,
    pub email: String,
    pub password: String,
    pub is_admin: bool,
}

pub async fn create_db_pool() -> PgPool {
    let url = std::env::var("AWS_PSQL_URL").expect("Database URL not set.");
    PgPool::connect(&url).await.expect("Failed to connect to database.")
}

pub async fn get_users(db_pool: &PgPool) -> anyhow::Result<Vec<UserRecord>> {
    let rec: Vec<UserRecord> = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin FROM users;
        "#
    )
    .fetch_all(db_pool)
    .await?;
    
    Ok(rec)
}

pub async fn get_user_by_email(db_pool: &PgPool, email: &String) -> anyhow::Result<UserRecord> {
    let rec: UserRecord = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin FROM users AS u
        WHERE u.email = $1;
        "#,
        email
    )
    .fetch_one(db_pool)
    .await?;
    
    Ok(rec)
}

pub async fn create_user(db_pool: &PgPool, name: &String, tag: &String, email: &String, password: &String) -> anyhow::Result<UserRecord> {
    let rec: UserRecord = sqlx::query_as!(
        UserRecord,
        r#"
        INSERT INTO users (name, tag, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, name, tag, email, password, is_admin
        "#,
        name,
        tag,
        email,
        password
    )
    .fetch_one(db_pool)
    .await?;
    
    Ok(rec)
}

pub async fn check_exists_email(db_pool: &PgPool, email: &String) -> anyhow::Result<bool> {
    let exists: bool = sqlx::query_scalar!(
        "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
        email
    )
    .fetch_one(db_pool)
    .await?
    .unwrap_or(false);
    
    Ok(exists)
}

pub async fn check_exists_tag(db_pool: &PgPool, tag: &String) -> anyhow::Result<bool> {
    let exists: bool = sqlx::query_scalar!(
        "SELECT EXISTS(SELECT 1 FROM users WHERE tag = $1)",
        tag
    )
    .fetch_one(db_pool)
    .await?
    .unwrap_or(false);
    
    Ok(exists)
}