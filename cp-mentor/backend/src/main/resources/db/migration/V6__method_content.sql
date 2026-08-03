-- NovaCode v2 Phase E: Method content — static/seeded reference data queried
-- by the frontend, not user-generated. Every table gets an explicit PK
-- (including element-collection join tables) per the project's established
-- managed-MySQL (sql_require_primary_key=ON) requirement.

CREATE TABLE method_phases (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_index             INT NOT NULL,
    name                    VARCHAR(128) NOT NULL,
    purpose                 TEXT NOT NULL,
    time_budget_minutes     INT NOT NULL,
    what_to_write_down      TEXT NOT NULL,
    failure_mode_prevented  TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE complexity_budgets (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_index         INT NOT NULL,
    max_n_label         VARCHAR(32)  NOT NULL,
    target_complexity   VARCHAR(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE complexity_budget_techniques (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    complexity_budget_id  BIGINT NOT NULL,
    technique             VARCHAR(255) NOT NULL,
    CONSTRAINT fk_cbt_budget FOREIGN KEY (complexity_budget_id) REFERENCES complexity_budgets (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_cbt_budget_id ON complexity_budget_techniques (complexity_budget_id);

CREATE TABLE optimization_moves (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(64)  NOT NULL,
    name              VARCHAR(128) NOT NULL,
    trigger_question  TEXT NOT NULL,
    trigger_phrase    VARCHAR(255) NOT NULL,
    CONSTRAINT uk_optimization_moves_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE optimization_move_techniques (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    optimization_move_id  BIGINT NOT NULL,
    technique             VARCHAR(255) NOT NULL,
    CONSTRAINT fk_omt_move FOREIGN KEY (optimization_move_id) REFERENCES optimization_moves (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_omt_move_id ON optimization_move_techniques (optimization_move_id);

CREATE TABLE optimization_move_examples (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    optimization_move_id  BIGINT NOT NULL,
    example_problem       VARCHAR(255) NOT NULL,
    CONSTRAINT fk_ome_move FOREIGN KEY (optimization_move_id) REFERENCES optimization_moves (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ome_move_id ON optimization_move_examples (optimization_move_id);

CREATE TABLE stuck_rungs (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    rung                INT NOT NULL,
    name                VARCHAR(128) NOT NULL,
    description         TEXT NOT NULL,
    time_budget_minutes INT NOT NULL,
    cost_of_skipping    TEXT NOT NULL,
    CONSTRAINT uk_stuck_rungs_rung UNIQUE (rung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recovery_steps (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_index  INT NOT NULL,
    name         VARCHAR(128) NOT NULL,
    description  TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Static phrase -> pattern dictionary. Distinct from `trigger_entries`
-- (the user's personal spaced-repetition log, V5) — this is reference data,
-- that is user-generated data. Do not confuse the two.
CREATE TABLE trigger_phrases (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    phrase        VARCHAR(255) NOT NULL,
    pattern_slug  VARCHAR(64)  NOT NULL,
    confidence    DOUBLE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_trigger_phrases_phrase ON trigger_phrases (phrase);

CREATE TABLE trigger_phrase_anti_triggers (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    trigger_phrase_id   BIGINT NOT NULL,
    anti_trigger_phrase VARCHAR(255) NOT NULL,
    misleads_to_pattern_slug VARCHAR(64) NOT NULL,
    CONSTRAINT fk_tpat_phrase FOREIGN KEY (trigger_phrase_id) REFERENCES trigger_phrases (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_tpat_phrase_id ON trigger_phrase_anti_triggers (trigger_phrase_id);

CREATE TABLE topic_priorities (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_rank           INT NOT NULL,
    name                 VARCHAR(128) NOT NULL,
    estimated_hours      DOUBLE NOT NULL,
    interview_frequency  INT NOT NULL,
    CONSTRAINT uk_topic_priorities_rank UNIQUE (topic_rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE topic_priority_prerequisites (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_priority_id    BIGINT NOT NULL,
    prerequisite_topic   VARCHAR(128) NOT NULL,
    CONSTRAINT fk_tpp_topic FOREIGN KEY (topic_priority_id) REFERENCES topic_priorities (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_tpp_topic_id ON topic_priority_prerequisites (topic_priority_id);

CREATE TABLE interview_script_steps (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_index  INT NOT NULL,
    name         VARCHAR(128) NOT NULL,
    description  TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
