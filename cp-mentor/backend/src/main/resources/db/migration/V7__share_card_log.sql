-- NovaCode v2 Phase F: rate-limit bookkeeping for POST /api/v1/stats/share-card
-- (10/day per user). Same shape as hint_requests (V3) — internal only, not
-- exposed via any API.
CREATE TABLE share_card_requests (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email    VARCHAR(255) NOT NULL,
    requested_at  DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_share_card_requests_user_time ON share_card_requests (user_email, requested_at);
