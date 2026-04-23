CREATE TABLE users (
    user_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(30) NOT NULL,
    tag         VARCHAR(15) NOT NULL UNIQUE,
    email       VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    is_admin    BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE posts (
    post_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text            VARCHAR(280) NOT NULL,
    creation_date   DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE comments (
    comment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text            VARCHAR(280) NOT NULL,
    creation_date   DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE media (
    media_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url             VARCHAR(500) NOT NULL,
    post_id         UUID REFERENCES posts(post_id) ON DELETE CASCADE,
    comment_id      UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
    CONSTRAINT media_one_parent CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE TABLE likes (
    like_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id         UUID REFERENCES posts(post_id) ON DELETE CASCADE,
    comment_id      UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
    creation_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT likes_one_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    CONSTRAINT likes_unique_post    UNIQUE (user_id, post_id),
    CONSTRAINT likes_unique_comment UNIQUE (user_id, comment_id)
);

CREATE TABLE followers (
    follow_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followed_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    follows_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT followers_no_self_follow CHECK (followed_id <> follows_id),
    CONSTRAINT followers_unique UNIQUE (followed_id, follows_id)
);