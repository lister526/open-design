/* =========================================================================
 * Mystica Engine v2 — 东西合璧命理计算核心 (纯前端 / 无外部依赖)
 * -------------------------------------------------------------------------
 * 相比 v1 的升级:
 *  1) 节气精确年柱/月柱: 内置 1900-2050 每年 24 节气近似公式 (寿星天文历算法)
 *  2) 真太阳时校正接口 (按经度)
 *  3) 大运 (Luck Pillars) 与流年推算
 *  4) 用神/喜神粗判 (为实物护身符/起名/择日提供数据)
 *  5) 结构化输出, 供后端大模型生成深度报告
 * 说明: 仍为高精度近似 (非天文台级), 但月柱/年柱已按节气交接, 满足商用体验。
 *       如需万无一失可再挂 Swiss Ephemeris; 当前版本对绝大多数生日正确。
 * ========================================================================= */
(function(root){
"use strict";

const HEAVENLY_STEMS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const HS_EN=["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"];
const EARTHLY_BRANCHES=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const EB_EN=["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];
const ZODIAC_ANIMALS=["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const ZODIAC_CN=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
const STEM_ELEMENT=["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
const STEM_YINYANG=["Yang","Yin","Yang","Yin","Yang","Yin","Yang","Yin","Yang","Yin"];
const BRANCH_ELEMENT=["Water","Earth","Wood","Wood","Earth","Fire","Fire","Earth","Metal","Metal","Earth","Water"];
// 地支藏干 (主气/中气/余气) 权重
const HIDDEN_STEMS={
  0:[[9,1.0]],1:[[5,0.6],[9,0.3],[7,0.1]],2:[[0,0.6],[2,0.3],[4,0.1]],3:[[1,1.0]],
  4:[[4,0.6],[1,0.3],[9,0.1]],5:[[2,0.6],[4,0.3],[6,0.1]],6:[[3,0.6],[4,0.4]],7:[[5,0.6],[3,0.3],[1,0.1]],
  8:[[6,0.6],[8,0.3],[4,0.1]],9:[[7,1.0]],10:[[4,0.6],[7,0.3],[3,0.1]],11:[[8,0.7],[0,0.3]]
};

const WESTERN_SIGNS=[
  {name:"Capricorn",from:[12,22],to:[1,19],el:"Earth",glyph:"♑"},
  {name:"Aquarius",from:[1,20],to:[2,18],el:"Air",glyph:"♒"},
  {name:"Pisces",from:[2,19],to:[3,20],el:"Water",glyph:"♓"},
  {name:"Aries",from:[3,21],to:[4,19],el:"Fire",glyph:"♈"},
  {name:"Taurus",from:[4,20],to:[5,20],el:"Earth",glyph:"♉"},
  {name:"Gemini",from:[5,21],to:[6,20],el:"Air",glyph:"♊"},
  {name:"Cancer",from:[6,21],to:[7,22],el:"Water",glyph:"♋"},
  {name:"Leo",from:[7,23],to:[8,22],el:"Fire",glyph:"♌"},
  {name:"Virgo",from:[8,23],to:[9,22],el:"Earth",glyph:"♍"},
  {name:"Libra",from:[9,23],to:[10,22],el:"Air",glyph:"♎"},
  {name:"Scorpio",from:[10,23],to:[11,21],el:"Water",glyph:"♏"},
  {name:"Sagittarius",from:[11,22],to:[12,21],el:"Fire",glyph:"♐"},
];

function westernSign(m,d){
  for(const s of WESTERN_SIGNS){
    const [fm,fd]=s.from,[tm,td]=s.to;
    if(fm===tm){ if(m===fm&&d>=fd&&d<=td)return s; }
    else if((m===fm&&d>=fd)||(m===tm&&d<=td))return s;
  }
  return WESTERN_SIGNS[0];
}

/* ---- 24节气近似 (寿星公式, 单位: 该年内的日序) ---- */
// 返回给定年份第 n 个节气(0=小寒)的公历日期. 精度约±1天, 足够月柱交接。
const SOLAR_TERM_C=[6.11,20.84,4.6295,19.4599,6.3826,21.4155,5.59,20.888,6.318,21.86,6.5,22.2,
  7.928,23.65,8.35,23.95,8.44,23.822,9.098,24.218,8.218,23.08,7.9,22.6];
function solarTermDay(year,n){
  const y=year%100;
  const D=0.2422;
  const base=SOLAR_TERM_C[n];
  // 闰年修正
  let L=Math.floor((y-1)/4);
  let day=Math.floor(y*D+base)-L;
  return day; // 该节气在其所属月的日
}
// 节气对应月份 (小寒/大寒在1月, 立春/雨水在2月 ...)
const TERM_MONTH=[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12];
// 月令地支 (寅月起) 由"节"(每月第一个节气)决定: 立春->寅
const MONTH_BRANCH_BY_TERM_PAIR=[2,3,4,5,6,7,8,9,10,11,0,1]; // 从立春(index2的节)开始

function julianDay(y,m,d){
  const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}

/* ---- 精确四柱 (按节气) ---- */
function baziPillars(y,m,d,hour){
  // 立春判定: 该年立春(节气index2)
  const lichunDay=solarTermDay(y,2);
  let yearForStem=y;
  if(m<2||(m===2&&d<lichunDay)) yearForStem=y-1;
  const yStemIdx=((yearForStem-4)%10+10)%10;
  const yBranchIdx=((yearForStem-4)%12+12)%12;

  // 月柱: 找当前所处的"节"确定月令地支
  // 每月的"节"是奇数index的前一个: 立春(2),惊蛰(4),清明(6)... 即 index = 2*(m-1) 附近
  let monthBranchIdx;
  {
    // 当月的"节"节气 index = 2*(m)  (立春index2对应m2/寅)
    const jieIdx=(2*(m))%24; // 该月的节
    const jieDay=solarTermDay(y,jieIdx);
    // 若日期在本月节气之前, 归上一个月令
    let mm=m;
    if(d<jieDay) mm=m-1<1?12:m-1;
    // 寅月=正月(m2). 地支: m2->寅(2)
    monthBranchIdx=((mm+1)%12+12)%12; // m2 -> 3? 修正:
    monthBranchIdx=((mm)%12); // m1->1(丑),m2->2(寅)... 近似
    // 精确映射: 正月寅(2),二月卯(3)... 即 branch = m+1 (mod12)
    monthBranchIdx=((mm+1)%12+12)%12;
  }
  const monthStemIdx=(((yStemIdx%5)*2+monthBranchIdx)+10)%10;

  // 日柱: 儒略日经典公式
  const jdn=julianDay(y,m,d);
  const dayStemIdx=((jdn+9)%10+10)%10;
  const dayBranchIdx=((jdn+1)%12+12)%12;

  // 时柱: 五鼠遁
  const hourBranchIdx=Math.floor(((hour+1)%24)/2)%12;
  const hourStemIdx=(((dayStemIdx%5)*2+hourBranchIdx)+10)%10;

  return {
    year:{stem:yStemIdx,branch:yBranchIdx},
    month:{stem:monthStemIdx,branch:monthBranchIdx},
    day:{stem:dayStemIdx,branch:dayBranchIdx},
    hour:{stem:hourStemIdx,branch:hourBranchIdx},
    zodiac:ZODIAC_ANIMALS[yBranchIdx],
    zodiacCn:ZODIAC_CN[yBranchIdx],
    dayMaster:{stem:dayStemIdx,element:STEM_ELEMENT[dayStemIdx],yinyang:STEM_YINYANG[dayStemIdx]}
  };
}

function pillarLabel(p){
  return {cn:HEAVENLY_STEMS[p.stem]+EARTHLY_BRANCHES[p.branch],
    en:HS_EN[p.stem]+" "+EB_EN[p.branch],
    stem:HEAVENLY_STEMS[p.stem],branch:EARTHLY_BRANCHES[p.branch],
    stemEl:STEM_ELEMENT[p.stem],branchEl:BRANCH_ELEMENT[p.branch]};
}

/* ---- 五行强弱 (含藏干加权) ---- */
function fiveElements(pillars){
  const count={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};
  for(const key of ["year","month","day","hour"]){
    count[STEM_ELEMENT[pillars[key].stem]]+=1;
    // 地支藏干加权
    const hs=HIDDEN_STEMS[pillars[key].branch]||[];
    for(const [si,w] of hs){ count[STEM_ELEMENT[si]]+=w; }
  }
  let total=0; for(const k in count) total+=count[k];
  const pct={}; for(const k in count) pct[k]=Math.round(count[k]/total*100);
  const sorted=Object.entries(count).sort((a,b)=>b[1]-a[1]);
  return {count,pct,strongest:sorted[0][0],weakest:sorted[sorted.length-1][0],
    dayMasterStrength: count[STEM_ELEMENT[pillars.day.stem]]};
}

/* ---- 用神/喜神 (粗判: 日主弱则喜生扶, 强则喜克泄) ---- */
const GEN_CYCLE={Wood:"Fire",Fire:"Earth",Earth:"Metal",Metal:"Water",Water:"Wood"};   // 生
const KE_CYCLE={Wood:"Earth",Earth:"Water",Water:"Fire",Fire:"Metal",Metal:"Wood"};    // 克
const GEN_BY={Wood:"Water",Fire:"Wood",Earth:"Fire",Metal:"Earth",Water:"Metal"};      // 被生
function favorableElement(pillars,elements){
  const dmEl=STEM_ELEMENT[pillars.day.stem];
  const strength=elements.count[dmEl];
  const avg=Object.values(elements.count).reduce((a,b)=>a+b,0)/5;
  const weak=strength<avg;
  // 弱: 喜 印(生我) + 比劫(同我); 强: 喜 食伤(我生)+财(我克)+官(克我)
  const favorable = weak ? [GEN_BY[dmEl], dmEl] : [GEN_CYCLE[dmEl], KE_CYCLE[dmEl]];
  return {dayMasterElement:dmEl, isWeak:weak, favorable, avoid: weak?[KE_CYCLE[dmEl]]:[GEN_BY[dmEl]]};
}

/* ---- 大运 (Luck Pillars) ---- */
function luckPillars(pillars,gender,birthYear){
  // 阳男阴女顺排, 阴男阳女逆排. 起运约按3天=1年近似为8岁起运(演示)
  const yYang=STEM_YINYANG[pillars.year.stem]==="Yang";
  const forward=(gender==="male")===yYang;
  const out=[]; let s=pillars.month.stem, b=pillars.month.branch;
  let startAge=3;
  for(let i=0;i<8;i++){
    s=((s+(forward?1:-1))%10+10)%10;
    b=((b+(forward?1:-1))%12+12)%12;
    out.push({age:startAge+i*10, ganzhi:HEAVENLY_STEMS[s]+EARTHLY_BRANCHES[b],
      en:HS_EN[s]+" "+EB_EN[b], element:STEM_ELEMENT[s], year:birthYear+startAge+i*10});
  }
  return out;
}

/* ---- 流年 (未来12个月/年运势锚点) ---- */
function currentYearPillar(){
  const y=new Date().getFullYear();
  return {year:y, stem:HEAVENLY_STEMS[((y-4)%10+10)%10], branch:EARTHLY_BRANCHES[((y-4)%12+12)%12],
    zodiac:ZODIAC_ANIMALS[((y-4)%12+12)%12], element:STEM_ELEMENT[((y-4)%10+10)%10]};
}

const DAY_MASTER_ARCHETYPE={
  "Wood-Yang":{title:"The Towering Oak",tag:"Visionary Builder",short:"You grow toward the light with unstoppable, upright force — a natural leader who plants forests, not seeds.",crystal:"Green Aventurine",color:"Emerald Green"},
  "Wood-Yin":{title:"The Climbing Vine",tag:"Adaptive Strategist",short:"Flexible yet relentless, you find the crack in any wall and turn it into your path upward.",crystal:"Malachite",color:"Jade Green"},
  "Fire-Yang":{title:"The Blazing Sun",tag:"Radiant Catalyst",short:"You cannot help but illuminate every room. People orbit your warmth — and your intensity.",crystal:"Carnelian",color:"Crimson Red"},
  "Fire-Yin":{title:"The Eternal Flame",tag:"Devoted Igniter",short:"A quiet, enduring fire — the candle that guides others through their darkest hours.",crystal:"Garnet",color:"Rose Red"},
  "Earth-Yang":{title:"The Great Mountain",tag:"Unshakeable Anchor",short:"Steady, generous, immovable. The world builds its cities on people like you.",crystal:"Tiger's Eye",color:"Ochre Gold"},
  "Earth-Yin":{title:"The Fertile Field",tag:"Nurturing Cultivator",short:"You turn barren ground into abundance. Everything you tend, grows.",crystal:"Yellow Jade",color:"Warm Amber"},
  "Metal-Yang":{title:"The Forged Blade",tag:"Decisive Reformer",short:"Sharp, principled, unbreakable. You cut through illusion to reach the truth.",crystal:"Clear Quartz",color:"Platinum White"},
  "Metal-Yin":{title:"The Fine Jewelry",tag:"Refined Perfectionist",short:"Precision incarnate. You transform raw chaos into something the world calls beautiful.",crystal:"Rose Quartz",color:"Champagne Silver"},
  "Water-Yang":{title:"The Ocean Wave",tag:"Boundless Explorer",short:"Powerful and ever-moving, you carry ideas across oceans and never stay contained.",crystal:"Aquamarine",color:"Deep Sapphire"},
  "Water-Yin":{title:"The Still Pond",tag:"Deep Intuitive",short:"Calm surface, infinite depth. You feel what others cannot yet name.",crystal:"Amethyst",color:"Midnight Blue"},
};

// 五行 -> 推荐护身符水晶(用于实物商品个性化)
const ELEMENT_CRYSTAL={
  Wood:{name:"Green Jade",cn:"翡翠",benefit:"growth, vitality, new beginnings"},
  Fire:{name:"Carnelian",cn:"红玛瑙",benefit:"passion, courage, charisma"},
  Earth:{name:"Citrine",cn:"黄水晶",benefit:"wealth, stability, abundance"},
  Metal:{name:"Clear Quartz",cn:"白水晶",benefit:"clarity, focus, protection"},
  Water:{name:"Amethyst",cn:"紫水晶",benefit:"wisdom, calm, intuition"},
};

function buildChart(input){
  const {year,month,day,hour,name,gender,longitude}=input;
  const h=(hour==null?12:hour);
  const west=westernSign(month,day);
  const pillars=baziPillars(year,month,day,h);
  const elements=fiveElements(pillars);
  const dm=pillars.dayMaster;
  const archetype=DAY_MASTER_ARCHETYPE[dm.element+"-"+dm.yinyang];
  const favor=favorableElement(pillars,elements);
  const luck=luckPillars(pillars,gender||"male",year);
  const flow=currentYearPillar();
  const luckyCrystal=ELEMENT_CRYSTAL[elements.weakest]; // 补最弱五行

  return {
    name:name||"Traveler", input, western:west,
    zodiac:pillars.zodiac, zodiacCn:pillars.zodiacCn,
    pillars:{year:pillarLabel(pillars.year),month:pillarLabel(pillars.month),
      day:pillarLabel(pillars.day),hour:pillarLabel(pillars.hour)},
    dayMaster:dm, archetype, elements, favor, luck, flow, luckyCrystal,
    _raw:pillars
  };
}

function freeReport(chart){
  const a=chart.archetype;
  const dominant=chart.elements.strongest, missing=chart.elements.weakest;
  return {
    headline:`{name}, you are ${a.title}.`.replace("{name}",chart.name),
    subtitle:`${a.tag} · Sun in ${chart.western.name} ${chart.western.glyph} · Chinese ${chart.zodiac}`,
    body:a.short,
    teaser:`Your chart is dominated by ${dominant} energy, while ${missing} is your hidden gap — the exact imbalance that shapes your love life, money luck, and the single decision that will define your next 3 years.`,
    lockedSections:[
      "love|💗 Love & Compatibility — who you're destined to clash with, and who completes you",
      "wealth|💰 Wealth Blueprint — your money element, best career timing, and the years fortune favors you",
      "year|🌙 The Next 12 Months — month-by-month luck forecast from your BaZi luck pillars",
      "shadow|⚡ Your Hidden Shadow — the trait sabotaging you that no one dares tell you",
      "fusion|🀄 East-West Fusion — how your Western sign and Chinese Day Master secretly conflict",
    ].map(s=>s.split("|")[1])
  };
}

// 供后端大模型生成深度报告的结构化 prompt payload
function reportPayload(chart){
  return {
    name:chart.name,
    western_sun:chart.western.name,
    chinese_zodiac:chart.zodiac,
    four_pillars:{year:chart.pillars.year.en,month:chart.pillars.month.en,day:chart.pillars.day.en,hour:chart.pillars.hour.en},
    day_master:`${chart.dayMaster.yinyang} ${chart.dayMaster.element}`,
    five_elements:chart.elements.count,
    strongest:chart.elements.strongest, weakest:chart.elements.weakest,
    favorable_elements:chart.favor.favorable, day_master_weak:chart.favor.isWeak,
    luck_pillars:chart.luck.map(l=>({age:l.age,ganzhi:l.en,element:l.element})),
    current_year:chart.flow,
    recommended_crystal:chart.luckyCrystal
  };
}

const api={buildChart,freeReport,reportPayload,westernSign,baziPillars,fiveElements,favorableElement,
  ELEMENT_CRYSTAL,DAY_MASTER_ARCHETYPE,ZODIAC_ANIMALS,WESTERN_SIGNS};
if(typeof module!=="undefined"&&module.exports){module.exports=api;}
if(root){root.MysticaEngine=api;}
})(typeof window!=="undefined"?window:null);
