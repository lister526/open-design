# 🚀 Mystica 上线部署手册（写给不懂编程的创始人）

> 目标：**下周就能收到第一笔钱。** 全程不需要你写一行代码，只需要复制粘贴 + 点鼠标。
> 从零到「网站上线 + 能真实收款」大约 **2～3 小时**。

---

## 第 0 步：先想清楚你在卖什么（5 分钟）

Mystica 的收入不是靠订阅（研究证明订阅转化只有 1~5%），而是靠三条腿：

| 收入来源 | 产品 | 价格 | 毛利 | 角色 |
|---|---|---|---|---|
| **主力现金流** | 深度命理报告（一次付费） | $19 | ~95% | 引流走量 |
| **利润发动机** | 定制水晶护身符（实物） | $79 | ~70% | 真正赚大钱 |
| 高客单 | 情侣合盘 / 宝宝起名 / 择日 / 年度卷轴 | $15–$59 | 高 | 复购 & 客单价 |
| 细水长流 | 星运会员（订阅） | $9/月 | ~95% | 加购项，不主推 |

**记住：软件报告负责「把人骗进门 + 建立信任」，实物护身符和高客单服务负责「赚到上亿」。**

---

## 第 1 步：选一个部署平台（挑一个即可）

三个都能一键部署，**推荐 Railway 或 Render**，因为本项目有 Node 后端（要跑 `server.js` 生成报告 + 处理支付回调）。

| 平台 | 适合 | 一句话 |
|---|---|---|
| **Railway**（推荐） | 有后端的全栈应用 | 连 GitHub → 自动部署，最省心 |
| **Render** | 同上 | 免费档够起步 |
| **Vercel** | 也行 | 用 `vercel.json` 把后端当 Serverless 跑 |
| Cloudflare Pages | 纯静态 | 若只做静态展示可用 `wrangler.toml`，但会失去实时报告能力 |

### 方式一：Railway（最推荐）

1. 打开 https://railway.app → 用 GitHub 登录
2. New Project → Deploy from GitHub repo → 选中本仓库
3. 在 **Variables** 里粘贴 `.env.example` 里的变量（见第 3 步）
4. Railway 会自动执行 `npm install` 和 `npm start`（即 `node server.js`）
5. 部署好后它会给你一个网址，例如 `mystica-production.up.railway.app`

### 方式二：Render

1. https://render.com → New → Web Service → 连 GitHub
2. Build Command: `npm install` ｜ Start Command: `node server.js`
3. 在 Environment 里加变量（第 3 步）

### 方式三：Vercel

1. https://vercel.com → Import Git Repository
2. 项目自带 `vercel.json`，会自动把 `server.js` 当作后端函数
3. 在 Settings → Environment Variables 里加变量

---

## 第 2 步：绑定你自己的域名（30 分钟，可选但强烈建议）

1. 去 Namecheap / 阿里云 / Cloudflare 买一个域名，例如 **mystica.app**（$10～15/年）
2. 在部署平台的「Custom Domain / Domains」里填入你的域名
3. 平台会给你一条 CNAME 记录，去域名商后台 DNS 里加上
4. 等 10～30 分钟生效，HTTPS 会自动配好

> 有了自己的域名，广告投放的信任感和转化率会明显更高。

---

## 第 3 步：让报告「真正智能」——配置 AI 密钥（10 分钟）

没有 AI 密钥时，网站会用**内置的高质量兜底报告**（demo 也很漂亮，不会崩）。
配上真实密钥后，每份报告都会**为用户量身定制**，质量再上一个台阶。

1. 去 https://platform.openai.com 注册 → 充值 $10（够跑几千份报告）
2. 创建一个 API Key（`sk-...`）
3. 在部署平台的环境变量里填：
   - `OPENAI_API_KEY = sk-你的密钥`
   - `MODEL_DEEP = gpt-5-mini`（或 `gpt-4o`）
   - `MODEL_DAILY = gpt-5-nano`

> 成本参考：一份深度报告的 AI 成本约 $0.01～0.03，卖 $19，毛利极高。

---

## 第 4 步：开通收款（最关键！45 分钟）—— 用 Lemon Squeezy

**为什么用 Lemon Squeezy 而不是 Stripe？**
Lemon Squeezy 是 **Merchant of Record（记录商户）**，会自动帮你代扣代缴全球增值税/销售税——
对一个人的小团队来说，这省掉了跨境税务的大坑。Stripe 需要你自己处理税。

### 操作步骤

1. 注册 https://www.lemonsqueezy.com → 建一个 Store
2. 在 Store 里为每个产品建一个 **Product → Variant**：
   - Deep Reading — $19
   - Couple Compatibility — $29
   - Baby Name — $49
   - Auspicious Dates — $15
   - Annual Scroll — $59
   - Custom Amulet — $79（实物，填好尺寸/邮费）
   - Cosmic Membership — $9/月（选 Subscription）
3. 每建好一个 Variant，复制它的 **variant id**
4. Settings → API → 创建一个 **API Key**，复制 **Store ID**
5. 在部署平台环境变量里填：
   ```
   PAYMENT_PROVIDER = lemonsqueezy
   LEMONSQUEEZY_API_KEY = ...
   LEMONSQUEEZY_STORE_ID = ...
   LEMONSQUEEZY_WEBHOOK_SECRET = ...   (下一步生成)
   LEMONSQUEEZY_VARIANT_DEEP = ...
   LEMONSQUEEZY_VARIANT_COMPAT = ...
   LEMONSQUEEZY_VARIANT_NAMING = ...
   LEMONSQUEEZY_VARIANT_DATES = ...
   LEMONSQUEEZY_VARIANT_SCROLL = ...
   LEMONSQUEEZY_VARIANT_AMULET = ...
   LEMONSQUEEZY_VARIANT_MEMBER = ...
   ```
6. **配置 Webhook**（这样支付成功后才会自动解锁报告）：
   - Lemon 后台 → Settings → Webhooks → Add
   - URL 填：`https://你的域名/api/webhook`
   - 勾选事件：`order_created`、`subscription_created`
   - 生成 Signing Secret，填回 `LEMONSQUEEZY_WEBHOOK_SECRET`

> 想用 Stripe？把 `PAYMENT_PROVIDER=stripe`，填 `STRIPE_*` 系列变量即可，代码无需改动。

---

## 第 5 步：实物护身符怎么发货（你的利润发动机）

你**不需要囤货**。两种模式：

- **代发（Dropshipping）起步**：在 1688 / AliExpress 找水晶手串供应商，出单后一件代发。成本 $8～15，卖 $79。
- **半定制升级**：批量进裸珠 + 卡片，收到订单后你按用户「所缺五行」串一条 + 手写祝福卡，做出「专属感」，可涨价到 $99～129。

用户下单信息（含收货地址）会进 Lemon Squeezy 后台的订单里，你照着发货即可。

---

## 第 6 步：上线自检清单

```
□ 网站能打开，7 种语言能切换
□ 填生日 → 能出免费命盘 + 五行图
□ 点「解锁深度报告」→ 跳转支付页（demo 模式会直接跳 success 页展示报告）
□ 合盘 / 起名 / 择日 弹窗能出结果
□ 关闭页面时弹出留邮箱弹窗，能提交
□ /legal.html 里隐私/条款/退款都在
□ 底部页脚链接都能点
□ 手机上排版正常
```

自检脚本：`curl https://你的域名/api/health` 应返回 `{"ok":true,...}`。

---

## 常见问题

**Q：完全不配密钥能上线吗？**
能。会用兜底报告，功能全通，适合先跑广告测转化，赚到钱再配真密钥。

**Q：数据安全吗？**
生日等信息默认不落库（内存态），支付信息全在 Lemon/Stripe 合规环境里。上量后建议把 `payment.js` 里的内存订单表换成数据库（D1 / Postgres）。

**Q：如何看有没有人留邮箱？**
邮箱名单写在服务器的 `leads.jsonl`，可定期导出做 EDM/弃单召回。

---

**下一步看 [`LAUNCH_PLAN.md`](./LAUNCH_PLAN.md)：6 个月赚到千万级的具体打法。**
