/* =========================================================================
 * Mystica Engine — 东西方合璧命理计算核心 (纯前端可运行, 无外部依赖)
 * 提供: 西方太阳/月亮/上升粗算 + 中国八字(天干地支)推算 + 报告文案生成
 * 说明: 这是"内容护城河"的可运行演示版。真实生产可接入更精确的星历表(Swiss
 *       Ephemeris)与更完整的排盘算法, 但演示版已足以产生高说服力的个性化报告。
 * ========================================================================= */

const HEAVENLY_STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const HS_EN = ["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"];
const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const EB_EN = ["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];
const ZODIAC_ANIMALS = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const STEM_ELEMENT = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
const STEM_YINYANG = ["Yang","Yin","Yang","Yin","Yang","Yin","Yang","Yin","Yang","Yin"];
const BRANCH_ELEMENT = ["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];

const WESTERN_SIGNS = [
  {name:"Capricorn", from:[12,22], to:[1,19], el:"Earth", glyph:"♑"},
  {name:"Aquarius",  from:[1,20],  to:[2,18], el:"Air",   glyph:"♒"},
  {name:"Pisces",    from:[2,19],  to:[3,20], el:"Water", glyph:"♓"},
  {name:"Aries",     from:[3,21],  to:[4,19], el:"Fire",  glyph:"♈"},
  {name:"Taurus",    from:[4,20],  to:[5,20], el:"Earth", glyph:"♉"},
  {name:"Gemini",    from:[5,21],  to:[6,20], el:"Air",   glyph:"♊"},
  {name:"Cancer",    from:[6,21],  to:[7,22], el:"Water", glyph:"♋"},
  {name:"Leo",       from:[7,23],  to:[8,22], el:"Fire",  glyph:"♌"},
  {name:"Virgo",     from:[8,23],  to:[9,22], el:"Earth", glyph:"♍"},
  {name:"Libra",     from:[9,23],  to:[10,22],el:"Air",   glyph:"♎"},
  {name:"Scorpio",   from:[10,23], to:[11,21],el:"Water", glyph:"♏"},
  {name:"Sagittarius",from:[11,22],to:[12,21],el:"Fire",  glyph:"♐"},
];

function westernSign(month, day){
  for(const s of WESTERN_SIGNS){
    const [fm,fd]=s.from,[tm,td]=s.to;
    if(fm===tm){ if(month===fm && day>=fd && day<=td) return s; }
    else if((month===fm && day>=fd)||(month===tm && day<=td)) return s;
  }
  // Capricorn wraps year end
  return WESTERN_SIGNS[0];
}

/* ---- 中国八字: 以公历日期近似推算四柱 (演示级精度) ---- */
function baziPillars(y, m, d, hour){
  // 年柱: 以立春为界近似(2月4日前算上一年), 干支60甲子循环, 1984为甲子年
  let yearForStem = y;
  if(m < 2 || (m===2 && d < 4)) yearForStem = y - 1;
  const yStemIdx = ((yearForStem - 4) % 10 + 10) % 10;
  const yBranchIdx = ((yearForStem - 4) % 12 + 12) % 12;

  // 日柱: 基于儒略日的经典公式
  const jdn = julianDay(y, m, d);
  const dayStemIdx = ((jdn + 9) % 10 + 10) % 10;
  const dayBranchIdx = ((jdn + 1) % 12 + 12) % 12;

  // 月柱: 按节气近似(以公历月映射地支, 寅月起正月)
  const monthBranchIdx = ((m + 1) % 12);
  // 月干由年干推(五虎遁)
  const monthStemIdx = ((yStemIdx % 5) * 2 + monthBranchIdx) % 10;

  // 时柱: 时辰地支, 时干由日干推(五鼠遁)
  const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2) % 12;
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;

  return {
    year:  {stem:yStemIdx, branch:yBranchIdx},
    month: {stem:monthStemIdx, branch:monthBranchIdx},
    day:   {stem:dayStemIdx, branch:dayBranchIdx},
    hour:  {stem:hourStemIdx, branch:hourBranchIdx},
    zodiac: ZODIAC_ANIMALS[yBranchIdx],
    dayMaster: {stem:dayStemIdx, element:STEM_ELEMENT[dayStemIdx], yinyang:STEM_YINYANG[dayStemIdx]}
  };
}

function julianDay(y, m, d){
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
         Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function pillarLabel(p){
  return {
    cn: HEAVENLY_STEMS[p.stem] + EARTHLY_BRANCHES[p.branch],
    en: HS_EN[p.stem] + " " + EB_EN[p.branch],
    stemEl: STEM_ELEMENT[p.stem],
    branchEl: BRANCH_ELEMENT[p.branch]
  };
}

/* ---- 五行强弱统计 ---- */
function fiveElements(pillars){
  const count = {Wood:0, Fire:0, Earth:0, Metal:0, Water:0};
  for(const key of ["year","month","day","hour"]){
    count[STEM_ELEMENT[pillars[key].stem]] += 1;
    count[BRANCH_ELEMENT[pillars[key].branch]] += 1;
  }
  const total = 8;
  const pct = {};
  for(const k in count) pct[k] = Math.round(count[k]/total*100);
  // 找最强/最弱
  const sorted = Object.entries(count).sort((a,b)=>b[1]-a[1]);
  return {count, pct, strongest: sorted[0][0], weakest: sorted[sorted.length-1][0]};
}

/* ---- 报告文案库 (免费预览版给"钩子", 深度内容留给付费) ---- */
const DAY_MASTER_ARCHETYPE = {
  "Wood-Yang":  {title:"The Towering Oak", tag:"Visionary Builder", short:"You grow toward the light with unstoppable, upright force — a natural leader who plants forests, not seeds."},
  "Wood-Yin":   {title:"The Climbing Vine", tag:"Adaptive Strategist", short:"Flexible yet relentless, you find the crack in any wall and turn it into your path upward."},
  "Fire-Yang":  {title:"The Blazing Sun", tag:"Radiant Catalyst", short:"You cannot help but illuminate every room. People orbit your warmth — and your intensity."},
  "Fire-Yin":   {title:"The Eternal Flame", tag:"Devoted Igniter", short:"A quiet, enduring fire — the candle that guides others through their darkest hours."},
  "Earth-Yang": {title:"The Great Mountain", tag:"Unshakeable Anchor", short:"Steady, generous, immovable. The world builds its cities on people like you."},
  "Earth-Yin":  {title:"The Fertile Field", tag:"Nurturing Cultivator", short:"You turn barren ground into abundance. Everything you tend, grows."},
  "Metal-Yang": {title:"The Forged Blade", tag:"Decisive Reformer", short:"Sharp, principled, unbreakable. You cut through illusion to reach the truth."},
  "Metal-Yin":  {title:"The Fine Jewelry", tag:"Refined Perfectionist", short:"Precision incarnate. You transform raw chaos into something the world calls beautiful."},
  "Water-Yang": {title:"The Ocean Wave", tag:"Boundless Explorer", short:"Powerful and ever-moving, you carry ideas across oceans and never stay contained."},
  "Water-Yin":  {title:"The Still Pond", tag:"Deep Intuitive", short:"Calm surface, infinite depth. You feel what others cannot yet name."},
};

function buildChart(input){
  const {year, month, day, hour, name} = input;
  const west = westernSign(month, day);
  const pillars = baziPillars(year, month, day, hour ?? 12);
  const elements = fiveElements(pillars);
  const dm = pillars.dayMaster;
  const archetypeKey = dm.element + "-" + dm.yinyang;
  const archetype = DAY_MASTER_ARCHETYPE[archetypeKey];

  return {
    name: name || "Traveler",
    input,
    western: west,
    zodiac: pillars.zodiac,
    pillars: {
      year: pillarLabel(pillars.year),
      month: pillarLabel(pillars.month),
      day: pillarLabel(pillars.day),
      hour: pillarLabel(pillars.hour),
    },
    dayMaster: dm,
    archetype,
    elements,
  };
}

/* ---- 生成"免费预览"文案(制造好奇缺口, 引导付费) ---- */
function freeReport(chart){
  const a = chart.archetype;
  const dominant = chart.elements.strongest;
  const missing = chart.elements.weakest;
  return {
    headline: `${chart.name}, you are ${a.title}.`,
    subtitle: `${a.tag} · Western Sun in ${chart.western.name} ${chart.western.glyph} · Chinese ${chart.zodiac}`,
    body: a.short,
    teaser: `Your chart is dominated by ${dominant} energy, while ${missing} is your hidden gap — the exact imbalance that shapes your love life, money luck, and the single decision that will define your next 3 years.`,
    lockedSections: [
      "💗 Love & Compatibility — who you're destined to clash with, and who completes you",
      "💰 Wealth Blueprint — your money element, best career timing, and the years fortune favors you",
      "🌙 The Next 12 Months — month-by-month luck forecast from your BaZi luck pillars",
      "⚡ Your Hidden Shadow — the trait sabotaging you that no one dares tell you",
      "🀄 East-West Fusion — how your Western sign and Chinese Day Master secretly conflict",
    ]
  };
}

// UMD-ish export
if (typeof module !== "undefined" && module.exports){
  module.exports = { buildChart, freeReport, westernSign, baziPillars, fiveElements };
} else {
  window.MysticaEngine = { buildChart, freeReport };
}
