-- Yodh worksheet history — a SQL record of every worksheet saved, independent
-- of whether the GitHub sync succeeded, so nothing is lost if GITHUB_PAT
-- isn't configured or GitHub is briefly unreachable (see GlobalExceptionHandler
-- / GitHubWorksheetService: the commit can fail without this row failing).

CREATE TABLE worksheets (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email         VARCHAR(255) NOT NULL,
    problem            VARCHAR(255) NOT NULL,
    lc_number          VARCHAR(16)  NULL,
    difficulty         VARCHAR(16)  NULL,
    markdown           MEDIUMTEXT   NOT NULL,
    github_path        VARCHAR(512) NULL,
    github_commit_url  VARCHAR(512) NULL,
    created_at         DATETIME(6)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_worksheets_user_email ON worksheets (user_email, created_at);
