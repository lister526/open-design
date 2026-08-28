-- 0002_decision_os.sql — Decision-OS core + payment/consent hardening
-- [IMPLEMENTED] Applies on top of 0001_init.sql.
-- Money is INTEGER minor units (分). Times are epoch ms (UTC).

-- ---- user hardening: consent + entitlement fields ----
ALTER TABLE users ADD COLUMN memory_opt_in INTEGER NOT NULL DEFAULT 0;      -- MED-9: memory OFF by default
ALTER TABLE users ADD COLUMN monthly_ai_quota INTEGER NOT NULL DEFAULT 0;   -- server-authoritative entitlement
ALTER TABLE users ADD COLUMN ai_used_this_period INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN period_reset_at INTEGER;                        -- when quota window resets

-- ---- Decision-OS entities ----
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  statement TEXT,                 -- the real question
  deadline_at INTEGER,           -- decision deadline
  status TEXT NOT NULL DEFAULT 'open',  -- open | analyzing | decided | reviewing | closed
  goals TEXT,                    -- JSON: user goals
  values_rank TEXT,              -- JSON: ordered values
  constraints TEXT,              -- JSON: real constraints
  affordable_loss TEXT,          -- what the user can afford to lose
  reversibility TEXT,            -- reversible | partially | irreversible
  chart_id TEXT REFERENCES charts(id),  -- optional cultural lens
  model_version TEXT,            -- which AI/prompt produced the analysis
  cultural_version TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER             -- soft delete
);
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS decision_options (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id),
  label TEXT NOT NULL,
  upside TEXT,                   -- JSON/text: benefits
  downside TEXT,                 -- JSON/text: risks
  subjective_prob REAL,          -- 0..1 user/AI estimate
  worst_case TEXT,
  stop_loss TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_options_decision ON decision_options(decision_id);

CREATE TABLE IF NOT EXISTS decision_evidence (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id),
  option_id TEXT REFERENCES decision_options(id),
  kind TEXT NOT NULL,            -- fact | evidence | counter_evidence | assumption | unknown
  content TEXT NOT NULL,
  source TEXT,                   -- user | external | ai_inference | cultural
  confidence REAL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_evidence_decision ON decision_evidence(decision_id);

CREATE TABLE IF NOT EXISTS decision_actions (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id),
  content TEXT NOT NULL,
  owner TEXT,
  due_at INTEGER,
  status TEXT NOT NULL DEFAULT 'todo',  -- todo | doing | done | dropped
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_actions_decision ON decision_actions(decision_id);

CREATE TABLE IF NOT EXISTS decision_reviews (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id),
  review_at INTEGER NOT NULL,
  outcome TEXT,                  -- what actually happened
  satisfaction INTEGER,          -- 1..5
  advice_worked INTEGER,         -- 0/1
  notes TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_decision ON decision_reviews(decision_id);

-- ---- payments hardening ----
-- v1 orders.amount was REAL (float) — CRIT: never store money as float.
-- New column stores minor units (分) as INTEGER; new code uses this exclusively.
ALTER TABLE orders ADD COLUMN amount_minor INTEGER;
ALTER TABLE orders ADD COLUMN plan_code TEXT;
ALTER TABLE orders ADD COLUMN idempotency_key TEXT;

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount INTEGER,                -- minor units
  currency TEXT,
  raw TEXT,                      -- verified payload (no secrets)
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payevents_order ON payment_events(order_id);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target TEXT,
  meta TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, created_at DESC);
