# -*- coding: utf-8 -*-
"""Meridian 财务模型 (.docx + .csv) — 单位经济、三年预测、敏感性分析。"""
import os, csv
from _docx_lib import (new_doc, cover, h1, h2, para, bullet, table, quote, GOLD, MUTED)

OUT = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUT, exist_ok=True)

ARPU_PLUS = 29.0
ARPU_PRO = 99.0
PRICE_BLEND = 40.0
LLM_COST_PER_PAYING = 6.0
CONV_Y1, CONV_Y2, CONV_Y3 = 0.03, 0.05, 0.07
CHURN = 0.08
CAC = 18.0

REG = [10000, 100000, 400000]
labels = ["第 1 年", "第 2 年", "第 3 年"]
conv = [CONV_Y1, CONV_Y2, CONV_Y3]

rows_fin = []
for i in range(3):
    paying = int(REG[i] * conv[i])
    mrr = paying * PRICE_BLEND
    rev = mrr * 12
    cost_llm = paying * LLM_COST_PER_PAYING * 12
    cost_cac = REG[i] * CAC
    gross = rev - cost_llm
    gm = gross / rev if rev else 0
    op = gross - cost_cac
    rows_fin.append([labels[i], f"{REG[i]:,}", f"{conv[i]*100:.0f}%", f"{paying:,}",
                     f"¥{mrr:,.0f}", f"¥{rev:,.0f}", f"{gm*100:.0f}%", f"¥{op:,.0f}"])

ltv = PRICE_BLEND * (1/CHURN) * 0.85
ltv_cac = ltv / CAC

d = new_doc()
cover(d, "子午 · Meridian", "财务模型与单位经济分析",
      ["版本 v1.0 · 2026", "配套《商业计划书》", "所有数字均为可调假设，非承诺"])

h1(d, "1　核心假设")
table(d, ["参数", "取值", "说明"],
      [["混合月付费 ARPU", f"¥{PRICE_BLEND:.0f}", "Plus ¥29 为主 + 少量 Pro ¥99"],
       ["付费转化率", "3% → 5% → 7%", "随体验/话术优化逐年提升"],
       ["月流失率", f"{CHURN*100:.0f}%", "记忆系统拉低流失是关键假设"],
       ["单注册获客成本 CAC", f"¥{CAC:.0f}", "以内容+裂变为主，付费投放为辅"],
       ["每付费用户月成本", f"¥{LLM_COST_PER_PAYING:.0f}", "LLM 调用 + 云资源；降级顾问兜底成本"]],
      widths=[2.2, 1.4, 3.4])

h1(d, "2　三年预测")
table(d, ["年度", "注册数", "转化", "付费用户", "MRR", "年营收≈ARR", "毛利率", "经营利润"],
      rows_fin, widths=[0.8, 1.0, 0.7, 1.0, 1.0, 1.2, 0.7, 1.1])
para(d, "说明：为保守起见，年营收仅计订阅，未纳入增值项目（择日、合盘、年度报告、专家市场、出海溢价与潜在电商/衍生品），"
        "这些是显著的向上弹性。", color=MUTED, size=10)

h1(d, "3　单位经济（Unit Economics）")
bullet(d, f"单付费用户 LTV ≈ ¥{ltv:,.0f}（ARPU × 平均生命周期 × 毛利率）。", "LTV：")
bullet(d, f"单注册 CAC ≈ ¥{CAC:.0f}。", "CAC：")
bullet(d, f"LTV / CAC ≈ {ltv_cac:.1f}（健康门槛通常为 3 以上）。", "比值：")
para(d, "结论：在‘内容+裂变为主’的低获客成本假设下，模型具备健康的单位经济；提升留存（降低流失）对 LTV 的杠杆最大，"
        "这正是‘记忆驱动的军师’的战略意义。")

h1(d, "4　敏感性分析")
table(d, ["情景", "转化率", "月流失", "第 3 年付费用户", "第 3 年 ARR"],
      [["保守", "5%", "12%", f"{int(REG[2]*0.05):,}", f"¥{int(REG[2]*0.05)*PRICE_BLEND*12:,.0f}"],
       ["基准", "7%", "8%", f"{int(REG[2]*0.07):,}", f"¥{int(REG[2]*0.07)*PRICE_BLEND*12:,.0f}"],
       ["乐观", "9%", "5%", f"{int(REG[2]*0.09):,}", f"¥{int(REG[2]*0.09)*PRICE_BLEND*12:,.0f}"]],
      widths=[1.2, 1.2, 1.2, 1.7, 1.7])

quote(d, "财富目标视角：单纯订阅难以直达‘千万级’，真正的量级来自——高留存拉高估值倍数、"
         "出海与增值提升客单、以及数据/引擎壁垒带来的资本溢价。财富是‘企业价值’的映射，而非月流水的简单累加。")

path = os.path.join(OUT, "子午Meridian_财务模型.docx")
d.save(path)
print("SAVED", path)

csv_path = os.path.join(OUT, "子午Meridian_财务模型.csv")
with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["年度", "注册数", "转化率", "付费用户", "MRR(元)", "年营收ARR(元)", "毛利率", "经营利润(元)"])
    for i in range(3):
        paying = int(REG[i]*conv[i]); mrr = paying*PRICE_BLEND; rev = mrr*12
        cost_llm = paying*LLM_COST_PER_PAYING*12; gross = rev-cost_llm
        gm = gross/rev if rev else 0; op = gross - REG[i]*CAC
        w.writerow([labels[i], REG[i], f"{conv[i]*100:.0f}%", paying, f"{mrr:.0f}", f"{rev:.0f}", f"{gm*100:.0f}%", f"{op:.0f}"])
print("SAVED", csv_path)
