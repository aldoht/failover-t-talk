use axum::response::{IntoResponse, Response};
use axum::http::StatusCode;

pub enum AppError {
    NotFound(&'static str),
    Internal(&'static str),
    BadRequest(&'static str),
    Conflict(&'static str),
    Unauthorized(&'static str),
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            sqlx::Error::RowNotFound => AppError::NotFound("Resource not found."),
            other => {
                tracing::error!(error = ?other, "database error");
                AppError::Internal("Internal error.")
            }
        }
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(e: jsonwebtoken::errors::Error) -> Self {
        use jsonwebtoken::errors::ErrorKind;
        match e.kind() {
            ErrorKind::ExpiredSignature => AppError::Unauthorized("Token expired."),
            ErrorKind::InvalidToken
            | ErrorKind::InvalidSignature
            | ErrorKind::InvalidIssuer
            | ErrorKind::InvalidAudience => AppError::Unauthorized("Invalid token."),
            _ => {
                tracing::error!(error = ?e, "jwt error");
                AppError::Internal("Could not process token.")
            }
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match self {
            AppError::NotFound(m)   => (StatusCode::NOT_FOUND, m),
            AppError::Internal(m)   => (StatusCode::INTERNAL_SERVER_ERROR, m),
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m),
            AppError::Conflict(m)   => (StatusCode::CONFLICT, m),
            AppError::Unauthorized(m) => (StatusCode::UNAUTHORIZED, m),
        };
        (status, msg).into_response()
    }
}
