-- Phase 5 (Practice Method): spaced-repetition trigger log.
-- Column is `trigger_text`, not `trigger` — TRIGGER is a reserved word in MySQL.

CREATE TABLE trigger_entries (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email          VARCHAR(255) NOT NULL,
    leetcode_id         VARCHAR(64)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    trigger_text        TEXT NOT NULL,
    missed_observation  TEXT NULL,
    pattern_slug        VARCHAR(64)  NULL,
    created_at          DATETIME(6)  NOT NULL,
    review_stage        INT NOT NULL DEFAULT 0,
    next_review_at      DATETIME(6)  NOT NULL,
    last_review_result  VARCHAR(16)  NULL,
    last_reviewed_at    DATETIME(6)  NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_trigger_entries_user_email ON trigger_entries (user_email);
CREATE INDEX idx_trigger_entries_due ON trigger_entries (user_email, review_stage, next_review_at);

CREATE TABLE trigger_entry_reuse_in (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    entry_id BIGINT NOT NULL,
    context  TEXT NOT NULL,
    CONSTRAINT fk_trigger_entry_reuse_in_entry FOREIGN KEY (entry_id) REFERENCES trigger_entries (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_trigger_entry_reuse_in_entry_id ON trigger_entry_reuse_in (entry_id);
