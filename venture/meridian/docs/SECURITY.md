# SECURITY.md — Meridian 2.0 安全设计与 P0 修复

## 已建立的安全不变量 (invariants)

### 1. 权益只能由已验证支付授予 (fixes CRIT-1)
- 删除了 `/api/billing/upgrade` 后门。
- 前端只能 `POST /api/billing/checkout` → 创建 **pending** 订单,**不授予任何权益**。
- 权益只在 `POST /api/billing/webhook/:provider` 中授予,且必须:
  - 通过供应商签名校验 (`verifyWebhook`);Mock 用 HMAC-SHA256 共享密钥。
  - 幂等 (`idempotency_keys` 表,event_id 去重)。
  - 金额+币种与服务端 `PLANS` 交叉核对 (防篡改)。
- 运行时证据: `tests/p0_smoke.sh` [3-7] 全部通过。

### 2. 无弱密钥回退 (fixes CRIT-2)
- `config.requireJwtSecret(env)`: 生产环境缺失/弱密钥 → **抛错拒绝服务**,绝不回退 `dev-secret`。
- 所有签名/验签统一走该函数。

### 3. 额度原子扣减 (fixes CRIT-3)
- `consumeAiQuota`: 用条件 `UPDATE ... WHERE credits>0` / `WHERE used<quota`,依据受影响行数判断,杜绝并发超发。

### 4. 隐私默认安全 (fixes CRIT-4 + MED-9)
- LLM 未显式配置 `OPENAI_API_KEY`+`OPENAI_BASE_URL` 且 host 在白名单时 → **不外发**,走本地降级顾问。
- 长期记忆默认 **关闭** (`memory_opt_in=0`);仅 opt-in 后才加载/抽取。
- 用户可查看/删除记忆、导出全部数据、删除账户。

### 5. 输入与频率控制 (fixes HIGH-5)
- `content` 硬上限 4000 字,字段 500 字。
- 注册 5/min·IP、登录 10/min·IP、对话 20/min·用户、排盘 20/min·IP。
- ⚠️ 内存实现,生产需 Durable Object/Redis。

### 6. 数据隔离
- 所有资源查询带 `AND user_id=?`;跨用户访问返回 404/401 (测试[9])。

## 待办 (未完成,不谎称)
- **HttpOnly Cookie**: 当前前端用 Bearer + localStorage (R3)。迁移方案: 登录时 `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax`,前端不再读 token;`auth()` 优先读 Cookie。属 P1,SCAFFOLDED。
- **Argon2id**: Workers 无原生 Argon2,当前 PBKDF2-100k。Postgres 迁移后切换。
- **CSRF**: 迁移 Cookie 后需加 CSRF token / SameSite 严格化。
- **MFA / 设备会话 / 邮箱验证 / 忘记密码**: 表结构待建。
- **safety 模块** (自伤/危机识别): 上线情感话题前必须补 (R6)。

## 生产上线检查清单
- [ ] `JWT_SECRET` 已设 (≥32 随机字符),`ENVIRONMENT=production`
- [ ] `PAYMENTS_MOCK` 未设或 `disabled`
- [ ] 真实支付供应商签名密钥已配置
- [ ] `LLM_ALLOWED_HOSTS` 已设为真实供应商 host
- [ ] 限流换为分布式实现
- [ ] Token 存储改 HttpOnly Cookie
- [ ] 律师审定的隐私政策/用户协议已上线
