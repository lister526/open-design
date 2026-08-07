-- 0003_sync.sql — 子午·合盘（Meridian Sync）关系/缘分方向
-- 新增：关系(合盘)记录、合盘报告、分享卡、真实反馈。复用既有 users/charts/orders/subscriptions/events。

-- 一次合盘 = 两个人的出生信息 + 关系类型。person_b 可为匿名（未注册对方也能测）。
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rel_type TEXT NOT NULL DEFAULT 'romance',   -- romance|crush|reunion|marriage|friendship
  name_a TEXT, name_b TEXT,
  -- A/B 的出生信息（直接内联，避免强依赖 charts 表；也可关联已存 chart）
  a_gender TEXT, a_date TEXT, a_time TEXT, a_place TEXT, a_lon REAL,
  b_gender TEXT, b_date TEXT, b_time TEXT, b_place TEXT, b_lon REAL,
  status TEXT NOT NULL DEFAULT 'active',       -- active|archived
  paid INTEGER NOT NULL DEFAULT 0,             -- 是否已解锁完整报告
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_rel_user ON relationships(user_id, updated_at);

-- 一份生成的合盘报告快照（免费 hook + 完整内容）。计算结果落库，避免重复计算并可回溯。
CREATE TABLE IF NOT EXISTS sync_reports (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'compat',         -- compat|reunion|marriage|annual
  overall INTEGER,
  keyword TEXT,
  payload TEXT NOT NULL,                        -- JSON: 完整 synastry() 结果
  locked INTEGER NOT NULL DEFAULT 1,            -- 1=完整内容未解锁(仅 hook)；0=已解锁
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_report_rel ON sync_reports(relationship_id);
CREATE INDEX IF NOT EXISTS idx_report_user ON sync_reports(user_id, created_at);

-- 分享卡：公开可访问（通过 slug），用于病毒传播。不含出生隐私，只含缘分关键词/分数。
CREATE TABLE IF NOT EXISTS share_cards (
  slug TEXT PRIMARY KEY,
  user_id TEXT,
  relationship_id TEXT,
  title TEXT,
  keyword TEXT,
  overall INTEGER,
  dims TEXT,                                    -- JSON 维度分
  rel_type TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  converts INTEGER NOT NULL DEFAULT 0,          -- 由此卡进入并注册/测算的人数
  created_at INTEGER NOT NULL
);

-- 真实关系反馈（校准命中感 + 数据飞轮 + 护城河）。
CREATE TABLE IF NOT EXISTS sync_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  relationship_id TEXT,
  report_id TEXT,
  accuracy TEXT,                                -- accurate|partly|inaccurate
  outcome TEXT,                                 -- 用户描述后来发生了什么
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON sync_feedback(user_id);

-- 渠道/邀请归因（渠道码 & 分享卡回流）。
CREATE TABLE IF NOT EXISTS attributions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  channel TEXT,                                 -- share_card|ref_code|kol_code|seo|direct
  ref TEXT,                                     -- slug / code
  created_at INTEGER NOT NULL
);
