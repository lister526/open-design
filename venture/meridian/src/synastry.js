// synastry.js — 东方「合盘/缘分」引擎 [IMPLEMENTED]
//
// 输入两个 buildChart() 产出的命盘，输出一份结构化的关系相性分析。
// 设计原则（ADR-001 延续）：这是**文化反思 + 结构化关系视角**，不是现实因果保证。
// 我们用可解释的规则（五行生克、天干合、地支六合/三合/六冲/相刑、日主关系、
// 十神互动、紫微命宫呼应）生成分数与叙事，并对每条结论标注「据…」来源，
// 让「命中感」来自真实结构对应，而非随机套话。

import { STEM_EL, BRANCH_EL, STEM_YY } from './engine.js';

// —— 关系表 ——
const STEM_COMBINE = { 甲己: '土', 乙庚: '金', 丙辛: '水', 丁壬: '木', 戊癸: '火' }; // 天干五合
const BRANCH_LIUHE = { 子丑: 1, 寅亥: 1, 卯戌: 1, 辰酉: 1, 巳申: 1, 午未: 1 };        // 地支六合
const BRANCH_SANHE = [['申', '子', '辰'], ['亥', '卯', '未'], ['寅', '午', '戌'], ['巳', '酉', '丑']]; // 三合局
const BRANCH_CHONG = { 子午: 1, 丑未: 1, 寅申: 1, 卯酉: 1, 辰戌: 1, 巳亥: 1 };          // 六冲
const BRANCH_XING = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];              // 相刑（简化）

// 五行生克
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // A 生 B
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };     // A 克 B

function pair(a, b) { return STEM_COMBINE[a + b] || STEM_COMBINE[b + a] || null; }
function branchLiuhe(a, b) { return !!(BRANCH_LIUHE[a + b] || BRANCH_LIUHE[b + a]); }
function branchChong(a, b) { return !!(BRANCH_CHONG[a + b] || BRANCH_CHONG[b + a]); }
function inSameGroup(groups, a, b) { return groups.some((g) => g.includes(a) && g.includes(b) && a !== b); }

function clampScore(n) { return Math.max(5, Math.min(98, Math.round(n))); }

// 主入口：a、b 为 buildChart 结果
export function synastry(a, b, opts = {}) {
  const nameA = opts.nameA || 'A', nameB = opts.nameB || 'B';
  const relType = opts.relType || 'romance'; // romance | crush | reunion | marriage | friendship

  const dmA = a.bazi.dayMaster, dmB = b.bazi.dayMaster;         // 日主天干
  const dmElA = STEM_EL[dmA], dmElB = STEM_EL[dmB];
  const dayBrA = a.bazi.pillars.day[1], dayBrB = b.bazi.pillars.day[1]; // 日支（配偶宫）
  const yinYangA = STEM_YY[dmA], yinYangB = STEM_YY[dmB];

  const signals = []; // {dim, delta, why, source, tone}
  const push = (dim, delta, why, source, tone = delta >= 0 ? 'pos' : 'neg') =>
    signals.push({ dim, delta, why, source, tone });

  // 1) 日主天干五合 → 强吸引/互补
  const stemCombine = pair(dmA, dmB);
  if (stemCombine) push('attraction', 16, `双方日主天干「${dmA}${dmB}」相合化${stemCombine}，一种天然的相互吸引与磁性`, '天干五合');

  // 2) 五行生克关系（日主之间）
  if (dmElA === dmElB) push('resonance', 10, `你们日主同属「${dmElA}」，相似的底层节奏，容易一见如故，也可能因太像而缺乏张力`, '五行同气', 'pos');
  else if (SHENG[dmElA] === dmElB) push('support', 12, `${nameA}的「${dmElA}」生${nameB}的「${dmElB}」——${nameA}天然更愿意付出、滋养对方`, '五行相生');
  else if (SHENG[dmElB] === dmElA) push('support', 12, `${nameB}的「${dmElB}」生${nameA}的「${dmElA}」——${nameB}是更愿意托住这段关系的人`, '五行相生');
  else if (KE[dmElA] === dmElB) push('tension', -10, `${nameA}的「${dmElA}」克${nameB}的「${dmElB}」——${nameA}容易在关系里更强势，需留意压迫感`, '五行相克');
  else if (KE[dmElB] === dmElA) push('tension', -10, `${nameB}的「${dmElB}」克${nameA}的「${dmElA}」——${nameB}容易占主导，${nameA}需要被看见`, '五行相克');

  // 3) 阴阳互补
  if (yinYangA !== yinYangB) push('attraction', 8, '一阴一阳，节奏互补，容易被彼此的不同吸引', '阴阳互补');
  else push('resonance', 4, '同阴同阳，气质相近，舒服但需主动制造新鲜感', '阴阳同类', 'pos');

  // 4) 日支（配偶宫）关系——关系里最关键的一环
  if (branchLiuhe(dayBrA, dayBrB)) push('harmony', 18, `双方日支「${dayBrA}${dayBrB}」六合——配偶宫相合，相处中有一种「回家」般的契合`, '地支六合');
  else if (branchChong(dayBrA, dayBrB)) push('harmony', -14, `双方日支「${dayBrA}${dayBrB}」相冲——配偶宫对冲，激情与摩擦并存，需要经营`, '地支六冲');
  else if (inSameGroup(BRANCH_SANHE, dayBrA, dayBrB)) push('harmony', 12, `双方日支同属三合局，价值观与生活目标方向一致`, '地支三合');
  else if (inSameGroup(BRANCH_XING, dayBrA, dayBrB)) push('harmony', -8, '双方日支相刑，容易在亲密里彼此消耗，需明确边界', '地支相刑');

  // 5) 年支/月支的整体缘分底色
  const yA = a.bazi.pillars.year[1], yB = b.bazi.pillars.year[1];
  if (branchLiuhe(yA, yB) || inSameGroup(BRANCH_SANHE, yA, yB)) push('longevity', 8, '双方年支相合，家庭背景与长期价值观容易彼此接纳', '年支相合');
  else if (branchChong(yA, yB)) push('longevity', -6, '双方年支相冲，成长背景差异较大，长期需要更多磨合', '年支相冲');

  // 6) 五行互补度（谁补谁的缺口）
  const feA = a.fiveElements?.count || {}, feB = b.fiveElements?.count || {};
  const lacksA = Object.entries(feA).filter(([, v]) => v === 0).map(([k]) => k);
  const strongB = Object.entries(feB).filter(([, v]) => v >= 3).map(([k]) => k);
  const complements = lacksA.filter((el) => strongB.includes(el));
  if (complements.length) push('support', 6 + complements.length * 2, `${nameB}的「${complements.join('、')}」正好补上${nameA}命局里缺的部分——你们能补对方的短板`, '五行互补');

  // —— 汇总维度分 ——
  const dims = ['attraction', 'resonance', 'support', 'harmony', 'longevity', 'tension'];
  const base = { attraction: 55, resonance: 55, support: 55, harmony: 55, longevity: 55, tension: 60 };
  const dimScore = {};
  for (const d of dims) {
    let s = base[d];
    for (const sig of signals) if (sig.dim === d) s += sig.delta;
    dimScore[d] = clampScore(s);
  }
  // tension 维度反向（分越高越紧张），换算为「稳定度」
  const stability = clampScore(100 - (dimScore.tension - 40));

  // 综合缘分分（加权）
  const overall = clampScore(
    dimScore.attraction * 0.22 + dimScore.harmony * 0.28 + dimScore.support * 0.18 +
    dimScore.resonance * 0.12 + dimScore.longevity * 0.12 + stability * 0.08
  );

  // —— 叙事层 ——
  const posSignals = signals.filter((s) => s.tone === 'pos').sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  const negSignals = signals.filter((s) => s.tone === 'neg').sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));

  const keyword = pickKeyword(dimScore, stability, stemCombine);
  const headline = buildHeadline(overall, keyword, relType, nameA, nameB);

  // 复合窗口 / 择时（仅 reunion / romance 给出，标注为文化视角）
  const timing = buildTiming(a, b, relType);

  return {
    overall,
    keyword,
    headline,
    dims: {
      吸引力: dimScore.attraction,
      契合度: dimScore.harmony,
      滋养度: dimScore.support,
      共鸣度: dimScore.resonance,
      长久度: dimScore.longevity,
      稳定度: stability,
    },
    // 免费可见：钩子片段（强命中的 1-2 条）+ 关键词 + 总分
    hook: (posSignals[0]?.why) || (negSignals[0]?.why) || headline,
    // 付费可见：完整信号 + 相处建议 + 择时
    strengths: posSignals.map((s) => ({ text: s.why, source: s.source })),
    frictions: negSignals.map((s) => ({ text: s.why, source: s.source })),
    dynamic: buildDynamic(dmElA, dmElB, nameA, nameB),
    advice: buildAdvice(dimScore, stability, relType, nameA, nameB),
    timing,
    disclaimer: '本合盘为东方文化视角下的关系反思，用于增进理解与自我觉察，不构成对婚恋结果的确定性预测。真实关系取决于你们双方的选择与经营。',
    meta: { relType, nameA, nameB, signalsCount: signals.length },
  };
}

function pickKeyword(d, stability, combine) {
  if (combine && d.attraction >= 75) return '天生一对的磁场';
  if (d.harmony >= 78) return '久处不厌的契合';
  if (d.attraction >= 78) return '强烈相互吸引';
  if (d.support >= 75) return '互相成全';
  if (stability <= 45) return '爱得热烈也吵得凶';
  if (d.longevity >= 72) return '细水长流';
  if (d.resonance >= 72) return '同频知己';
  return '需要用心经营的缘分';
}

function buildHeadline(overall, keyword, relType, a, b) {
  const label = { romance: '恋人', crush: '暧昧对象', reunion: '旧情', marriage: '婚配', friendship: '知己' }[relType] || '你们';
  if (overall >= 80) return `${a} 与 ${b}：${keyword}，是难得的高缘分组合`;
  if (overall >= 65) return `${a} 与 ${b}：${keyword}，有戏，但关键看下一步怎么走`;
  if (overall >= 50) return `${a} 与 ${b}：${keyword}，缘分中等偏上，经营得当能走很远`;
  return `${a} 与 ${b}：${keyword}，天生的功课较多，越了解越能相处`;
}

function buildDynamic(elA, elB, a, b) {
  const role = (x, y) => `${x}偏${{ 木: '成长与理想', 火: '热情与表达', 土: '踏实与安全感', 金: '原则与决断', 水: '灵活与情感' }[y]}`;
  return `${role(a, elA)}；${role(b, elB)}。理解彼此底层的驱动，是这段关系最省力的相处方式。`;
}

function buildAdvice(d, stability, relType, a, b) {
  const tips = [];
  if (d.attraction >= 75) tips.push('吸引力是你们的天赋，别让日常琐碎消磨掉最初的心动——保留仪式感。');
  if (d.harmony < 55) tips.push('你们的契合需要主动经营：把「我觉得你应该懂」换成「直接说出来」。');
  if (stability < 50) tips.push('你们容易爱得激烈也吵得凶。约定一个「吵架暂停词」，冲突时先降温再谈。');
  if (d.support >= 72) tips.push('你们有互相成全的底子，明确各自想要被支持的方式，会让付出被看见。');
  if (relType === 'reunion') tips.push('复合前先想清楚：当初分开的核心矛盾是否已改变？没变，复合只是重播。');
  if (relType === 'marriage') tips.push('步入婚姻前，把金钱观、原生家庭边界、要不要孩子这三件事谈透。');
  if (!tips.length) tips.push('你们的缘分是一张需要共同书写的白纸——多一点主动表达，少一点猜。');
  return tips;
}

// 择时：给出未来 6 个月里关系「高能 / 需谨慎」的月份（基于流月地支与双方日支的合冲，文化视角）
function buildTiming(a, b, relType) {
  const dayBrA = a.bazi.pillars.day[1], dayBrB = b.bazi.pillars.day[1];
  const MONTH_BRANCH = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const now = new Date();
  const out = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mBr = MONTH_BRANCH[d.getMonth()];
    let score = 0;
    if (branchLiuhe(mBr, dayBrA) || branchLiuhe(mBr, dayBrB)) score += 2;
    if (branchChong(mBr, dayBrA) || branchChong(mBr, dayBrB)) score -= 2;
    out.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      level: score >= 2 ? 'high' : score <= -2 ? 'caution' : 'steady',
      note: score >= 2 ? '关系高能期，适合推进、表白、见家长或和好' : score <= -2 ? '易起摩擦，重要对话尽量避开情绪高点' : '平稳期，适合日常经营与陪伴',
    });
  }
  return out;
}

export default { synastry };
