# -*- coding: utf-8 -*-
"""创始人命理战略 (.docx) — 基于真实排盘（八字/紫微/大运/流年）的个人战略解读。"""
import os, json
from _docx_lib import (new_doc, cover, h1, h2, para, bullet, numbered, table, quote, GOLD, INK, MUTED)

OUT = os.path.join(os.path.dirname(__file__), "output")
with open(os.path.join(OUT, "founder_chart.json"), encoding="utf-8") as f:
    c = json.load(f)

p = c["bazi"]["pillars"]
dm = c["bazi"]["dayMaster"]; dme = c["bazi"]["dayMasterElement"]
strength = c["strength"]; fav = "、".join(strength["favorable"])
zw = c["ziwei"]; luck = c["luck"]["pillars"]; cur = c.get("currentLuck")
fe = c["fiveElements"]["pct"]

d = new_doc()
cover(d, "创始人命理战略", "紫微斗数 · 八字 · 大运 · 流年 —— 与创业路径的对照解读",
      ["真太阳时精确排盘（经度+均时差校正）", f"命造：{p['year']} {p['month']} {p['day']} {p['hour']} · {c['time']['lunar']}",
       "本文档为个人战略参考，命是底牌、选择在己"])

# ---------- 排盘结果 ----------
h1(d, "1　你的命盘（引擎精确计算，逐项可核对）")
para(d, f"出生：{c['input']['date']} {c['input']['time']}（{c['input']['place']}），"
        f"真太阳时校正为 {c['time']['trueSolarTime']}（校正 {c['time']['correctionMinutes']} 分钟），{c['time']['lunar']}。")
table(d, ["柱", "年", "月", "日", "时"],
      [["干支", p["year"], p["month"], p["day"], p["hour"]]],
      widths=[1.0, 1.3, 1.3, 1.3, 1.3])
table(d, ["项目", "结果"],
      [["日主 / 五行", f"{dm}（{dme}）"],
       ["旺衰", f"{strength['level']}（同类力量约 {strength['supportPct']}%）"],
       ["喜用五行", fav],
       ["五行分布", f"木{fe['木']}% 火{fe['火']}% 土{fe['土']}% 金{fe['金']}% 水{fe['水']}%"],
       ["命宫 / 身宫", f"{zw['ming']['ganZhi']} / {zw['shen']['branch']}"],
       ["五行局", zw["ju"]["name"]],
       ["命主 / 身主", f"{zw['mingZhu']} / {zw['shenZhu']}"],
       ["紫微星位", zw["ziweiBranch"]]],
      widths=[2.0, 5.0])

# ---------- 十二宫 ----------
h2(d, "1.1 紫微十二宫主星")
rows = []
for pl in zw["palaces"]:
    rows.append([pl["name"] + ("（身宫）" if pl["isBody"] else ""), pl["ganZhi"], "、".join(pl["majorStars"]) or "（借对宫）"])
table(d, ["宫位", "干支", "主星"], rows, widths=[1.8, 1.2, 4.0])

# ---------- 天赋结构 ----------
h1(d, "2　天赋结构解读")
para(d, f"你是 {dm}{dme} 日主，整体 {strength['level']}。{dme}性之人，"
        "重情感、善感知、思维流动、适应力强、有敏锐的洞察与共情——这与你人文背景高度契合，也正是‘做懂人的产品’的天赋来源。")
para(d, f"喜用五行为 {fav}。这意味着：在与 {fav} 相关的方向、环境与合作对象中，你会更顺、更有底气。"
        "落到事业上，偏向金/水属性的领域——金融、法律、科技、纪律型管理，以及贸易、咨询、内容、跨区域/流动性强的信息与资本运作——最能借力你的天赋。")
mz = zw["mingZhu"]; sz = zw["shenZhu"]
para(d, f"命主 {mz}、身主 {sz}：{mz} 主刚毅、决断、目标感与执行力（利于开创与掌控）；"
        f"{sz} 主才华、文采、审美与表达（利于内容、品牌与产品叙事）。刚（武曲）柔（文昌）相济，"
        "恰是‘既能定方向、又能讲好故事’的创业者气质。")
# 官禄/财帛/迁移 highlights
def palace(name):
    return next((x for x in zw["palaces"] if x["name"] == name), None)
guanlu = palace("官禄"); caibo = palace("财帛"); qianyi = palace("迁移")
if guanlu:
    para(d, f"官禄宫（事业）坐 {'、'.join(guanlu['majorStars']) or '借对宫'}：事业舞台是你结构中值得重点经营的场域，"
            "适合以‘长期主义 + 平台化’的方式积累社会成就。")
if qianyi:
    para(d, f"迁移宫坐 {'、'.join(qianyi['majorStars']) or '借对宫'}：外出、出海、跨区域拓展对你有利——"
            "这与产品‘先服务全球华人、再向海外拓展’的出海战略方向一致。")

# ---------- 大运节奏 ----------
h1(d, "3　大运节奏与创业时机")
para(d, "大运是你人生的‘十年打法’。下表为引擎推算的大运序列（十神相对日主）：")
lrows = [[f"{x['startAge']}–{x['endAge']} 岁", x["ganZhi"], x["tenGod"], x["element"]] for x in luck[:8]]
table(d, ["年龄段", "大运干支", "十神", "五行"], lrows, widths=[1.6, 1.4, 1.5, 1.5])
if cur:
    tg = cur["tenGod"]
    if "印" in tg:
        adv = "印星当运——这是‘打地基、积累资源与背书、建立壁垒’的阶段。对创业者而言，宜把产品、护城河、"\
              "口碑与个人品牌做扎实，先深蹲、后起跳；不宜盲目扩张或过度加杠杆。你现在正处这一窗口，"\
              "与‘先把 MVP 与引擎打磨到可信、再谈规模’的节奏完全吻合。"
    elif "财" in tg:
        adv = "财星当运——变现与扩张的窗口，宜主动出击、把能力转成收入，但需控制杠杆与现金流。"
    elif "官" in tg or "杀" in tg:
        adv = "官杀当运——承担更大责任、争取平台与话语权的阶段，注意压力与健康管理。"
    elif "食" in tg or "伤" in tg:
        adv = "食伤当运——创造力与表达力最强，适合做产品、内容、个人品牌与新赛道。"
    else:
        adv = "比劫当运——人脉与竞争同增，宜找对合伙人、分清利益。"
    para(d, f"当前你行 {cur['ganZhi']} 大运（{tg}），今年流年 {c['annual']['ganZhi']}。{adv}")

quote(d, "把命理翻译成创业语言：你现在的‘运’适合把子午打磨成一个真正可信、可留存、有壁垒的产品——"
         "这正是当下正在做的事。等到财/官星当运的窗口，再全力放大规模与融资，节奏顺天时。")

# ---------- 与目标对照 ----------
h1(d, "4　与‘财富目标’的理性对照")
para(d, "你的目标是三十岁前迈向千万级、并怀有更长期的全球富豪榜抱负。从命理结构看，你具备开创者的决断（武曲命主）"
        "与讲故事的才华（文昌身主），喜用金水又利于金融/科技/跨区域资本运作——这类结构与‘做出高价值企业、"
        "以企业价值而非工资积累财富’的路径是相合的。")
h2(d, "4.1 命理给出的‘打法’建议")
numbered(d, "顺天时：当前印运宜‘深蹲蓄势’——先把子午做成可信、有留存、有壁垒的产品与数据资产，别急于求成。")
numbered(d, "用所长：以‘懂人 + 会讲故事 + 东方文化理解’为武器，做别人抄不走的护城河，而非拼纯技术。")
numbered(d, "借出海：迁移有利，出海是你的顺风方向；先华人、后全球，放大天花板。")
numbered(d, "控风险：喜用金水、忌神当值之年宜守不宜攻；创业上体现为‘现金流优先、不盲目加杠杆’。")
h2(d, "4.2 冷静的现实提醒")
para(d, "命理是‘概率与节奏’，不是‘保证’。千万级乃至全球富豪榜是极小概率事件，需要天赋、时机、"
        "极强执行与一点运气共同作用。命盘能告诉你‘顺风方向与窗口’，但真正决定结果的，是你在每个窗口里的具体选择与坚持。"
        "这份文档的价值，是让你在正确的节奏上，把有限的资源押在对的方向——这本身就能大幅提高成功概率。")

quote(d, "命是底牌，运是打法，选择权在你。你已经在正确的赛道、正确的节奏上，落子了。")

path = os.path.join(OUT, "创始人命理战略.docx")
d.save(path)
print("SAVED", path)
