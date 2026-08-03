-- NovaCode v2 Phase G: per-user LeetCode username, replacing the previously
-- hardcoded server-side default for GET /api/v1/leetcode-stats. Nullable —
-- a user with no leetcode_username set falls back to the app-wide
-- LEETCODE_USERNAME env var default.
ALTER TABLE users ADD COLUMN leetcode_username VARCHAR(64) NULL;
