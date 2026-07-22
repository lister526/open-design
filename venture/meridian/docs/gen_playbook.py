# -*- coding: utf-8 -*-
"""落地执行手册 + 快速上手指南 (.docx)。"""
import os
from _docx_lib import (new_doc, cover, h1, h2, para, bullet, numbered, table, quote, GOLD, MUTED)

OUT = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUT, exist_ok=True)

# ============ 落地执行手册 ============
d = new_doc()
cover(d, "落地执行手册", "从今天到上线运营的可执行动作清单",
      ["配套《商业计划书》《财务模型》", "为‘现在就能动手’而写", "2026"])

h1(d, "1　产品已就绪（你现在拥有什么）")
para(d, "子午已是一个可运行的全栈产品，不是原型：")
bullet(d, "后端：Cloudflare Workers + Hono + D1 数据库（用户/命盘/对话/记忆/订阅/事件）。")
bullet(d, "命理引擎：八字、五行旺衰、大运、流年、紫微斗数十二宫+14 主星，已用真实命盘逐项验证准确。")
bullet(d, "前端：高端对话式界面（落地页、注册登录、精确排盘、军师对话、命盘面板、订阅升级）。")
bullet(d, "健壮性：LLM 不可用时自动降级为‘命盘驱动顾问’，服务不中断，回复仍然个性化。")

h1(d, "2　上线前 7 天清单")
table(d, ["天", "任务", "产出"],
      [["Day 1", "注册 Cloudflare 账号；创建 D1 数据库；配置密钥（LLM Key、JWT）", "可部署环境"],
       ["Day 2", "wrangler deploy 部署；执行远程数据库迁移", "线上可访问 URL"],
       ["Day 3", "接入真实 LLM Key（或自有模型）；跑通对话", "AI 军师上线"],
       ["Day 4", "注册域名，绑定自定义域名；准备品牌视觉", "品牌化"],
       ["Day 5", "接入支付（Stripe/微信支付/支付宝）替换 demo 升级", "可真实收款"],
       ["Day 6", "埋点校验；准备 10 条种子内容（小红书/抖音）", "增长素材"],
       ["Day 7", "小范围内测，收集 20 位种子用户反馈", "首批口碑"]],
      widths=[0.8, 3.4, 2.0])

h1(d, "3　部署命令（照抄即可）")
para(d, "在 venture/meridian 目录下：", color=MUTED, size=10)
for cmd in ["npm install",
            "npx wrangler login",
            "npx wrangler d1 create meridian-db   # 复制返回的 database_id 填入 wrangler.toml",
            "npx wrangler d1 execute meridian-db --remote --file=./migrations/0001_init.sql",
            "npx wrangler secret put OPENAI_API_KEY    # 输入你的 LLM Key",
            "npx wrangler secret put OPENAI_BASE_URL",
            "npx wrangler secret put JWT_SECRET         # 任意长随机串",
            "npx wrangler deploy"]:
    pc = d.add_paragraph(); r = pc.add_run("  " + cmd)
    r.font.name = "Consolas"; r.font.size = __import__("docx").shared.Pt(10)

h1(d, "4　冷启动内容打法（低成本获客）")
numbered(d, "选题：‘真太阳时精确排盘 vs 普通排盘’‘我用命盘做了这个决定’‘紫微十二宫看你的事业舞台’。")
numbered(d, "钩子：评论区/主页引流‘免费精确排盘 + 3 次军师对话’。")
numbered(d, "转化：体验到‘它真的懂我的盘’后，引导订阅 Plus。")
numbered(d, "裂变：合盘/给家人排盘 → 邀请返利（双方各得额度）。")

h1(d, "5　关键指标（每周盯这几个）")
table(d, ["指标", "含义", "健康信号"],
      [["注册转化率", "落地页→注册", "> 15%"],
       ["首聊完成率", "注册→完成首次对话", "> 60%"],
       ["付费转化率", "注册→付费", "3%→逐步 6–8%"],
       ["次周留存", "记忆系统是否奏效", "持续上升"],
       ["LTV/CAC", "单位经济", "> 3"]],
      widths=[1.6, 3.0, 2.4])

quote(d, "先把‘首聊完成率’与‘次周留存’做上去——这两个数字上去了，付费与增长会自然跟上。")

d.save(os.path.join(OUT, "落地执行手册.docx"))
print("SAVED 落地执行手册.docx")

# ============ 快速上手 START HERE ============
d2 = new_doc()
cover(d2, "从这里开始", "子午 Meridian · 交付物导览与使用说明",
      ["先读这一份", "5 分钟看懂你拿到了什么、怎么用", "2026"])

h1(d2, "1　你拿到的东西")
bullet(d2, "一个可运行的全栈产品（网站+后端+数据库+命理引擎+AI 军师），可现场演示、可部署上线。")
bullet(d2, "完整源代码（前端 public/、后端 src/、数据库迁移 migrations/、配置 wrangler.toml）。")
bullet(d2, "一整套 .docx 文档（Word/WPS 可正常打开，不再乱码）：商业计划书、财务模型(含 CSV)、"
           "创始人命理战略、落地执行手册、本导览。")

h1(d2, "2　文档阅读顺序")
numbered(d2, "《从这里开始》（本文）——先看全貌。")
numbered(d2, "《创始人命理战略》——你最关心的：你的盘 + 创业时机对照。")
numbered(d2, "《商业计划书》——市场、模式、竞品、GTM、风险、路线图。")
numbered(d2, "《财务模型》——单位经济与三年预测。")
numbered(d2, "《落地执行手册》——现在就能动手的清单与部署命令。")

h1(d2, "3　为什么这次不一样")
bullet(d2, "不是静态前端：有真实后端、数据库、登录、记忆、订阅——完整全栈。")
bullet(d2, "不是玄学噱头：命理引擎已用你本人的真实命盘逐项验证（八字/命宫/身宫/五行局/主星全部对上）。")
bullet(d2, "不是‘正确的废话’：产品与文档都围绕‘留存、付费、护城河’这些真正决定成败的东西。")
bullet(d2, "文件不再乱码：全部为标准 .docx，指定中文字体，WPS/Word 直接打开即正常。")

h1(d2, "4　关于你的目标")
para(d2, "钱紧、时间紧、目标大——我把有限资源集中在了‘一个能真正跑起来、且有别人抄不走护城河’的产品上，"
         "而不是又一堆漂亮的空话。命盘告诉我们：你现在正处‘蓄势’的节奏，把这个产品做扎实、做出留存与口碑，"
         "就是当下最该做的事。剩下的，交给时间与你的执行。")
quote(d2, "命是底牌，运是打法，选择权在你。这一手，已经落在对的方向上了。")

d2.save(os.path.join(OUT, "从这里开始_导览.docx"))
print("SAVED 从这里开始_导览.docx")
