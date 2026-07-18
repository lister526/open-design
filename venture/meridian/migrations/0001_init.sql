-- Meridian database schema (Cloudflare D1 / SQLite)
-- Real backend persistence: users, charts, conversations, messages, subscriptions, referrals, events.

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,          -- uuid
  email        TEXT UNIQUE,
  password_hash TEXT,                      -- PBKDF2 hash (nullable for guest)
  name         TEXT,
  locale       TEXT DEFAULT 'zh',
  plan         TEXT DEFAULT 'free',        -- free | plus | pro
  credits      INTEGER DEFAULT 3,          -- free deep-reading / question credits
  referral_code TEXT UNIQUE,
  referred_by  TEXT,                       -- referral_code of inviter
  created_at   INTEGER,
  updated_at   INTEGER
);

-- A user's birth data + computed chart (BaZi + Zi Wei + luck cycles), stored as JSON.
CREATE TABLE IF NOT EXISTS charts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,
  label       TEXT,                        -- "self" / partner name / etc.
  gender      TEXT,                        -- male | female
  birth_date  TEXT,                        -- YYYY-MM-DD (solar)
  birth_time  TEXT,                        -- HH:MM (local clock)
  birth_place TEXT,
  longitude   REAL,
  computed    TEXT,                        -- JSON: bazi, ziwei palaces, luck pillars, elements
  created_at  INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat threads (the "AI life advisor" conversations) — this is the retention engine.
CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,
  chart_id    TEXT,
  title       TEXT,
  topic       TEXT,                        -- career | love | timing | wealth | general
  created_at  INTEGER,
  updated_at  INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT,
  role            TEXT,                     -- user | assistant | system
  content         TEXT,
  tokens          INTEGER DEFAULT 0,
  created_at      INTEGER,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Long-term memory facts the AI extracts about the user (makes it feel "it remembers me").
CREATE TABLE IF NOT EXISTS memories (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  kind       TEXT,                          -- goal | relationship | job | worry | preference
  content    TEXT,
  weight     REAL DEFAULT 1.0,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,
  plan        TEXT,                          -- plus | pro
  status      TEXT,                          -- active | canceled | past_due
  provider    TEXT,                          -- stripe | demo
  external_id TEXT,
  current_period_end INTEGER,
  created_at  INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  product    TEXT,
  amount     REAL,
  currency   TEXT,
  status     TEXT,                           -- paid | pending | refunded
  provider   TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  name       TEXT,                           -- signup | chart_created | message_sent | upgrade | share
  props      TEXT,
  created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_charts_user ON charts(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mem_user ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
