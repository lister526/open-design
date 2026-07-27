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
| 前端决策工作区 UI (选项对比/证据矩阵/复盘) | ⛔ NOT_IMPLEMENTED | 后端 API 已就绪,前端未接 |
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
**P0 100% 完成且通过运行时安全测试;P1 后端闭环骨架完成;P2/P3 明确未做并已登记。** 这是一个诚实、可被接管、不会在尽调中暴雷的状态,而不是一个假装完成的大项目。
