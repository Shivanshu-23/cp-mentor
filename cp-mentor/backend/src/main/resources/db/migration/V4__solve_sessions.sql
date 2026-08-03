-- Phase 4 (Practice Method): the solve worksheet.

CREATE TABLE solve_sessions (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email             VARCHAR(255) NOT NULL,
    leetcode_id            VARCHAR(64)  NOT NULL,
    title                  VARCHAR(255) NOT NULL,
    difficulty             VARCHAR(16)  NULL,
    pattern_slug           VARCHAR(64)  NULL,
    started_at             DATETIME(6)  NOT NULL,
    ended_at               DATETIME(6)  NULL,
    duration_seconds       INT NULL,
    submission_count       INT NOT NULL DEFAULT 0,
    solved_unaided         BOOLEAN NOT NULL DEFAULT FALSE,
    highest_hint_level     INT NOT NULL DEFAULT 0,
    stuck_rung             INT NULL,
    constraint_notes       TEXT NULL,
    target_complexity      VARCHAR(255) NULL,
    restatement            TEXT NULL,
    brute_force_idea       TEXT NULL,
    brute_force_complexity VARCHAR(255) NULL,
    hand_solve_notes       TEXT NULL,
    bottleneck_statement   TEXT NULL,
    final_approach         TEXT NULL,
    final_complexity       VARCHAR(255) NULL,
    code_snapshot          TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_solve_sessions_user_email ON solve_sessions (user_email);

CREATE TABLE solve_session_moves_fired (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    move       VARCHAR(32) NOT NULL,
    CONSTRAINT fk_solve_session_moves_fired_session FOREIGN KEY (session_id) REFERENCES solve_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_solve_session_moves_fired_session_id ON solve_session_moves_fired (session_id);

CREATE TABLE solve_session_edge_cases_checked (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    edge_case  TEXT NOT NULL,
    CONSTRAINT fk_solve_session_edge_cases_checked_session FOREIGN KEY (session_id) REFERENCES solve_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_solve_session_edge_cases_checked_session_id ON solve_session_edge_cases_checked (session_id);
