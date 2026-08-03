-- Phase 3 (Practice Method): rate-limit bookkeeping for progressive hints.
-- No AI provider is used anywhere in this module — hints are generated entirely
-- from data already stored in `patterns` (see HintService).

CREATE TABLE hint_requests (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email          VARCHAR(255) NOT NULL,
    problem_identifier  VARCHAR(255) NOT NULL,
    level               INT NOT NULL,
    requested_at        DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_hint_requests_user_problem ON hint_requests (user_email, problem_identifier);
