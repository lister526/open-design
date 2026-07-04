# 永久网址部署指南 (Permanent URL Deployment Guide)

> SpacePilot 已被构建为**纯静态站点** (`output: 'export'`)，产物在 `out/` 目录。
> 静态站点是最便宜、最可靠的永久托管方式：**免费、无服务器、几乎不会挂**。
>
> 你现在有 3 个部署选项，按推荐顺序排列。**全部免费，不消耗任何 Genspark 额度。**

---

## 现在就能访问的临时预览地址

沙盒里已经跑起来了一个实时预览（**会随沙盒关闭而失效**，仅用于你现在马上看效果）：

```
https://3000-i3w99zrst792os5ki9uh7-b9b802c4.sandbox.novita.ai
```

页面清单：
- `/` 首页（漏损扫描落地页）
- `/audit/` 收益漏损审计
- `/console/` 运营控制台
- `/partners/` 供应商合作
- `/proposal/demo/` 演示提案
- `/proposal/?id=<lead_id>` 任意提案（静态导出下用 query 参数）

**这不是永久地址。** 永久地址请按下面任一方案部署（10 分钟内可完成）。

---

## 方案 A：Cloudflare Pages（★ 最推荐 — 免费、全球 CDN、自带 HTTPS）

永久地址形如：`https://spacepilot.pages.dev`（可绑定自有域名）。

### A1. 用 Git 连接（零命令，最省心）
1. 打开 https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 选择本仓库 `lister526/open-design`，分支选 `genspark_ai_developer`（或合并到 `main` 后选 `main`）。
3. 构建设置：
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `cd spacepilot-v2 && npm install && npm run build`
   - **Build output directory**: `spacepilot-v2/out`
4. 点击 **Save and Deploy**。约 2 分钟后拿到永久地址。
5. 之后每次 `git push`，Cloudflare 自动重新部署。

### A2. 用命令行 Wrangler（如果你有 Cloudflare 账号 + API Token）
```bash
cd spacepilot-v2
npm install
npm run build            # 生成 out/
npx wrangler pages project create spacepilot --production-branch main
npx wrangler pages deploy out --project-name spacepilot
```
第一次会让你登录 / 粘贴 API Token（在 Cloudflare 控制台 → My Profile → API Tokens 创建，模板选 "Edit Cloudflare Workers"）。

### 绑定自有域名（可选）
Cloudflare Pages 项目 → **Custom domains** → 添加 `app.你的域名.com`，按提示改 DNS 即可，自动签发 HTTPS。

---

## 方案 B：GitHub Pages（免费、和仓库绑定、自动化已配好）

已备好一份工作流文件：`spacepilot-v2/deploy/github-pages-workflow.yml`。
（注意：由于自动推送的令牌没有 `workflows` 权限，无法帮你直接写进 `.github/workflows/`，
所以放在 `deploy/` 目录，需你**手动复制**一次。）

### 一次性开启步骤
1. 把 `spacepilot-v2/deploy/github-pages-workflow.yml` 复制到仓库根目录的
   `.github/workflows/spacepilot-pages.yml`（在网页端 GitHub 直接新建文件粘贴即可）。
2. 打开仓库 https://github.com/lister526/open-design → **Settings** → **Pages**。
3. **Build and deployment** → **Source** 选 **GitHub Actions**。
4. 把 `genspark_ai_developer` 合并进 `main`（工作流触发分支是 `main`），推送后 Actions 会自动跑。
5. 完成后永久地址形如：`https://lister526.github.io/open-design/`

> 注意：GitHub Pages 是子路径部署（`/open-design/`）。工作流里已通过 `BASE_PATH` 处理，
> 若你用自有域名或用户主页仓库（`lister526.github.io`），可把 `BASE_PATH` 置空。

---

## 方案 C：Netlify（免费、拖拽即上线，最快）

**最快的一次性上线方式**：不需要连 Git。
1. 本地构建：`cd spacepilot-v2 && npm install && npm run build`
2. 打开 https://app.netlify.com/drop
3. 把 `spacepilot-v2/out` 整个文件夹**拖进浏览器**。
4. 几秒后拿到永久地址 `https://随机名.netlify.app`，可在设置里改名 / 绑定域名。

连 Git 自动部署：Netlify → Add new site → Import from Git，
Build command `cd spacepilot-v2 && npm install && npm run build`，Publish directory `spacepilot-v2/out`。

---

## 三个方案怎么选？

| 需求 | 选哪个 |
|---|---|
| 想最专业、全球最快、以后要绑域名 | **A. Cloudflare Pages** |
| 就想和 GitHub 仓库绑死、全自动 | **B. GitHub Pages** |
| 现在这一分钟就要一个能发出去的链接 | **C. Netlify Drop（拖 `out/`）** |

三者都**免费**且**永久**，不消耗 Genspark 额度。

---

## 重新构建（改代码后）
```bash
cd spacepilot-v2
npm install      # 首次或依赖变动时
npm run build    # 重新生成 out/
```
然后按上面任一方案重新部署（Git 方案会自动触发）。

## 已知限制（静态站点特性，非 bug）
- 所有数据存在浏览器 `localStorage`，**没有后端数据库 / 支付 / 真实 AI**。
- 漏损分数是**演示用启发式算法**，不是真实市场数据。
- 提案分享链接用 `?id=` 形式；只有 7 个种子 lead + demo 是预生成页面，
  运行时新建的 lead 通过 `/proposal/?id=xxx` 由前端读取 localStorage 渲染。

要变成真正能收钱的产品，见 `docs/06_TECH_ROADMAP.md`。
