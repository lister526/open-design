# 风险登记 (RISK_REGISTER)

| ID | 风险 | 等级 | 现状 | 缓解 |
|---|---|---|---|---|
| R1 | 内存限流在多实例 Workers 下不全局精确 | 中 | 已知 | 生产换 Durable Object / Redis (ADR-004) |
| R2 | PBKDF2 而非 Argon2id | 低-中 | 已知 | 100k 迭代可接受;Postgres 迁移后换 Argon2id |
| R3 | Token 仍存 localStorage,XSS 可窃取 | 中 | 未修 | 迁移 HttpOnly Cookie (SECURITY.md);前端需重构 |
| R4 | 真实支付未接,无法真正收款 | 高(商业) | 已知 | 接入微信/支付宝/Stripe 需商户资质,创始人须办理 |
| R5 | 命理紫微/喜用神为简化实现 | 中(信任) | 已降级标注 | 标 experimental;完成回归测试集前不宣称精确 |
| R6 | 无 safety 模块 (自伤/危机识别) | 高(伦理/合规) | 未做 | 上线含情感话题前必须补;当前 disclaimer 兜底 |
| R7 | 无合规法律页正式版 | 高(合规) | stub | 上线前必须律师审定 (REQUIRES_LEGAL_REVIEW) |
| R8 | 单会话交付无法覆盖全指令范围 | — | 已如实沟通 | ADR-000: 拒绝伪造,分阶段真实交付 |
| R9 | 财务/市场数据若被当作事实用于融资 | 高 | 已标注 | 所有未验证数字标"假设",不得进 pitch |
| R10 | 沙盒 URL 会话结束即失效 | 中 | 已知 | 提供自部署 Cloudflare 指南 |

## 上线前必须清零的阻断项 (Go-Live Blockers)
1. R4 真实支付接入 (否则无法收款)
2. R6 safety 模块 (涉及人生重大决策的伦理底线)
3. R7 律师审定的隐私政策/用户协议/自动续费/退款
4. R3 Token 存储加固
5. 生产环境 `JWT_SECRET` 已设 + `PAYMENTS_MOCK` 已关
