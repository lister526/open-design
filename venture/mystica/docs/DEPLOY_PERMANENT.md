# Mystica —「永久生效网站链接」上线指南（零成本 / 3 分钟）

> 你的整站已经被改造成 **100% 纯静态站点**：所有报告、七国定价、合盘、起名、择日、
> 推荐裂变、下单流程全部在浏览器里用 `static-api.js` 本地算出来，**不需要任何后端服务器、
> 不需要花一分钱**。因此它可以直接托管在任何免费静态平台上，得到一个**永久有效的网址**。
>
> 我已经把可直接上线的成品放在两个地方：
> 1. 项目里的 `venture/mystica/dist/`（可直接拖拽上传的成品文件夹）
> 2. 我已经把这份成品推送到了你的 GitHub 仓库的 **`gh-pages` 分支**（`lister526/open-design`）
>
> 下面三条路都能拿到永久链接，**任选其一，推荐第 1 条（最快，3 步）**。

---

## ✅ 方案 1：GitHub Pages（最快，免费，永久，我已帮你推好分支）

我已经把静态成品推送到你仓库的 `gh-pages` 分支。你只需在网页上点 3 下开启 Pages：

1. 打开 👉 `https://github.com/lister526/open-design/settings/pages`
2. 在 **Build and deployment → Source** 选 **Deploy from a branch**；
   **Branch** 选 `gh-pages`，文件夹选 `/ (root)`，点 **Save**。
3. 等 1–2 分钟，页面顶部会出现你的**永久网址**：
   ```
   https://lister526.github.io/open-design/
   ```
   （站内所有链接我已改成相对路径，子路径也能正常跑。）

> 为什么我不能替你自动点这一下？——GitHub 给我的推送令牌只有「推代码」权限，
> 没有「改仓库 Pages 设置」权限，所以最后这一下开关必须你在网页点一次。之后**永久生效**，
> 以后我更新代码重推 `gh-pages`，网址内容自动更新，你不用再动。

---

## ✅ 方案 2：Cloudflare Pages（推荐做正式生产站，免费额度极大，带全球 CDN）

自定义域名、无限流量、最快。需要你的 Cloudflare API Token（免费注册）：

1. 免费注册 Cloudflare → 右上角头像 → **My Profile → API Tokens → Create Token**
   → 用模板 **"Edit Cloudflare Workers"**（或至少给 **Account → Cloudflare Pages → Edit**）。
2. 回到本项目的 **Deploy 面板**，把 Token 粘进去保存。
3. 告诉我「Token 已填好」，我就会自动执行：
   ```bash
   npx wrangler pages project create mystica --production-branch main
   npx wrangler pages deploy dist --project-name mystica
   ```
   完成后你会得到永久网址：`https://mystica.pages.dev`

---

## ✅ 方案 3：Netlify / Vercel 拖拽上传（不需要命令行，最傻瓜）

1. 免费注册 [netlify.com](https://app.netlify.com/drop)（有 "Drag & drop" 页面）。
2. 把 `venture/mystica/dist/` 这个文件夹**整个拖进去**。
3. 几秒后得到永久网址：`https://随机名.netlify.app`（可在设置里改成 `mystica.netlify.app`）。

> `dist/` 我已经打进交付压缩包里，解压即用。

---

## 🔧 什么时候需要「真后端」？（现在不需要，先赚到第一笔再说）

纯静态版本已经能：出报告、按七国货币定价、合盘/起名/择日、推荐裂变、模拟下单，
**完全够用来跑广告、验证转化、收集邮箱名单**。

当你开始**真实收款**、要**真人 AI 逐字写报告**、要**发实物**时，再把 `server.js`
（Node/Express 后端，已写好）部署到免费/低价的 Node 平台即可，前端一行都不用改
（只要不引入 `static-api.js`，前端就会自动去调真后端）：

| 平台 | 免费额度 | 部署方式 | 配置文件（已备好） |
|---|---|---|---|
| Railway | 每月 $5 额度 | 连 GitHub 自动部署 | `railway.json` |
| Render | 免费层 | 连 GitHub 自动部署 | `render.yaml` |
| Vercel | 免费层 | `vercel deploy` | `vercel.json` |
| Fly.io / Docker | 低价 | `Dockerfile` | `Dockerfile` |

真后端上线后需要配的环境变量见 `.env.example`（AI Key、Stripe/LemonSqueezy、
本地支付渠道 Razorpay/MercadoPago 等），`DEPLOY.md` 有零代码逐步说明。

---

## 🧭 结论
- **今天就想要永久链接** → 走**方案 1**（我已推好 `gh-pages`，你点 3 下即可）。
- **要正式生产 / 自定义域名** → 走**方案 2**（给我 Cloudflare Token，我全自动完成）。
- **完全不想碰技术** → 走**方案 3**（拖拽 `dist/` 文件夹）。

三条路拿到的都是**永久有效**的网址。选好告诉我，我立刻把剩下的自动化部分接着做完。
