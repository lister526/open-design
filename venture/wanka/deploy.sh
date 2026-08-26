#!/usr/bin/env bash
# ============================================================================
#  Wanka 一键部署到 Cloudflare（生产环境，绝不失效）
#  运行一次即可把你的网站 + API + 数据库部署到 Cloudflare 全球网络。
#  之后网站 24 小时在线，不依赖任何沙盒，免费额度足以支撑大量访问。
#
#  用法：
#     bash deploy.sh
#
#  你只需要：一个 Cloudflare 免费账号（https://dash.cloudflare.com/sign-up）
# ============================================================================
set -e
cd "$(dirname "$0")"
WR="./node_modules/.bin/wrangler"
[ -x "$WR" ] || WR="npx wrangler"

echo "════════════════════════════════════════════════════════"
echo "  Wanka 部署脚本 — 把你的公司部署到 Cloudflare 生产环境"
echo "════════════════════════════════════════════════════════"

# --- 0. 登录 ---
echo ""
echo "【第 1 步】登录 Cloudflare（会自动打开浏览器，点授权即可）..."
$WR whoami >/dev/null 2>&1 || $WR login

# --- 1. 创建 D1 数据库（只需一次）---
echo ""
echo "【第 2 步】创建生产数据库 wanka-db ..."
if $WR d1 list 2>/dev/null | grep -q "wanka-db"; then
  echo "  ✓ 数据库已存在，跳过。"
else
  $WR d1 create wanka-db || true
  echo ""
  echo "  ⚠️  请把上面输出的 database_id 复制，替换 wrangler.toml 里的"
  echo "      database_id = \"local-placeholder-id\""
  echo "  替换完成后，按回车继续..."
  read -r _
fi

# --- 2. 建表 + 种子模板 ---
echo ""
echo "【第 3 步】初始化数据库表结构 + 种子模板 ..."
$WR d1 migrations apply wanka-db --remote

# --- 3. 设置密钥 ---
echo ""
echo "【第 4 步】设置密钥（JWT_SECRET 必填）..."
if $WR secret list 2>/dev/null | grep -q "JWT_SECRET"; then
  echo "  ✓ JWT_SECRET 已设置。"
else
  echo "  自动生成一个强随机 JWT_SECRET ..."
  RAND=$(head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48)
  echo "$RAND" | $WR secret put JWT_SECRET
fi

echo ""
echo "  （可选）如需真·AI 生成，运行以下命令设置 OpenAI key，然后把"
echo "  wrangler.toml 的 ENABLE_REAL_AI 改成 \"true\"："
echo "     $WR secret put OPENAI_API_KEY"
echo ""
echo "  （可选）如需微信登录，设置："
echo "     $WR secret put WX_APPID"
echo "     $WR secret put WX_SECRET"
echo ""
echo "  （可选）如需 AppLovin 广告，在 wrangler.toml [vars] 里填 APPLOVIN_SDK_KEY 等。"

# --- 4. 部署 ---
echo ""
echo "【第 5 步】部署到生产环境 ..."
$WR deploy

echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ 部署完成！"
echo ""
echo "  你的网站现在 24 小时在线（上面输出的 *.workers.dev 网址）。"
echo "  下一步（可选）：绑定你自己的域名 —— 见 GO_LIVE_GUIDE.md 第 5 节。"
echo "════════════════════════════════════════════════════════"
