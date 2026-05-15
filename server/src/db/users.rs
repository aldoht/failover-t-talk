use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct UserRecord {
    pub user_id: uuid::Uuid,
    pub name: String,
    pub tag: String,
    pub email: String,
    pub password: String,
    pub is_admin: bool,
    pub profile_picture_url: Option<String>,
    pub bio: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct FollowersRecord {
    pub follow_id: uuid::Uuid,
    pub follower_id: uuid::Uuid,
    pub followee_id: uuid::Uuid,
}

pub async fn get_users(db_pool: &PgPool) -> anyhow::Result<Vec<UserRecord>> {
    let rec: Vec<UserRecord> = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio FROM users;
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
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio FROM users AS u
        WHERE u.email = $1;
        "#,
        email
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}

pub async fn get_user_by_id(db_pool: &PgPool, id: Uuid) -> anyhow::Result<UserRecord> {
    let rec: UserRecord = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio FROM users AS u
        WHERE u.user_id = $1;
        "#,
        id
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}

pub async fn get_user_by_tag(db_pool: &PgPool, tag: &String) -> anyhow::Result<UserRecord> {
    let rec: UserRecord = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio FROM users AS u
        WHERE u.tag = $1;
        "#,
        tag
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}

pub async fn get_user_follows(db_pool: &PgPool, tag: &String) -> anyhow::Result<Vec<UserRecord>> {
    let user: UserRecord = get_user_by_tag(db_pool, tag).await?;

    let recs: Vec<UserRecord> = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio
        FROM users AS u
        INNER JOIN followers AS f ON f.followee_id = u.user_id
        WHERE f.follower_id = $1;
        "#,
        user.user_id
    )
    .fetch_all(db_pool)
    .await?;

    Ok(recs)
}

pub async fn get_user_followed_by(db_pool: &PgPool, tag: &String) -> anyhow::Result<Vec<UserRecord>> {
    let user: UserRecord = get_user_by_tag(db_pool, tag).await?;

    let recs: Vec<UserRecord> = sqlx::query_as!(
        UserRecord,
        r#"
        SELECT user_id, name, tag, email, password, is_admin, profile_picture_url, bio
        FROM users AS u
        INNER JOIN followers AS f ON f.follower_id = u.user_id
        WHERE f.followee_id = $1;
        "#,
        user.user_id
    )
    .fetch_all(db_pool)
    .await?;

    Ok(recs)
}

pub async fn create_user(
    db_pool: &PgPool,
    name: &String,
    tag: &String,
    email: &String,
    password: &String,
    profile_picture_url: Option<&str>,
    bio: Option<&str>,
) -> anyhow::Result<UserRecord> {
    let rec: UserRecord = sqlx::query_as!(
        UserRecord,
        r#"
        INSERT INTO users (name, tag, email, password, profile_picture_url, bio)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, name, tag, email, password, is_admin, profile_picture_url, bio
        "#,
        name,
        tag,
        email,
        password,
        profile_picture_url,
        bio,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}

pub async fn create_follow(
    db_pool: &PgPool,
    follower_id: &uuid::Uuid,
    followee_id: &uuid::Uuid,
) -> anyhow::Result<FollowersRecord> {
    let rec: FollowersRecord = sqlx::query_as!(
        FollowersRecord,
        r#"
        INSERT INTO followers (follower_id, followee_id)
        VALUES ($1, $2)
        RETURNING follow_id, follower_id, followee_id
        "#,
        follower_id,
        followee_id,
    )
    .fetch_one(db_pool)
    .await?;

    Ok(rec)
}
