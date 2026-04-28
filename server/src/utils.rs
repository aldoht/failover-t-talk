use std::sync::LazyLock;

use regex::Regex;

static RE_EMAIL: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$").unwrap());
static RE_TAG: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^[\w!]+$").unwrap());
static RE_NAME: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^[a-zA-Z\s]+$").unwrap());

// Max 50 chars
pub fn valid_email(email: &str) -> bool {
    email.chars().count() <= 50 && RE_EMAIL.is_match(email)
}

// At least 1 uppercase, 1 special char (!@#$&*_-), 2 numbers, 8 chars
pub fn valid_password(password: &str) -> bool {
    let long_enough = password.len() >= 8;
    let has_uppercase = password.chars().any(|c| c.is_uppercase());
    let has_special = password.chars().any(|c| "!@#$&*_-".contains(c));
    let has_two_numbers = password.chars().filter(|c| c.is_ascii_digit()).count() >= 2;
    
    long_enough && has_uppercase && has_special && has_two_numbers
}

// Max 15 chars
pub fn valid_tag(tag: &str) -> bool {
    tag.chars().count() <= 15 && RE_TAG.is_match(tag)
}

// Max 30 chars
pub fn valid_name(name: &str) -> bool {
    !name.is_empty() && name.chars().count() <= 30 && RE_NAME.is_match(name)
}

// Max 500 chars
pub fn valid_url(url: &str) -> bool {
    !url.is_empty() && url.chars().count() <= 500
}