PRAGMA defer_foreign_keys = ON;

CREATE TABLE members_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT UNIQUE,
  formal_name TEXT NOT NULL,
  tier_code TEXT NOT NULL CHECK (tier_code IN ('LEMON', 'FRANKINCENSE')),
  support_amount INTEGER NOT NULL CHECK (support_amount IN (100, 300)),
  access_status TEXT NOT NULL CHECK (access_status IN ('active', 'payment_required', 'disabled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid')),
  line_user_id TEXT UNIQUE REFERENCES line_users(line_user_id),
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE link_requests_backup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_id TEXT NOT NULL,
  formal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  matched_member_id INTEGER,
  reviewed_by TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

INSERT INTO members_new (
  id, source_key, formal_name, tier_code, support_amount, access_status,
  payment_status, line_user_id, note, created_at, updated_at
)
SELECT
  id,
  source_key,
  COALESCE(
    (SELECT display_name FROM line_users WHERE line_users.line_user_id = members.line_user_id),
    formal_name
  ),
  CASE WHEN tier_code = 'A' THEN 'LEMON' ELSE 'FRANKINCENSE' END,
  CASE WHEN tier_code = 'A' THEN 300 ELSE 100 END,
  access_status,
  CASE WHEN access_status = 'active' OR payment_status = 'paid' THEN 'paid' ELSE 'pending' END,
  line_user_id,
  note,
  created_at,
  updated_at
FROM members;

INSERT INTO link_requests_backup (
  id, line_user_id, formal_name, status, matched_member_id,
  reviewed_by, created_at, reviewed_at
)
SELECT
  id, line_user_id, formal_name, status, matched_member_id,
  reviewed_by, created_at, reviewed_at
FROM link_requests;

DROP TABLE link_requests;
DROP TABLE members;
ALTER TABLE members_new RENAME TO members;

CREATE TABLE link_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_id TEXT NOT NULL REFERENCES line_users(line_user_id),
  formal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  matched_member_id INTEGER REFERENCES members(id),
  reviewed_by TEXT REFERENCES line_users(line_user_id),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

INSERT INTO link_requests (
  id, line_user_id, formal_name, status, matched_member_id,
  reviewed_by, created_at, reviewed_at
)
SELECT
  id, line_user_id, formal_name, status, matched_member_id,
  reviewed_by, created_at, reviewed_at
FROM link_requests_backup;

DROP TABLE link_requests_backup;

CREATE INDEX members_formal_name_idx ON members(formal_name);
CREATE INDEX members_access_status_idx ON members(access_status);
CREATE UNIQUE INDEX one_pending_link_request_per_user
  ON link_requests(line_user_id) WHERE status = 'pending';

PRAGMA optimize;
