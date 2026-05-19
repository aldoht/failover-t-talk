use std::sync::LazyLock;
use url::Url;

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
pub fn valid_user_tag(tag: &str) -> bool {
    tag.chars().count() <= 15 && RE_TAG.is_match(tag)
}

// Max 30 chars
pub fn valid_name(name: &str) -> bool {
    !name.is_empty() && name.chars().count() <= 30 && RE_NAME.is_match(name)
}

pub fn valid_url(input: &str) -> bool {
    if input.is_empty() || input.len() > 2048 {
        return false;
    }

    let url = match Url::parse(input) {
        Ok(u) => u,
        Err(_) => return false,
    };

    if !matches!(url.scheme(), "http" | "https") {
        return false;
    }

    let host = match url.host_str() {
        Some(h) => h,
        None => return false,
    };

    if is_blocked_host(host) {
        return false;
    }

    if let Some(port) = url.port() {
        if port != 80 && port != 443 {
            return false;
        }
    }

    true
}

fn is_blocked_host(host: &str) -> bool {
    let host = host.to_ascii_lowercase();

    // Hostnames peligrosos
    const BLOCKED_NAMES: &[&str] = &[
        "localhost",
        "metadata.google.internal",
        "metadata",
    ];
    if BLOCKED_NAMES.contains(&host.as_str()) {
        return true;
    }

    // IPs literales: bloquear rangos privados, loopback, link-local
    if let Ok(ip) = host.parse::<std::net::IpAddr>() {
        return match ip {
            std::net::IpAddr::V4(v4) => {
                v4.is_loopback()       // 127.0.0.0/8
                || v4.is_private()      // 10/8, 172.16/12, 192.168/16
                || v4.is_link_local()   // 169.254/16 (incluye AWS metadata 169.254.169.254)
                || v4.is_unspecified()  // 0.0.0.0
                || v4.is_broadcast()
                || v4.octets()[0] == 0  // 0.0.0.0/8
            }
            std::net::IpAddr::V6(v6) => {
                v6.is_loopback()
                || v6.is_unspecified()
                // Bloquea fc00::/7 (ULA) y fe80::/10 (link-local) por prefijo
                || (v6.segments()[0] & 0xfe00) == 0xfc00
                || (v6.segments()[0] & 0xffc0) == 0xfe80
            }
        };
    }

    false
}

// Max 160 chars
pub fn valid_bio(bio: &str) -> bool {
    !bio.chars().count() > 160
}