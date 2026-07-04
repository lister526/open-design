# SpacePilot — Technical Roadmap (技术路线图)

> 当前是**前端静态原型**。本文说明：现在有什么、缺什么、按什么顺序补。
> 原则：**验证驱动开发**——只在客户已付费、需要规模化时才补对应能力。

---

## 现状 (What exists today)
- Next.js 15 App Router + React 19 + TypeScript，纯静态导出 (`output: 'export'`)。
- 完整可交互用户旅程：Landing → Audit → Proposal → Console → Partners。
- 启发式"漏损引擎"(`src/lib/engine.ts`)：给出演示分数、增收区间、报价。
- 状态用 Zustand + localStorage 持久化（**浏览器本地，非真实数据库**）。
- i18n：5 种语言（en/zh/ja/es/ar，含阿拉伯语 RTL）。
- 城市候补名单表单（写入 localStorage）。

## 明确缺失 (Not real yet — 诚实清单)
| 能力 | 现状 | 影响 |
|---|---|---|
| 后端数据库 | ❌ 仅 localStorage | 数据不跨设备、不可运营 |
| 支付 | ❌ 无 | 收钱要靠外部 Payment Link |
| 真实 AI 引擎 | ❌ 启发式假数据 | 漏损分数不可信 |
| 真实市场数据 | ❌ 无 | 无法对标真实竞品/价格 |
| 供应商网络 | ❌ 种子假数据 | 交付要靠人工 |
| 用户账号/鉴权 | ❌ 无 | 无法留存客户 |
| 收益追踪 | ❌ 演示 | 无法证明 ROI |

---

## 分阶段补齐（跟着验证走）

### 阶段 0（现在）：不写后端
- 用静态站点当**销售道具**；收款用 Stripe Payment Link；报告用文档手写。
- 目标：完成 `05_VALIDATION_PLAN.md` 的愿付验证。

### 阶段 1（有人付费后）：最小真实后端
- 加一个数据库存 lead / 订单（推荐：**Cloudflare D1** 或 Supabase，免费额度够）。
- 接 Stripe Checkout（真实支付 + webhook 标记订单状态）。
- 简单邮箱登录（magic link）。
- 把 localStorage 数据迁到后端。

### 阶段 2（交付跑通后）：把漏损引擎做真
- 接真实数据源：短租平台价格/入住率（爬取或第三方 API，注意合规）。
- 用真实成交数据校准漏损模型（先规则 + 少量 LLM 归因，别一上来上大模型）。
- 供应商 CRM：真实供应商入驻、报价、排期。

### 阶段 3（多单可复制后）：规模化
- 城市扩张 + 供应商网络管理 + 交付 SLA 追踪。
- 收益前后对比仪表盘（真实数据）。
- 自动化获客（SEO 内容系统、平台合作）。

---

## 技术选型建议（省钱优先）
- **托管**：静态部分 Cloudflare Pages / Netlify（免费）。
- **后端/数据库**：Cloudflare Workers + D1，或 Supabase（免费额度）。
- **支付**：Stripe（无月费，按笔抽成）。
- **AI**：先用便宜模型做归因/文案，别为"看起来智能"烧钱。
- 一句话：**每加一个组件，先问"这是不是已被验证的需求逼出来的？"**

---

## 部署命令速查
```bash
cd spacepilot-v2
npm install
npm run build     # 生成 out/（静态站点）
# 然后按 docs/00 部署到 Cloudflare Pages / GitHub Pages / Netlify
```
