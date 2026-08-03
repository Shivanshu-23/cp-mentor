-- Phase 1 (Practice Method): pattern reference library.

CREATE TABLE patterns (
    id                            BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug                          VARCHAR(64)  NOT NULL,
    name                          VARCHAR(128) NOT NULL,
    category                      VARCHAR(32)  NOT NULL,
    intuition                     TEXT NULL,
    java_template                 TEXT NULL,
    time_complexity               VARCHAR(512) NULL,
    space_complexity              VARCHAR(512) NULL,
    why_complexity_is_not_obvious TEXT NULL,
    variants                      TEXT NULL,
    difficulty_to_learn           INT NOT NULL DEFAULT 1,
    frequency_score               INT NOT NULL DEFAULT 1,
    CONSTRAINT uk_patterns_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pattern_recognition_triggers (
    pattern_id     BIGINT NOT NULL,
    trigger_phrase TEXT NOT NULL,
    CONSTRAINT fk_pattern_recognition_triggers_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_recognition_triggers_pattern_id ON pattern_recognition_triggers (pattern_id);

CREATE TABLE pattern_anti_triggers (
    pattern_id     BIGINT NOT NULL,
    trigger_phrase TEXT NOT NULL,
    CONSTRAINT fk_pattern_anti_triggers_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_anti_triggers_pattern_id ON pattern_anti_triggers (pattern_id);

CREATE TABLE pattern_common_mistakes (
    pattern_id BIGINT NOT NULL,
    mistake    TEXT NOT NULL,
    CONSTRAINT fk_pattern_common_mistakes_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_common_mistakes_pattern_id ON pattern_common_mistakes (pattern_id);

CREATE TABLE pattern_edge_case_checklist (
    pattern_id BIGINT NOT NULL,
    edge_case  TEXT NOT NULL,
    CONSTRAINT fk_pattern_edge_case_checklist_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_edge_case_checklist_pattern_id ON pattern_edge_case_checklist (pattern_id);

CREATE TABLE pattern_interview_follow_ups (
    pattern_id BIGINT NOT NULL,
    question   TEXT NOT NULL,
    CONSTRAINT fk_pattern_interview_follow_ups_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_interview_follow_ups_pattern_id ON pattern_interview_follow_ups (pattern_id);

CREATE TABLE pattern_related_patterns (
    pattern_id   BIGINT NOT NULL,
    related_slug VARCHAR(64) NOT NULL,
    CONSTRAINT fk_pattern_related_patterns_pattern FOREIGN KEY (pattern_id) REFERENCES patterns (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_related_patterns_pattern_id ON pattern_related_patterns (pattern_id);

CREATE TABLE pattern_problems (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    pattern_slug  VARCHAR(64)  NOT NULL,
    leetcode_id   VARCHAR(64)  NOT NULL,
    title         VARCHAR(255) NOT NULL,
    url           VARCHAR(1024) NOT NULL,
    difficulty    VARCHAR(16)  NULL,
    striver_step  VARCHAR(128) NULL,
    role          VARCHAR(16)  NOT NULL,
    order_index   INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_pattern_problems_slug_leetcode UNIQUE (pattern_slug, leetcode_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pattern_problems_pattern_slug ON pattern_problems (pattern_slug);

CREATE TABLE resources (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    pattern_slug VARCHAR(64) NULL,
    title        VARCHAR(255) NOT NULL,
    url          VARCHAR(1024) NOT NULL,
    type         VARCHAR(16) NOT NULL,
    provider     VARCHAR(128) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_resources_pattern_slug ON resources (pattern_slug);
