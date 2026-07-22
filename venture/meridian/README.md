# 子午 · Meridian

> 以东方命理为护城河的 AI 人生决策顾问 —— 全栈产品（Cloudflare Workers + D1 + Hono + 原生前端）

命是底牌，运是打法，选择权在你。子午用你的命盘（八字 + 紫微斗数 + 大运 + 流年）看清天赋结构与时机节奏，像一位既懂命理、又懂商业与心理的私人军师，陪你做人生每一个重要决定。

---

## 这是什么

一个**可运行的全栈产品**，不是原型：

- **后端**：Cloudflare Workers + Hono + D1（SQLite）。用户 / 命盘 / 对话 / 长期记忆 / 订阅 / 事件。
- **命理引擎**（护城河）：真太阳时校正、八字四柱、五行旺衰、喜用神、十神、大运、流年、紫微斗数十二宫 + 14 主星。基于 `lunar-javascript`，已用真实命盘逐项验证。
- **前端**：高端对话式 SPA（落地页、注册登录、精确排盘、军师对话、命盘面板、订阅升级）。
- **健壮性**：LLM 不可用时自动降级为“命盘驱动顾问”，回复仍然个性化，服务不中断。

## 目录结构

```
meridian/
├── src/
│   ├── index.js      # Hono 后端：auth / chart / conversations / AI chat / billing
│   ├── engine.js     # 东方命理引擎（八字/五行/大运/流年/紫微）
│   ├── ai.js         # AI 军师：system prompt + LLM 调用 + 记忆抽取 + 降级顾问
│   └── auth.js       # WebCrypto: PBKDF2 密码 + HMAC 会话令牌
├── public/           # 前端（index.html / styles.css / app.js）
├── migrations/
│   └── 0001_init.sql # D1 数据库表结构
├── docs/             # 创业文档（.docx 生成脚本 + output/ 成品）
├── wrangler.toml     # Cloudflare 配置
└── package.json
```

## 本地运行

```bash
npm install
# 初始化本地数据库
npx wrangler d1 execute meridian-db --local --file=./migrations/0001_init.sql --persist-to .wrangler/state
# 配置本地密钥（创建 .dev.vars）
cat > .dev.vars <<EOF
OPENAI_API_KEY=你的LLMKey
OPENAI_BASE_URL=https://api.openai.com/v1
JWT_SECRET=任意长随机串
EOF
# 启动
npx wrangler dev --port 8787 --local --persist-to .wrangler/state
```

打开 http://127.0.0.1:8787 。LLM Key 不填也能用（自动降级为命盘顾问）。

## 部署到 Cloudflare（免费额度即可，永久在线）

```bash
npx wrangler login
npx wrangler d1 create meridian-db      # 把返回的 database_id 填进 wrangler.toml
npx wrangler d1 execute meridian-db --remote --file=./migrations/0001_init.sql
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_BASE_URL
npx wrangler secret put JWT_SECRET
npx wrangler deploy
```

部署后会得到一个 `*.workers.dev` 的永久地址；也可绑定自定义域名。

## 验证：引擎对创始人真实命盘 100% 命中

输入 `2000-02-05 15:05 / 江苏徐州 / 经度 117.95 / 男`，引擎输出：

| 项目 | 引擎输出 | 官方命盘 |
|---|---|---|
| 真太阳时 | 14:42 | 14:42 |
| 八字 | 庚辰 戊寅 癸巳 己未 | 庚辰 戊寅 癸巳 己未 |
| 命宫 / 身宫 | 癸未 / 酉 | 癸未 / 酉 |
| 五行局 | 木三局 | 木三局 |
| 命主 / 身主 | 武曲 / 文昌 | 武曲 / 文昌 |
| 紫微星位 | 辰 | 辰（子女宫） |

全部逐项命中 —— 引擎可信，非近似。

## 免责声明

本产品提供的内容仅供自我认知与决策参考，不构成医疗、法律或投资建议。
