-- Wanka schema v1
-- Encodes the moat: users, projects, generated assets, templates (remix graph),
-- template_usage (interaction/outcome data), creator_earnings, outcomes (conversion signal).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE,
  password_hash TEXT,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'merchant',   -- merchant | creator | admin
  plan          TEXT NOT NULL DEFAULT 'free',        -- free | starter | pro | team
  credits       INTEGER NOT NULL DEFAULT 20,         -- generation credits remaining
  lang          TEXT NOT NULL DEFAULT 'zh',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- A merchant's product/store input
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  product     TEXT,           -- product name
  category    TEXT,           -- 3c | home | beauty | apparel | other
  audience    TEXT,           -- target audience / market
  selling_pts TEXT,           -- raw selling points (user text)
  tone        TEXT DEFAULT 'energetic',
  target_langs TEXT DEFAULT 'zh,en',  -- comma list
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- A generated content set (single-player value layer)
CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  kind        TEXT NOT NULL,       -- image_brief | video_script | ad_copy | listing
  lang        TEXT NOT NULL,
  content     TEXT NOT NULL,       -- JSON payload
  template_id TEXT,                -- if generated from a template (remix graph edge)
  published   INTEGER NOT NULL DEFAULT 0,  -- has the merchant published it (viral loop)
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS idx_assets_project ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);

-- Templates = the network/remix graph (the moat)
CREATE TABLE IF NOT EXISTS templates (
  id           TEXT PRIMARY KEY,
  author_id    TEXT,               -- creator (NULL = seeded by platform)
  title        TEXT NOT NULL,
  kind         TEXT NOT NULL,      -- image_brief | video_script | ad_copy | listing
  category     TEXT,
  recipe       TEXT NOT NULL,      -- JSON: prompt structure + style + slots
  preview      TEXT,               -- short preview text
  price_cents  INTEGER NOT NULL DEFAULT 0,   -- 0 = free
  uses         INTEGER NOT NULL DEFAULT 0,   -- popularity
  wins         INTEGER NOT NULL DEFAULT 0,   -- outcome signal (reported conversions)
  status       TEXT NOT NULL DEFAULT 'published', -- draft | published | removed
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_templates_kind ON templates(kind);
CREATE INDEX IF NOT EXISTS idx_templates_uses ON templates(uses DESC);

-- Interaction/outcome data: who used which template, and did it convert
CREATE TABLE IF NOT EXISTS template_usage (
  id          TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  asset_id    TEXT,
  outcome     TEXT DEFAULT 'used',  -- used | published | reported_win
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (template_id) REFERENCES templates(id)
);
CREATE INDEX IF NOT EXISTS idx_usage_template ON template_usage(template_id);

-- Creator earnings ledger (retention / switching cost)
CREATE TABLE IF NOT EXISTS earnings (
  id          TEXT PRIMARY KEY,
  creator_id  TEXT NOT NULL,
  template_id TEXT,
  amount_cents INTEGER NOT NULL,
  reason      TEXT,               -- template_sale | subscription_share | bonus
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_earnings_creator ON earnings(creator_id);

-- Simple event log for North-Star metric + growth analytics
CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  name       TEXT NOT NULL,       -- generate | publish | template_create | template_use | signup | checkout
  meta       TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
