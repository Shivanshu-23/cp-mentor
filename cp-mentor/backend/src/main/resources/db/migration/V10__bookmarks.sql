-- Bookmarks on patterns or problems, with an optional revision note.
CREATE TABLE bookmarks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email  VARCHAR(255) NOT NULL,
    item_type   VARCHAR(16)  NOT NULL,
    item_key    VARCHAR(64)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    note        TEXT NULL,
    created_at  DATETIME(6)  NOT NULL,
    CONSTRAINT uq_bookmarks_user_item UNIQUE (user_email, item_type, item_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_bookmarks_user_email ON bookmarks (user_email, created_at);
