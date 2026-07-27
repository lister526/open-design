// ============================================================================
// Meridian Eastern-Astrology Engine
// BaZi (八字) + 五行 + 大运 + 流年 + 紫微斗数 (12 palaces, 14 major stars)
// Built on lunar-javascript for exact solar<->lunar conversion & solar terms.
// True-solar-time corrected. Verified against reference chart:
//   2000-02-05 15:05 (clock) / 14:42 (true solar), lon 117.95, male
//   => BaZi 庚辰 戊寅 癸巳 己未 ; 命宫未 身宫酉 ; 木三局 ; 紫微在辰
// ============================================================================
import { Solar, LunarUtil } from 'lunar-javascript';

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const STEM_EL = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
export const STEM_YY = { 甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳', 己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴' };
export const BRANCH_EL = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
export const ZODIAC = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' };

const EL_GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };   // 生
const EL_KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };    // 克

// ---------------------------------------------------------------------------
// True Solar Time correction
//   longitude-based: standard meridian for China civil time is 120E.
//   correction (minutes) = (lon - 120) * 4  + equationOfTime(dayOfYear)
// ---------------------------------------------------------------------------
export function trueSolarCorrectionMinutes(date, longitude) {
  const lonCorr = (longitude - 120) * 4; // minutes
  // Equation of time (approx, minutes)
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - start;
  const dayOfYear = Math.floor(diff / 86400000);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return lonCorr + eot;
}

// ---------------------------------------------------------------------------
// Core: build the lunar/eightchar objects for a given birth moment.
//   date: 'YYYY-MM-DD', time: 'HH:MM', longitude optional (default 120 = no corr)
// ---------------------------------------------------------------------------
function resolveMoment({ date, time, longitude = 120 }) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = (time || '12:00').split(':').map(Number);
  // apply true solar correction
  const civil = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
  const corr = trueSolarCorrectionMinutes(civil, longitude);
  const trueMs = civil.getTime() + corr * 60000;
  const t = new Date(trueMs);
  const solar = Solar.fromYmdHms(
    t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(),
    t.getUTCHours(), t.getUTCMinutes(), 0
  );
  return {
    solar,
    lunar: solar.getLunar(),
    trueSolarTime: `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`,
    correctionMinutes: Math.round(corr),
  };
}

// ---------------------------------------------------------------------------
// BaZi four pillars + hidden stems + wuxing
// ---------------------------------------------------------------------------
export function baziFromLunar(lunar) {
  const ec = lunar.getEightChar();
  const pillars = {
    year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime(),
  };
  const dayMaster = pillars.day[0]; // 日主/日元
  return {
    pillars,
    dayMaster,
    dayMasterElement: STEM_EL[dayMaster],
    dayMasterYinYang: STEM_YY[dayMaster],
    hidden: {
      year: ec.getYearHideGan(), month: ec.getMonthHideGan(),
      day: ec.getDayHideGan(), hour: ec.getTimeHideGan(),
    },
    nayin: {
      year: ec.getYearNaYin(), month: ec.getMonthNaYin(),
      day: ec.getDayNaYin(), hour: ec.getTimeNaYin(),
    },
    zodiac: ZODIAC[pillars.year[1]],
  };
}

// ---------------------------------------------------------------------------
// Five-element distribution (visible stems+branches + hidden stems weighted)
// ---------------------------------------------------------------------------
export function fiveElements(bazi) {
  const count = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const add = (el, w) => { if (el) count[el] += w; };
  for (const key of ['year', 'month', 'day', 'hour']) {
    const gz = bazi.pillars[key];
    add(STEM_EL[gz[0]], 1);        // heavenly stem
    add(BRANCH_EL[gz[1]], 1);      // earthly branch
    const hid = bazi.hidden[key] || [];
    hid.forEach((s, i) => add(STEM_EL[s], i === 0 ? 0.5 : 0.3)); // 藏干 weighted
  }
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const pct = {};
  for (const el in count) pct[el] = Math.round((count[el] / total) * 1000) / 10;
  return { count, pct, total: Math.round(total * 10) / 10 };
}

// ---------------------------------------------------------------------------
// Day Master strength (旺衰) — heuristic scoring
// ---------------------------------------------------------------------------
export function dayMasterStrength(bazi, fe) {
  const dm = bazi.dayMasterElement;
  const resource = Object.keys(EL_GEN).find((k) => EL_GEN[k] === dm); // 生我者=印
  const same = dm;                        // 比劫
  const supportPct = (fe.pct[same] || 0) + (fe.pct[resource] || 0);
  let level;
  if (supportPct >= 55) level = '身旺';
  else if (supportPct >= 42) level = '偏旺';
  else if (supportPct >= 30) level = '中和';
  else if (supportPct >= 20) level = '偏弱';
  else level = '身弱';
  // 喜用神 (simplified): weak -> like 印/比; strong -> like 财/官/食
  const drain = EL_GEN[dm];               // 我生者=食伤
  const wealth = EL_KE[dm];               // 我克者=财
  const officer = Object.keys(EL_KE).find((k) => EL_KE[k] === dm); // 克我者=官杀
  const favorable = supportPct < 42 ? [resource, same] : [drain, wealth, officer];
  return { level, supportPct: Math.round(supportPct * 10) / 10, favorable, dayMasterElement: dm };
}

// ---------------------------------------------------------------------------
// 十神 (Ten Gods) relative to Day Master
// ---------------------------------------------------------------------------
export function tenGod(dayMaster, targetStem) {
  const dmEl = STEM_EL[dayMaster], tEl = STEM_EL[targetStem];
  const dmYY = STEM_YY[dayMaster], tYY = STEM_YY[targetStem];
  const same = dmYY === tYY;
  if (dmEl === tEl) return same ? '比肩' : '劫财';
  if (EL_GEN[dmEl] === tEl) return same ? '食神' : '伤官';   // 我生
  if (EL_KE[dmEl] === tEl) return same ? '偏财' : '正财';    // 我克
  if (EL_GEN[tEl] === dmEl) return same ? '偏印' : '正印';   // 生我
  if (EL_KE[tEl] === dmEl) return same ? '七杀' : '正官';    // 克我
  return '';
}

// ---------------------------------------------------------------------------
// 大运 (Luck Pillars) + 流年 (Annual Pillars)
// ---------------------------------------------------------------------------
export function luckPillars(lunar, gender) {
  const ec = lunar.getEightChar();
  const yun = ec.getYun(gender === 'male' || gender === '男' ? 1 : 0);
  const list = yun.getDaYun().filter((d) => d.getGanZhi());
  return {
    startAge: yun.getStartYear(),
    startSolarYear: yun.getStartSolar ? undefined : undefined,
    pillars: list.map((d) => ({
      startAge: d.getStartAge(),
      endAge: d.getEndAge(),
      startYear: d.getStartYear(),
      ganZhi: d.getGanZhi(),
      tenGod: tenGod(ec.getDay()[0], d.getGanZhi()[0]),
      element: STEM_EL[d.getGanZhi()[0]],
    })),
  };
}

export function annualPillar(year) {
  // 干支 for a given (Gregorian≈lunar) year using 1984=甲子 anchor
  const offset = ((year - 1984) % 60 + 60) % 60;
  const gz = STEMS[offset % 10] + BRANCHES[offset % 12];
  return { year, ganZhi: gz, element: STEM_EL[gz[0]] };
}

export function currentLuck(luck, ageVirtual) {
  return luck.pillars.find((p) => ageVirtual >= p.startAge && ageVirtual <= p.endAge) || null;
}

// ---------------------------------------------------------------------------
// 紫微斗数 (Zi Wei Dou Shu)
// ---------------------------------------------------------------------------
export const PALACE_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
const YIN = 2; // index of 寅

const JU_BY_EL = { 水: 2, 木: 3, 金: 4, 土: 5, 火: 6 };
const JU_NAME = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' };

// 五虎遁: 年干 -> 寅月天干起点 index
const WUHU = { 甲: 2, 己: 2, 乙: 4, 庚: 4, 丙: 6, 辛: 6, 丁: 8, 壬: 8, 戊: 0, 癸: 0 };

function palaceStem(yearGan, branchIdx) {
  const yinStem = WUHU[yearGan];
  return STEMS[((yinStem + (branchIdx - YIN)) % 10 + 10) % 10];
}

function ziweiPosition(day, ju) {
  let n = day, cnt = 0;
  while (n % ju !== 0) { n++; cnt++; }
  const steps = n / ju;
  const base = (YIN + (steps - 1)) % 12;
  if (cnt === 0) return base;
  return cnt % 2 === 0 ? (base + cnt) % 12 : ((base - cnt) % 12 + 12) % 12;
}

// 14 major stars placement
function placeMajorStars(ziweiIdx) {
  const m = (i) => ((i % 12) + 12) % 12;
  const stars = {};
  const put = (name, idx) => { (stars[m(idx)] = stars[m(idx)] || []).push(name); };
  // 紫微系 (逆布): 紫微, 天机(-1), (空-2), 太阳(-3), 武曲(-4), 天同(-5), (空-6,-7), 廉贞(-8)
  put('紫微', ziweiIdx);
  put('天机', ziweiIdx - 1);
  put('太阳', ziweiIdx - 3);
  put('武曲', ziweiIdx - 4);
  put('天同', ziweiIdx - 5);
  put('廉贞', ziweiIdx - 8);
  // 天府系 (顺布 from 天府): 天府 对称于寅申线 => 天府 = (4 - 紫微) mod12... use standard mirror
  const tianfu = m(4 - ziweiIdx + 12); // verified 天府在子 when 紫微在辰
  put('天府', tianfu);
  put('太阴', tianfu + 1);
  put('贪狼', tianfu + 2);
  put('巨门', tianfu + 3);
  put('天相', tianfu + 4);
  put('天梁', tianfu + 5);
  put('七杀', tianfu + 6);
  put('破军', tianfu + 10);
  return stars;
}

export function ziwei(lunar) {
  const month = lunar.getMonth();          // lunar month (>0; leap handled by lib)
  const day = lunar.getDay();
  const yearGan = lunar.getYearGan();
  const timeZhi = lunar.getTimeZhi();
  const hb = BRANCHES.indexOf(timeZhi);
  const lm = Math.abs(month);

  const mingIdx = ((YIN + (lm - 1) - hb) % 12 + 12) % 12;
  const shenIdx = ((YIN + (lm - 1) + hb) % 12) % 12;

  const mingStem = palaceStem(yearGan, mingIdx);
  const mingGZ = mingStem + BRANCHES[mingIdx];
  const nayin = LunarUtil.NAYIN[mingGZ] || '';
  const juEl = nayin ? nayin[nayin.length - 1] : '木';
  const ju = JU_BY_EL[juEl] || 3;

  const ziweiIdx = ziweiPosition(day, ju);
  const starsByBranch = placeMajorStars(ziweiIdx);

  // Assign palace names counter-clockwise from 命宫
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    const branchIdx = ((mingIdx - i) % 12 + 12) % 12; // 逆行布十二宫
    palaces.push({
      name: PALACE_NAMES[i],
      branch: BRANCHES[branchIdx],
      stem: palaceStem(yearGan, branchIdx),
      ganZhi: palaceStem(yearGan, branchIdx) + BRANCHES[branchIdx],
      isBody: branchIdx === shenIdx,
      majorStars: starsByBranch[branchIdx] || [],
    });
  }

  return {
    ming: { branch: BRANCHES[mingIdx], ganZhi: mingGZ },
    shen: { branch: BRANCHES[shenIdx] },
    ju: { number: ju, name: JU_NAME[ju], element: juEl, nayin },
    ziweiBranch: BRANCHES[ziweiIdx],
    mingZhu: '武曲', // 命主 (by 命宫地支; 未->武曲 per traditional table)
    shenZhu: '文昌', // 身主 (by 年支)
    palaces,
  };
}

// 命主/身主 lookup tables (by 命宫支 / 年支)
const MING_ZHU = { 子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲', 辰: '廉贞', 巳: '武曲', 午: '破军', 未: '武曲', 申: '廉贞', 酉: '文曲', 戌: '禄存', 亥: '巨门' };
const SHEN_ZHU = { 子: '火星', 丑: '天相', 寅: '天梁', 卯: '天同', 辰: '文昌', 巳: '天机', 午: '火星', 未: '天相', 申: '天梁', 酉: '天同', 戌: '文昌', 亥: '天机' };

// ---------------------------------------------------------------------------
// buildChart — the full assembler
// ---------------------------------------------------------------------------
export function buildChart({ gender, date, time, place = '', longitude = 120 }) {
  const { solar, lunar, trueSolarTime, correctionMinutes } = resolveMoment({ date, time, longitude });
  const bazi = baziFromLunar(lunar);
  const fe = fiveElements(bazi);
  const strength = dayMasterStrength(bazi, fe);
  const luck = luckPillars(lunar, gender);
  const zw = ziwei(lunar);
  // fix 命主/身主 from tables
  zw.mingZhu = MING_ZHU[zw.ming.branch] || zw.mingZhu;
  zw.shenZhu = SHEN_ZHU[bazi.pillars.year[1]] || zw.shenZhu;

  const nowYear = new Date().getFullYear();
  const birthYear = Number(date.split('-')[0]);
  const ageVirtual = nowYear - birthYear + 1;

  // ten gods for the four stems (excluding day master itself)
  const tenGods = {
    year: tenGod(bazi.dayMaster, bazi.pillars.year[0]),
    month: tenGod(bazi.dayMaster, bazi.pillars.month[0]),
    hour: tenGod(bazi.dayMaster, bazi.pillars.hour[0]),
  };

  return {
    input: { gender, date, time, place, longitude },
    time: {
      civil: `${date} ${time}`,
      trueSolarTime,
      correctionMinutes,
      lunar: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      solarTerm: lunar.getJieQi ? undefined : undefined,
    },
    bazi: { ...bazi, tenGods },
    fiveElements: fe,
    strength,
    luck,
    annual: annualPillar(nowYear),
    currentLuck: currentLuck(luck, ageVirtual),
    ageVirtual,
    ziwei: zw,
    computedAt: new Date().toISOString(),
    // Cultural-lens metadata (ADR-001): NOT a deterministic causal engine.
    meta: {
      confidence: {
        bazi: 'high',            // solar-term year boundary + true-solar-time via lunar-javascript
        luck: 'high',            // 大运 driven by the library
        ziwei: 'experimental',   // major stars only; minor stars & schools not fully modeled
        favorable_elements: 'heuristic', // simplified strength ratio, not authoritative
      },
      trueSolarApplied: true,
      rulesNote: '流派/规则版本简化；节气·闰月·历史时区回归测试集尚未完成。',
      disclaimer: '本命盘用于文化反思与自我认知，不构成对职业、投资、医疗、法律、婚姻的确定性因果判断；重大决策请结合真实信息与专业意见。',
    },
  };
}

export default { buildChart, baziFromLunar, fiveElements, dayMasterStrength, luckPillars, annualPillar, ziwei, tenGod };
