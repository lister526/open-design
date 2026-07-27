# START HERE — Meridian 2.0 (本轮交付导览)

## 一句话
把 v1 那个"能演示但会被尽调一眼看穿"的原型,做了 **P0 安全止血** + **Decision-OS 后端骨架** + **诚实文档**。战略从"AI 算命"升级为"Personal Decision OS"。

## 三分钟看懂本轮做了什么
1. **修掉了会致命的漏洞** (全部有运行时测试证明,15/15 通过):
   - 付费后门删除 → 权益只能由**已验证支付回调**授予
   - `dev-secret` 弱密钥回退删除 → 生产缺密钥即拒绝启动
   - 额度改**原子扣减** → 并发不能白嫖
   - 删除硬编码第三方 LLM 代理 → 默认不外发数据
   - 加限流 + 输入长度上限
   - 删除"100%命中/无限/永久免费"虚假宣传
2. **打了决策闭环的地基**: `decisions/options/evidence/actions/reviews` 数据模型 + API + 结构化分析。
3. **隐私合规起步**: 记忆默认关闭 + 查看/删除/导出 + 账户删除。

## 怎么跑起来
```bash
cd venture/meridian
npm install
npx wrangler d1 migrations apply meridian-db --local
npx wrangler dev --local --port 8787
# 另开终端跑安全测试:
BASE=http://localhost:8787 bash tests/p0_smoke.sh
```

## 必读文档 (按顺序)
1. `docs/rebuild/CURRENT_STATE_AUDIT.md` — v1 到底有什么问题 (基于真实代码行号)
2. `docs/rebuild/DECISIONS.md` — 为什么这样取舍 (尤其 ADR-000)
3. `docs/rebuild/PROGRESS.md` — 每一项的**真实状态** (做了/没做,不谎称)
4. `docs/rebuild/GAP_MATRIX.md` — 指令要求 vs 实际交付
5. `docs/SECURITY.md` — 安全不变量
6. `docs/rebuild/IMPLEMENTATION_PLAN.md` — 下一轮怎么接着做

## 最重要的一句实话
指令要求的是一个 15-30 人团队 12-18 个月的工程。单会话不可能全做完。**没做的都如实标了 `NOT_IMPLEMENTED`**——因为伪造完成度,才是对一个资金紧张的创始人最大的伤害。
