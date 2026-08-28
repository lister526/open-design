# MIGRATION.md — legacy-v1 → Meridian 2.0

## 处置策略 (指令第八章)
1. v1 实现**保留为参考** (未删除文件),本轮在其上做 P0 修复与扩展。
2. 未来迁移到 PostgreSQL monorepo 时,以下映射适用。
3. **不迁移 v1 的假 paid 订单为有效收入** (v1 `demo` provider 的 orders 一律视为无效)。
4. **不继承** dev-secret / 默认代理 / 演示升级后门 (本轮已在代码层删除)。

## D1 (SQLite) → PostgreSQL 映射
| v1/v2 D1 | Postgres | 备注 |
|---|---|---|
| `INTEGER` epoch ms | `bigint` 或 `timestamptz` | 时间统一 UTC |
| `orders.amount REAL` | 废弃 | 改用 `amount_minor INTEGER` (分) |
| `TEXT` JSON 列 (goals/computed) | `jsonb` | |
| PBKDF2 hash 串 | 保留;新用户可切 Argon2id | 双算法过渡期 |

## 数据迁移脚本 (待写, NOT_IMPLEMENTED)
- `scripts/export_d1.ts`: `wrangler d1 export` → NDJSON
- `scripts/import_pg.ts`: 校验 + 写入,遇脏数据 (如 demo 订单) 标记丢弃并记日志

## 迁移顺序
users → charts → conversations → messages → memories → decisions → orders(仅非 demo) → subscriptions(重新按有效支付重建)
