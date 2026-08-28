#!/usr/bin/env python3
"""Package the Meridian Sync codebase into two ordered, human-readable bundle files:
  - meridian_website_ALL_CODE.txt   (all website / backend + frontend code, in order)
  - meridian_app_ALL_CODE.txt       (all mobile app code, in order)

Each bundle has a header, a table of contents, and every file wrapped in clear
delimiters with a language hint so it's easy to split/polish in another tool.
"""
import os
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = ROOT

LANG_BY_EXT = {
    ".js": "javascript", ".jsx": "javascript", ".ts": "typescript",
    ".css": "css", ".html": "html", ".sql": "sql", ".sh": "bash",
    ".json": "json", ".toml": "toml", ".md": "markdown", ".vars": "ini",
}


def lang_of(path):
    return LANG_BY_EXT.get(os.path.splitext(path)[1], "text")


# ---- Ordered manifests (logical reading order) ----
WEBSITE_FILES = [
    ("README.md", "项目说明 / 总览"),
    ("package.json", "依赖与脚本 (Cloudflare Workers + Hono)"),
    ("wrangler.toml", "Cloudflare 部署配置 (D1 绑定 / 环境变量)"),
    (".dev.vars", "本地开发环境变量样例 (勿提交真实密钥)"),
    # ---- database ----
    ("migrations/0001_init.sql", "数据库迁移 1：账号 / 订单 / 事件基础表"),
    ("migrations/0002_decision_os.sql", "数据库迁移 2：决策模块表"),
    ("migrations/0003_sync.sql", "数据库迁移 3：合盘关系 / 报告 / 分享卡 / 反馈"),
    # ---- backend (Worker) ----
    ("src/config.js", "后端：全局常量 / 套餐 / 关系类型 / 限制"),
    ("src/auth.js", "后端：JWT 签发校验 + 密码哈希"),
    ("src/ratelimit.js", "后端：内存限流器"),
    ("src/engine.js", "后端：东方星命计算引擎（八字/紫微基础）"),
    ("src/synastry.js", "后端：合盘算法（维度分/关键词/建议/择时）"),
    ("src/payments.js", "后端：支付渠道抽象 + 签名校验 webhook"),
    ("src/ai.js", "后端：AI 辅助（可选）"),
    ("src/index.js", "后端：主入口，所有 API 路由 (Hono app)"),
    # ---- frontend (SPA) ----
    ("public/index.html", "前端：HTML 外壳（多语言字体，非阻塞加载）"),
    ("public/styles.css", "前端：设计系统 CSS（含 RTL / 语言切换器 / 信任条）"),
    ("public/i18n.js", "前端：★ 8 国语言词典（191 键 × 8 语言，地道本地化）"),
    ("public/app.js", "前端：SPA 主逻辑（路由 / 渲染 / 实时切换语言）"),
    # ---- tests ----
    ("tests/p0_smoke.sh", "冒烟测试（21 项，含合盘 + 隐私守卫）"),
]

APP_FILES = [
    ("mobile/README.md", "App 说明 / 跑起来 / 上架 / 支付合规"),
    ("mobile/package.json", "依赖 (Expo ~51 / RN 0.74)"),
    ("mobile/app.json", "Expo 配置 ★ extra.apiBaseUrl 必须改成你的后端地址"),
    ("mobile/babel.config.js", "Babel 预设"),
    ("mobile/index.js", "入口：registerRootComponent"),
    ("mobile/App.js", "根组件：Provider 包裹 + 原生栈导航"),
    # ---- i18n ----
    ("mobile/src/i18n/dictionary.js", "★ 8 语言词典（由网站词典生成，与网页一致）"),
    ("mobile/src/i18n/index.js", "i18n 运行时：Provider / useI18n / RTL / 持久化"),
    # ---- lib ----
    ("mobile/src/lib/api.js", "API 客户端（token / apiBaseUrl / 全部后端接口）"),
    ("mobile/src/lib/auth.js", "登录态 Context"),
    # ---- theme ----
    ("mobile/src/theme/index.js", "设计变量（与网站同色系）"),
    # ---- components ----
    ("mobile/src/components/ui.js", "UI 原子：Button/Card/H1/H2/Field/Chip/Badge…"),
    ("mobile/src/components/Screen.js", "页面骨架：安全区 + 顶栏（品牌 + 语言切换）"),
    ("mobile/src/components/LangSwitcher.js", "8 语言实时切换下拉（地球图标）"),
    ("mobile/src/components/TrustBar.js", "信任条（4 条承诺）"),
    ("mobile/src/components/WhyGrid.js", "差异化「为什么选我们」区块"),
    ("mobile/src/components/ScoreDial.js", "合盘总分圆环 + 维度进度条"),
    ("mobile/src/components/PersonForm.js", "出生信息表单（你 / TA）"),
    # ---- screens ----
    ("mobile/src/screens/HomeScreen.js", "首页：Hero+信任+差异化+定价+FAQ+CTA"),
    ("mobile/src/screens/FunnelScreen.js", "合盘漏斗：选关系类型→填双方→免费预览"),
    ("mobile/src/screens/ReportScreen.js", "报告页：锁定预览→解锁→完整报告+反馈+分享"),
    ("mobile/src/screens/PaywallScreen.js", "付费墙：套餐 + 下单"),
    ("mobile/src/screens/AuthScreen.js", "注册 / 登录"),
    ("mobile/src/screens/AccountScreen.js", "我的：资料/额度/历史/导出/删除/登出"),
]


import re

# Keys whose values must be redacted in deliverables (never ship real secrets).
_SECRET_RE = re.compile(
    r'^(JWT_SECRET|OPENAI_API_KEY|.*_API_KEY|.*_SECRET|.*_TOKEN)\s*=\s*.+$',
    re.IGNORECASE | re.MULTILINE,
)


def sanitize(rel, content):
    """Strip real secret values from env-style files before packaging."""
    if os.path.basename(rel) == ".dev.vars" or rel.endswith(".vars"):
        def _redact(m):
            key = m.group(0).split("=", 1)[0]
            return f"{key}=<<在此填入你自己的值 / put your own value here>>"
        return _SECRET_RE.sub(_redact, content)
    return content


def build_bundle(title, subtitle, files, out_name):
    lines = []
    bar = "=" * 78
    lines.append(bar)
    lines.append(f"  {title}")
    lines.append(f"  {subtitle}")
    lines.append(f"  打包日期: {date.today().isoformat()}   文件数: {len(files)}")
    lines.append(bar)
    lines.append("")
    lines.append("说明：本文件把整个代码库按阅读顺序拼接为单一文件，便于你用其它工具润色。")
    lines.append("每个文件以 `>>>>> FILE n/N: 路径` 开始、以 `<<<<< END FILE` 结束，")
    lines.append("按此边界即可无损拆回原始目录结构。")
    lines.append("")
    lines.append("-" * 78)
    lines.append("目录 (Table of Contents)")
    lines.append("-" * 78)
    n = len(files)
    for i, (rel, desc) in enumerate(files, 1):
        lines.append(f"  {i:>2}/{n}  {rel}")
        lines.append(f"         └─ {desc}")
    lines.append("-" * 78)
    lines.append("")

    for i, (rel, desc) in enumerate(files, 1):
        path = os.path.join(ROOT, rel)
        lines.append("")
        lines.append(f">>>>> FILE {i}/{n}: {rel}")
        lines.append(f">>>>> DESC: {desc}")
        lines.append(f">>>>> LANG: {lang_of(rel)}")
        lines.append(">" * 78)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            content = sanitize(rel, content)
            lines.append(content.rstrip("\n"))
        else:
            lines.append(f"[!! MISSING FILE: {rel} — not found at package time]")
        lines.append("<" * 78)
        lines.append(f"<<<<< END FILE {i}/{n}: {rel}")
        lines.append("")

    out_path = os.path.join(OUT_DIR, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    size = os.path.getsize(out_path)
    print(f"WROTE {out_name}  ({len(files)} files, {size:,} bytes)")
    return out_path


if __name__ == "__main__":
    build_bundle(
        "子午·合盘 Meridian Sync — 网站全部代码 (WEBSITE / FULL STACK)",
        "Cloudflare Workers + Hono + D1 + 原生 JS SPA · 8 国语言实时切换 + RTL",
        WEBSITE_FILES,
        "meridian_website_ALL_CODE.txt",
    )
    build_bundle(
        "子午·合盘 Meridian Sync — 移动 App 全部代码 (MOBILE APP)",
        "Expo (React Native) · 8 国语言实时切换 + 阿拉伯语 RTL · 与网站同后端",
        APP_FILES,
        "meridian_app_ALL_CODE.txt",
    )
    print("DONE")
