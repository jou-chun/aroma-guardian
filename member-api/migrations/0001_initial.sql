PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS line_users (
  line_user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  picture_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT UNIQUE,
  formal_name TEXT NOT NULL,
  tier_code TEXT NOT NULL CHECK (tier_code IN ('A', 'B', 'C')),
  support_amount INTEGER NOT NULL CHECK (support_amount IN (100, 200, 500)),
  access_status TEXT NOT NULL CHECK (access_status IN ('active', 'payment_required', 'disabled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('not_required', 'pending', 'paid')),
  line_user_id TEXT UNIQUE REFERENCES line_users(line_user_id),
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS members_formal_name_idx ON members(formal_name);
CREATE INDEX IF NOT EXISTS members_access_status_idx ON members(access_status);

CREATE TABLE IF NOT EXISTS link_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_id TEXT NOT NULL REFERENCES line_users(line_user_id),
  formal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  matched_member_id INTEGER REFERENCES members(id),
  reviewed_by TEXT REFERENCES line_users(line_user_id),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_link_request_per_user
  ON link_requests(line_user_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash TEXT PRIMARY KEY,
  code_verifier TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE INDEX IF NOT EXISTS oauth_states_expiry_idx ON oauth_states(expires_at);

CREATE TABLE IF NOT EXISTS login_exchange_codes (
  code_hash TEXT PRIMARY KEY,
  line_user_id TEXT NOT NULL REFERENCES line_users(line_user_id),
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE INDEX IF NOT EXISTS exchange_codes_expiry_idx ON login_exchange_codes(expires_at);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  line_user_id TEXT NOT NULL REFERENCES line_users(line_user_id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(line_user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_line_user_id TEXT REFERENCES line_users(line_user_id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  detail_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at);
