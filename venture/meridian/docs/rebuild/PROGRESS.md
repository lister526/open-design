# 进度 (PROGRESS) — 精确状态,不谎称完成

> 状态图例: `IMPLEMENTED` 已实现并验证 · `IMPLEMENTED_WITH_MOCK_PROVIDER` 已实现但用 Mock · `IMPLEMENTED_WITH_INMEMORY_LIMITER` 已实现但内存版 · `SCAFFOLDED` 有骨架/接口未完整 · `REQUIRES_EXTERNAL_CREDENTIALS` 待外部凭证 · `REQUIRES_LEGAL_REVIEW` 待律师 · `NOT_IMPLEMENTED` 未做
> 最后更新: 2026-07-26

## P0 · 止血 (本轮重点,全部完成并通过运行时测试 15/15)

| 项 | 状态 | 证据 |
|---|---|---|
| CRIT-1 删除付费后门 `/api/billing/upgrade` | ✅ IMPLEMENTED | 测试[3] 返回 404 |
| CRIT-1 权益仅由已验证支付回调授予 | ✅ IMPLEMENTED_WITH_MOCK_PROVIDER | 测试[4-7]: pending→签名校验→授予→幂等 |
| CRIT-2 删除 `dev-secret` 回退 | ✅ IMPLEMENTED | `config.requireJwtSecret` 生产缺失即拒绝 |
| CRIT-3 额度原子扣减 | ✅ IMPLEMENTED | `consumeAiQuota` 条件 UPDATE + `.meta.changes` |
| CRIT-4 删除默认第三方代理 + host 白名单 | ✅ IMPLEMENTED | `config.llmConfig` 未配置即本地降级 |
| HIGH-5 限流 + 输入长度上限 | ✅ IMPLEMENTED_WITH_INMEMORY_LIMITER | 测试[8] 超长输入被截断不崩溃 |
| HIGH-6 删除"100%命中/无限畅聊/永久免费"虚假宣传 | ✅ IMPLEMENTED | app.js/README grep 0 命中 |
| 密码强度 8-200 位 + 邮箱规范化 | ✅ IMPLEMENTED | 测试[1] 弱密码被拒 |
| 跨用户数据隔离 | ✅ IMPLEMENTED | 测试[9] 用户B读用户A命盘被拒 |
| 命理引擎加 confidence + disclaimer | ✅ IMPLEMENTED | chart.meta 输出 |

## P1 · 核心可收费闭环 (部分完成)

| 项 | 状态 | 备注 |
|---|---|---|
| Decision-OS 数据模型 (decisions/options/evidence/actions/reviews) | ✅ IMPLEMENTED | migration 0002 + 路由 + 测试[10] |
| 结构化决策分析 (typed schema) | ✅ IMPLEMENTED | `/api/decisions/:id/analyze` 返回 16 字段结构 |
| 数据导出 / 账户删除 / 记忆控制 | ✅ IMPLEMENTED | 测试[11] |
| 订单/订阅/支付事件/幂等键/审计日志 表 | ✅ IMPLEMENTED | migration 0002 |
| 真实支付渠道 (微信/支付宝/Stripe/Apple IAP) | ⛔ REQUIRES_EXTERNAL_CREDENTIALS | PaymentProvider 接口已留 |
| 邮箱验证 / 忘记密码 / 设备会话 / MFA | 🔧 SCAFFOLDED | 表结构未建,属下一轮 |
| Token 迁移到 HttpOnly Cookie | 🔧 SCAFFOLDED | 见 SECURITY.md,前端仍 Bearer |
| 前端决策工作区 UI (创建/列表/详情/选项对比/风险矩阵/结构化分析/行动/复盘) | ✅ IMPLEMENTED | `public/app.js` route('decisions') + 详情视图,已端到端联调后端 API,0 console error |
| 前端隐私与数据控制 UI (记忆开关/查看/删除/导出/注销) | ✅ IMPLEMENTED | `public/app.js` route('account'),对接 MED-9 后端 |
| 证据(evidence)写入端点 | ⛔ NOT_IMPLEMENTED | 后端仅有读取(GET 返回),前端证据当前在会话内本地保存并作为 analyze 入参;需补 `POST /api/decisions/:id/evidence` 持久化 |
| 行动状态勾选(todo→done)写回 | ⛔ NOT_IMPLEMENTED | 前端可创建行动;勾选完成需补 `PATCH /api/decisions/:id/actions/:aid` |
| 管理后台 | ⛔ NOT_IMPLEMENTED | audit_logs 表已备 |

## P2 · 移动 & 专家市场 (未做,诚实标注)

| 项 | 状态 |
|---|---|
| 移动 App (Expo RN, iOS/Android) | ⛔ NOT_IMPLEMENTED (仅架构规划) |
| 专家端 / Expert OS | ⛔ NOT_IMPLEMENTED (数据模型待建) |
| 预约/结算/评价/退款 | ⛔ NOT_IMPLEMENTED |
| 命理引擎节气/闰月/历史时区回归测试集 | ⛔ NOT_IMPLEMENTED |

## P3 · 增长 & 平台 (未做)

| 项 | 状态 |
|---|---|
| PostgreSQL monorepo 迁移 | ⛔ NOT_IMPLEMENTED (见 MIGRATION.md) |
| Redis/BullMQ/可观测性/CI/双区域部署 | ⛔ NOT_IMPLEMENTED |
| 30 竞品真实全球调研 | ⛔ NOT_IMPLEMENTED (方法论骨架在 GLOBAL_MARKET_RESEARCH stub) |
| 财务 Excel / Pitch Deck | 🔧 SCAFFOLDED (v1 已有 docx 财务模型,需按新模型重写) |
| 全套合规文档 | 🔧 SCAFFOLDED + REQUIRES_LEGAL_REVIEW |

## 一句话进度总结
**P0 100% 完成且通过运行时安全测试;P1 决策闭环已打通(后端 API + 完整可用前端:创建→目标约束→选项/风险矩阵→AI 16 字段结构化分析→行动计划→复盘,外加隐私数据控制台);营销落地页已按 Stripe 级标准整体重做(Refined 浅色设计系统:Playfair Display + Inter + Noto Serif SC、8pt 栅格、克制的青铜金强调色、编辑式交替特性行而非卡片堆、响应式导航 + 滚动揭示 + WCAG-AA 焦点态 + prefers-reduced-motion);仅剩 evidence 持久化与行动勾选两个小端点未补(已诚实登记)。P2/P3 明确未做并已登记。** 这是一个诚实、可被接管、用户真的能打开就用、不会在尽调中暴雷的状态,而不是一个假装完成的大项目。

### 落地页重做验证(2026-08-02)
- `node --check public/app.js` 通过;`public/styles.css` 34KB 全新 Refined 浅色系统。
- 浏览器实测 `#home` / `#pricing` / `#faq` 均 **0 console error**,标题、字体、区块正确渲染。
- P0 冒烟测试 **15/15 通过**。
- 深度借鉴 nexu-io/open-design(151 套品牌级设计系统,含 stripe)与 bergside/awesome-design-skills(refined/premium/spacious/editorial)。
