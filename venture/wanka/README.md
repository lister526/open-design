# Wanka · AI 营销内容创作网络

> **一句话：** 3 分钟把一个产品变成一整套「会卖货」的本地化图片指令、短视频脚本、广告文案与商品描述；好作品变模板，被别人复用、创作者变现，**越用越强**。
>
> **战略依据（必读）：** `../research/03_platform_archetype_decision.md`（$100B 平台原型决策）
> **创业资料包：** `../founding_kit/00_MASTER_PLAN.md` 起

这是 **成熟可用** 的多端产品，一套后端 API 同时服务：
- ✅ **Web**（Cloudflare Workers + Hono + D1 + 零构建 vanilla-JS SPA）—— 可直接运行
- ✅ **微信小程序**（`miniprogram/`，原生小程序，复用同一 API）
- ✅ **iOS / Android**（`mobile/`，Expo/RN 客户端契约，复用同一 API）
- ✅ **广告投放接口**（AppLovin MAX + Meta，`src/ads.js` + `docs/AD_INTEGRATION.md`）
- ✅ **9 种语言**本地化生成（zh/en/ja/ko/es/pt/ar/hi/fr）

## 产品三层（对应护城河）
1. **单机层** — 上传产品即得成套素材（无需其他用户即有用 → 跨过冷启动死亡区）。
2. **网络层** — 好作品变可复用模板（remix 图谱）+ 创作者身份/粉丝/收入。
3. **市场层** — 模板/创作者市场 + 抽成 + **结果/成交数据**（GPT 复制不了的护城河）。

## 快速开始（本地）
```bash
cd venture/wanka
npm install
npm run migrate      # 建表 + 种子 200 模板（0002）
npm run dev          # http://localhost:8788
# 另开终端跑端到端测试：
npm test             # BASE=http://localhost:8788 bash tests/smoke.sh  → 15 passed
```

## 目录
```
wanka/
├── src/
│   ├── index.js       # Hono API（auth/projects/generate/templates/marketplace/metrics）
│   ├── generator.js   # 生成引擎（默认确定性 mock，可切真·OpenAI）
│   ├── ads.js         # 广告接口（AppLovin/Meta 配置 + Meta 创意构造）
│   └── util.js        # id/时间/密码哈希/HMAC token（Web Crypto，无外部依赖）
├── public/            # Web SPA：index.html / app.js / i18n.js / styles.css
├── miniprogram/       # 微信小程序（app.json + 4 pages + utils）
├── mobile/            # Expo/RN 客户端（api.js + app.json + README）
├── migrations/        # 0001_init.sql（含护城河表）+ 0002_seed_templates.sql
├── tests/smoke.sh     # 15 项端到端测试
├── docs/AD_INTEGRATION.md
├── wrangler.toml      # D1 + assets 绑定 + feature flags
└── .dev.vars.example  # 复制为 .dev.vars（含 JWT_SECRET / 可选 OPENAI_API_KEY）
```

## 真·AI 开关
默认 `ENABLE_REAL_AI="false"` → 用确定性 mock（零成本、始终可跑、可测）。
配好 `OPENAI_API_KEY` 且置 `true` → 调真模型；任何上游错误自动回退 mock，产品永不硬失败。

## 数据模型即护城河
`migrations/0001_init.sql` 刻意建了：`templates`（remix 图谱）、`template_usage`（交互数据）、
`earnings`（创作者收入=切换成本）、`events`（北极星指标）。这些表就是"越用越强"的物理载体。

## 部署
```bash
wrangler d1 create wanka-db          # 拿到 database_id 填回 wrangler.toml
wrangler d1 migrations apply wanka-db --remote
wrangler secret put JWT_SECRET
wrangler secret put OPENAI_API_KEY   # 可选
wrangler deploy
```

## 合规（与"不欺骗客户"一致）
明示 AI 生成；不伪造评价/GMV/ROI；遵守中国生成式AI/算法备案/个保法与各平台政策；内容红线见 `../founding_kit/04_moat_and_risk.md`。

## 测试状态
- JS 语法：全部 `node --check` 通过。
- 端到端：`tests/smoke.sh` → **15 passed / 0 failed**（健康/配置/注册/生成/模板/用模板/上报成交/额度402/升级/北极星）。
- Web：Playwright 加载无 console 错误，静态资源 200。
- 小程序 / 移动端：JSON+JS 全部校验通过。
