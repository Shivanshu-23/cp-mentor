-- Baseline schema for the pre-Practice-Method state of NovaCode (cp-mentor).
-- Mirrors what Hibernate's `create-drop` used to generate against H2; now owned by Flyway.

CREATE TABLE users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(255) NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(32)  NOT NULL DEFAULT 'USER',
    streak_count   INT          NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE problems (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    leetcode_id     VARCHAR(64)  NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NULL,
    difficulty      VARCHAR(16)  NULL,
    description     TEXT NULL,
    constraints     TEXT NULL,
    example_input   VARCHAR(1024) NULL,
    example_output  VARCHAR(1024) NULL,
    fetched_at      DATETIME(6) NOT NULL,
    CONSTRAINT uk_problems_leetcode_id UNIQUE (leetcode_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE problem_topics (
    problem_id  BIGINT NOT NULL,
    topic       VARCHAR(255) NOT NULL,
    CONSTRAINT fk_problem_topics_problem FOREIGN KEY (problem_id) REFERENCES problems (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_problem_topics_problem_id ON problem_topics (problem_id);

CREATE TABLE daily_challenges (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id      BIGINT NOT NULL,
    challenge_date  DATE NOT NULL,
    leetcode_link   VARCHAR(1024) NULL,
    fetched_at      DATETIME(6) NOT NULL,
    CONSTRAINT uk_daily_challenges_date UNIQUE (challenge_date),
    CONSTRAINT fk_daily_challenges_problem FOREIGN KEY (problem_id) REFERENCES problems (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_problems (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    leetcode_id      VARCHAR(64)  NOT NULL,
    url              VARCHAR(1024) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    difficulty       VARCHAR(16)  NULL,
    company          VARCHAR(128) NULL,
    timeframe        VARCHAR(64)  NULL,
    acceptance_rate  VARCHAR(16)  NULL,
    frequency        VARCHAR(16)  NULL,
    CONSTRAINT uk_company_problems_id_company_timeframe UNIQUE (leetcode_id, company, timeframe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_company_problems_company ON company_problems (company);

CREATE TABLE user_problem_progress (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email    VARCHAR(255) NOT NULL,
    leetcode_id   VARCHAR(64)  NOT NULL,
    tick_count    INT NOT NULL DEFAULT 0,
    last_updated  DATETIME(6) NOT NULL,
    CONSTRAINT uk_user_problem_progress_email_leetcode UNIQUE (user_email, leetcode_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
