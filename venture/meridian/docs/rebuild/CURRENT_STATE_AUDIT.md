# Meridian 现状审计 (CURRENT_STATE_AUDIT)

> 审计日期: 2026-07-26  ·  审计人: 联合创始人级执行负责人 (AI)
> 方法: 逐文件阅读源码,以**实际代码行为**为准,不采信 README 宣传。
> 结论一句话: **v1 是一个能演示、但不能安全收费、不能通过尽调的原型。** 本轮 (v2.0 P0) 已对其中最危险的一批漏洞做真实代码修复。

---

## 1. 审计范围 (实际存在的文件)

| 文件 | 行数 | 职责 |
|---|---|---|
| `src/index.js` | 240 | Hono API 全部路由 |
| `src/auth.js` | 75 | PBKDF2 哈希 + HMAC token |
| `src/ai.js` | 142 | 系统提示词 + LLM 调用 + 记忆抽取 + 降级 |
| `src/engine.js` | 321 | 八字/五行/大运/紫微 引擎 |
| `public/index.html` | 15 | SPA 壳 |
| `public/app.js` | 448 | 前端 SPA |
| `public/styles.css` | 162 | 样式 |
| `migrations/0001_init.sql` | 101 | 8 张表 |

总计约 1500 行。这是一个**单人原型**的规模,不是一个能通过技术尽调的生产系统。

---

## 2. 已确认的严重问题 (基于真实代码行号)

### CRIT-1 · 付费后门 (P0) — 已修复
- **位置**: `src/index.js` L217-230 `/api/billing/upgrade`
- **实际行为**: 任何登录用户 POST `{plan:"pro"}` → 直接 `UPDATE users SET plan='pro', credits=9999`,**无任何支付验证**。前端请求即可白嫖会员。
- **风险**: 收入直接归零;任何尽调 5 分钟内发现;是欺诈级缺陷。
- **v2.0 处置**: 删除该后门。改为 `payments` 模块:前端只能创建订单 (pending),权益只能由**经签名验证的支付回调 (webhook) 或显式标记的 Mock Provider** 授予。见 `SECURITY.md`。

### CRIT-2 · 弱密钥回退 (P0) — 已修复
- **位置**: `src/index.js` L26/L58/L66 `c.env.JWT_SECRET || 'dev-secret'`
- **实际行为**: 若生产环境忘记配置 `JWT_SECRET`,系统静默使用公开字符串 `dev-secret` 签名 session token → 任何人可伪造任意用户身份。
- **v2.0 处置**: 删除所有 `|| 'dev-secret'`。缺少 `JWT_SECRET` 时**服务拒绝启动/拒绝处理请求 (返回 500 + 明确日志)**,绝不回退。

### CRIT-3 · 额度非原子 (P0) — 已修复
- **位置**: `src/index.js` L196-200
- **实际行为**: `credits = u.credits - 1; UPDATE ... SET credits=?`。读-改-写模式,并发请求可在扣减前都读到同一余额 → 免费额度被绕过 (超发)。
- **v2.0 处置**: 改为**条件原子扣减** `UPDATE users SET credits=credits-1 WHERE id=? AND plan='free' AND credits>0`,依据 `.meta.changes` 判断是否成功;为 0 则拒绝。

### CRIT-4 · 默认静默第三方模型代理 (P0) — 已修复
- **位置**: `src/index.js` L17 `env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'`
- **实际行为**: 未配置时,用户对话正文 (含出生信息、烦恼) 默认发往一个**未向用户披露的第三方代理**。
- **v2.0 处置**: 删除硬编码默认。未显式配置供应商时**不外发**,直接走本地 chart-driven 降级顾问。供应商必须在配置中显式白名单。

### HIGH-5 · 无限流 / 无输入长度限制 (P0) — 已修复
- **位置**: 全部路由。`content` 无长度上限;注册/登录/对话无频率限制。
- **风险**: 撞库、成本轰炸 (超长 prompt)、DoS。
- **v2.0 处置**: 加入内存滑动窗口限流 (per-IP + per-user) + `content` 长度硬上限 (4000 字);登录失败限流。备注: 生产应换 Redis/Durable Object,当前实现标记 `IMPLEMENTED_WITH_INMEMORY_LIMITER`。

### HIGH-6 · 虚假宣传 (P0) — 已修复
- **位置**: `public/*`, `README.md` "100% 命中"、"无限畅聊"、"永久免费部署"。
- **风险**: 单样本命中不能宣称统计准确率;"无限"导致成本失控与消费者保护风险。
- **v2.0 处置**: 全部改为可核验措辞 ("在你的样例上逐项复现"、"清晰月度额度 + 公平使用")。

### HIGH-7 · Token 存 localStorage — 部分处置 (SCAFFOLDED)
- **位置**: `public/app.js` `localStorage.token`
- **风险**: XSS 可窃取长期身份令牌。
- **v2.0 处置**: 文档化 HttpOnly Cookie 迁移方案 (`SECURITY.md`);因 v1 前端为纯 SPA + Bearer,完整改造属 P1,本轮**未完成代码**,标记 `SCAFFOLDED`。

### MED-8 · 命理引擎宣传过度 — 部分处置
- **实际**: `engine.js` 紫微仅实现主星,喜用神为简化比例映射,却被 README 宣称"完整精确/分钟级"。
- **v2.0 处置**: 引擎输出改为携带 `disclaimer` 与 `confidence`,文化模块降级为"文化反思镜头"而非现实因果权威。完整重写 (节气/闰月/历史时区测试集) 属 P2,标记 `SCAFFOLDED`,见 `CULTURAL_ENGINE.md`。

### MED-9 · 记忆默认偷偷抽取 — 部分处置
- **位置**: `src/index.js` L204-210 对话后异步抽取并长期保存,无用户同意、无查看/删除入口。
- **v2.0 处置**: 默认**关闭**记忆抽取 (需 `users.memory_opt_in=1`);数据模型加入 memory 控制字段。查看/编辑/删除 UI 属 P1,标记 `SCAFFOLDED`。

---

## 3. 未实现但被指令要求的能力 (诚实清单)

以下为本轮 **NOT_IMPLEMENTED**,已在 `GAP_MATRIX.md` / `PROGRESS.md` 精确登记,绝不谎称完成:

- 移动 App (Expo React Native) — NOT_IMPLEMENTED (仅提供架构与目录规划)
- 专家市场 / Expert OS — NOT_IMPLEMENTED (数据模型预留)
- 管理后台 — NOT_IMPLEMENTED (数据模型预留 audit_logs)
- 微信/支付宝/Stripe/Apple IAP 真实接入 — NOT_IMPLEMENTED (仅 PaymentProvider 抽象 + Mock)
- PostgreSQL/Redis/BullMQ monorepo 迁移 — NOT_IMPLEMENTED (v2.0 仍在 Workers+D1 上做 P0 止血)
- 30 竞品全球调研、财务 Excel、Pitch Deck、全套合规文档 — NOT_IMPLEMENTED (提供方法论与模板骨架)
- 完整测试/CI/可观测性/双区域部署 — 部分 (引擎测试 + 冒烟测试 IMPLEMENTED,其余 SCAFFOLDED)

---

## 4. 保留的真实资产

- `engine.js`: 基于 `lunar-javascript` 的八字/大运计算 + **真太阳时校正**,在创始人样例上逐项复现 — 这是真实的技术资产,予以保留并加免责与置信度。
- Hono 路由骨架、PBKDF2 哈希、HMAC token 机制 — 保留并加固。
- 领域理解 (决策场景) — 升级为 Decision-OS 数据模型。

---

## 5. 审计结论

v1 **不可用于收费上线**。本轮 v2.0 的目标不是假装建成一个大公司,而是:
1. **止血** — 修掉会被尽调一眼看穿、会导致收入归零或身份被伪造的 P0 漏洞;
2. **打地基** — 落地 Decision-OS 数据模型,把"排盘+聊天"升级为"可验证决策闭环"的第一块真实骨架;
3. **诚实交接** — 让另一位资深工程师能据 `PROGRESS.md` 接管,清楚知道什么已做、什么没做。
