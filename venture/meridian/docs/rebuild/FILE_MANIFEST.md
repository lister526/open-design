# 文件清单 (FILE_MANIFEST) — 本轮 v2.0 P0

## 新增
| 文件 | 用途 | 状态 |
|---|---|---|
| `src/config.js` | 启动安全守卫: JWT 密钥强制、LLM 白名单 | IMPLEMENTED |
| `src/ratelimit.js` | 滑动窗口限流 + 输入长度常量 | IMPLEMENTED_WITH_INMEMORY_LIMITER |
| `src/payments.js` | PaymentProvider 抽象 + PLANS + 权益 + MockProvider | IMPLEMENTED_WITH_MOCK_PROVIDER |
| `migrations/0002_decision_os.sql` | Decision-OS + 支付/同意/审计 ~12 表 | IMPLEMENTED |
| `tests/p0_smoke.sh` | P0 安全运行时测试 (15 项) | IMPLEMENTED |
| `docs/SECURITY.md` | 安全设计与 P0 修复说明 | IMPLEMENTED |
| `docs/CULTURAL_ENGINE.md` | 命理模块诚实说明 | IMPLEMENTED |
| `docs/rebuild/*.md` | 审计/决策/差距/进度/风险/计划/清单 | IMPLEMENTED |

## 修改
| 文件 | 变更 | 状态 |
|---|---|---|
| `src/index.js` | 全面重写: P0 修复 + Decision-OS 路由 + 隐私路由 + 支付 webhook | IMPLEMENTED |
| `src/engine.js` | 增加 `meta.confidence` + `meta.disclaimer` (文化降级) | IMPLEMENTED |
| `public/app.js` | 去虚假宣传 + upgrade 改走 checkout + 新定价 | IMPLEMENTED |
| `README.md` | 去"100%命中/永久免费/无限"措辞 | IMPLEMENTED |
| `wrangler.toml` | 新增 ENVIRONMENT/LLM_ALLOWED_HOSTS/PAYMENTS_MOCK,去硬编码代理 | IMPLEMENTED |
| `.dev.vars` | 新增 MOCK_WEBHOOK_SECRET/LLM_ALLOWED_HOSTS/PAYMENTS_MOCK | IMPLEMENTED (gitignored) |

## 保留 (未改)
`src/auth.js` (PBKDF2/HMAC), `src/ai.js` (提示词/降级), `public/index.html`, `public/styles.css`, `migrations/0001_init.sql`, `package.json`

## 删除
无文件删除;`/api/billing/upgrade` 后门路由已从 index.js 移除 (代码级)。
