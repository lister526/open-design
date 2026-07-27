# 实施计划 (IMPLEMENTATION_PLAN)

## 本轮已执行 (P0 + P1 骨架)
见 PROGRESS.md。核心: 安全止血 + Decision-OS 后端 + 诚实文档。

## 下一轮建议顺序 (给接管工程师)

### 阶段 A · 补齐 P1 可收费闭环 (2-4 周, 1-2 人)
1. 前端决策工作区 UI: 创建决策 → 填目标/约束 → 加选项 → 证据/风险矩阵 → analyze → 行动计划 → 复盘。后端 API 已就绪。
2. Token 迁移 HttpOnly Cookie + CSRF。
3. 邮箱验证 + 忘记密码 (加 `email_verifications`/`password_resets` 表)。
4. 接入 **一个** 真实支付渠道 (建议先 Stripe 海外 或 支付宝 国内) 打通端到端收款。
5. safety 模块 v1 (关键词 + 危机资源提示 + 高风险禁止转化)。

### 阶段 B · 迁移与规模化 (4-8 周, 2-3 人)
1. 按 MIGRATION.md 迁 PostgreSQL + Drizzle;D1 数据导出脚本。
2. Redis 限流 + 队列 (记忆抽取/通知)。
3. 管理后台 (用户/订单/退款/审计/风险)。
4. 可观测性 (结构化日志 + Sentry + 指标)。
5. CI (lint/typecheck/test/build)。

### 阶段 C · 移动 & 专家市场 (8-12 周, 3-5 人)
1. Expo RN App (复用 API): 登录/决策流/复盘提醒/推送。
2. 专家端 + 预约 + 结算 + 评价 + 审核。

## 判断门槛 (何时才扩张)
- 付费转化 ≥3%、月留存 (完成并复盘决策) 稳定、贡献毛利为正 → 才投流/扩品类。
- 否则先打磨核心闭环,不烧钱。
