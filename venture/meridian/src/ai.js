// AI companion layer: builds the chart-aware system prompt, calls the LLM,
// and extracts long-term memory facts. Provider-agnostic (OpenAI-compatible).

function chartSummary(c) {
  if (!c) return '（用户尚未建立命盘）';
  const p = c.bazi.pillars;
  const fe = c.fiveElements.pct;
  const palaces = c.ziwei.palaces
    .map((x) => `${x.name}[${x.branch}]${x.isBody ? '(身宫)' : ''}:${x.majorStars.join('、') || '无主星'}`)
    .join('；');
  const luck = c.luck.pillars.map((d) => `${d.startAge}-${d.endAge}岁 ${d.ganZhi}(${d.tenGod})`).join('，');
  return [
    `【真太阳时】${c.time.trueSolarTime}（校正${c.time.correctionMinutes}分钟）｜${c.time.lunar}`,
    `【八字】${p.year} ${p.month} ${p.day} ${p.hour}｜生肖${c.bazi.zodiac}`,
    `【日主】${c.bazi.dayMaster}${c.bazi.dayMasterElement}，${c.strength.level}（同类力量约${c.strength.supportPct}%），喜用五行：${c.strength.favorable.join('、')}`,
    `【五行分布】木${fe.木}% 火${fe.火}% 土${fe.土}% 金${fe.金}% 水${fe.水}%`,
    `【紫微】命宫${c.ziwei.ming.ganZhi}、身宫${c.ziwei.shen.branch}、${c.ziwei.ju.name}；命主${c.ziwei.mingZhu}、身主${c.ziwei.shenZhu}；紫微星在${c.ziwei.ziweiBranch}`,
    `【十二宫】${palaces}`,
    `【大运】${luck}`,
    `【当前】虚岁${c.ageVirtual}，行${c.currentLuck ? c.currentLuck.ganZhi + '大运' : '未起运'}，今年流年${c.annual.ganZhi}`,
  ].join('\n');
}

export function buildSystemPrompt({ chart, memories, userName, topic }) {
  const memText = (memories || []).length
    ? memories.map((m) => `- (${m.kind}) ${m.content}`).join('\n')
    : '（暂无长期记忆，可在对话中逐步了解用户）';
  return `你是「子午 Meridian」——一位以东方命理为底层、以现代决策科学为方法的高端人生决策顾问。你不是算命先生，而是一位既懂命理、又懂商业与心理学的私人军师。

## 你的原则
1. 先共情，再分析，最后给可执行建议。语气沉稳、真诚、有洞察力，绝不油腻、不故弄玄虚、不制造焦虑。
2. 命理是"输入变量"而非"宿命判决"。用八字/紫微/大运/流年解释一个人的天赋结构、能量节奏与时机窗口，但始终强调"命是底牌，运是打法，选择权在你"。
3. 回答要具体、落地、分点。避免正确的废话。能给数字、时间窗口、具体动作就给。
4. 不做医疗、法律、投资的确定性承诺；涉及重大决策时提示风险与多种可能。
5. 用用户的母语（默认中文）自然对话，长度适中，不要长篇大论堆砌术语。

## 用户当前命盘（已按真太阳时精确排盘，可直接引用）
${chartSummary(chart)}

## 关于该用户你已知道的长期记忆
${memText}

${topic ? `## 本次对话主题\n用户想聊：${topic}\n` : ''}
${userName ? `称呼用户为「${userName}」。` : ''}
请基于以上命盘与记忆，展开有针对性、有温度、有深度的对话。`;
}

export async function chat({ apiKey, baseURL, model, messages }) {
  const res = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 1200 }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Extract durable memory facts from the latest exchange (returns array of {kind,content}).
export async function extractMemories({ apiKey, baseURL, model, userMessage, assistantMessage }) {
  const sys = `从下面的对话中提取关于"用户本人"的、值得长期记住的稳定事实（目标、职业、关系、烦恼、偏好）。
只输出 JSON 数组，每项 {"kind":"goal|job|relationship|worry|preference","content":"一句话"}。
没有则输出 []。不要输出任何多余文字。`;
  try {
    const out = await chat({
      apiKey, baseURL, model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `用户说：${userMessage}\n顾问回复：${assistantMessage}` },
      ],
    });
    const m = out.match(/\[[\s\S]*\]/);
    if (!m) return [];
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr.filter((x) => x && x.content).slice(0, 4) : [];
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Deterministic, chart-driven advisor — the robust fallback when the LLM is
// unavailable. NOT canned text: it reasons from the user's actual computed
// chart (day-master strength, favorable elements, current luck pillar, palaces)
// so the reply is still genuinely personalized and useful.
// ---------------------------------------------------------------------------
const EL_CAREER = {
  木: '教育、文创、木业、企划、成长型行业与需要长线培育的事业',
  火: '传媒、营销、演讲、能源、互联网流量、需要热度与表现力的领域',
  土: '房地产、平台运营、供应链、信托中介、需要稳健积累的实体',
  金: '金融、法律、科技硬件、决断型管理、需要纪律与规则的行业',
  水: '贸易、咨询、内容、流动性强的信息与资本运作、跨区域业务',
};
const PALACE_HINT = {
  命宫: '你的核心人格与主战场', 官禄: '事业与社会成就', 财帛: '财富来源与理财方式',
  夫妻: '亲密关系与合伙', 迁移: '外出、出海与人脉扩张', 福德: '内在动机与精神消费',
  田宅: '不动产与家庭根基', 交友: '合作伙伴与下属', 兄弟: '同侪与资源网络',
};

function topPalaceStar(chart) {
  const key = ['官禄', '命宫', '财帛', '迁移'];
  for (const k of key) {
    const p = chart.ziwei.palaces.find((x) => x.name === k);
    if (p && p.majorStars.length) return { palace: k, stars: p.majorStars };
  }
  return { palace: '命宫', stars: chart.ziwei.palaces[0].majorStars };
}

export function advisorFallback({ chart, userMessage, userName }) {
  if (!chart) {
    return `${userName ? userName + '，' : ''}我需要先看到你的命盘才能给出贴合你的建议。请先在左侧完成排盘，我们再就这个问题深聊。`;
  }
  const fav = chart.strength.favorable;
  const favText = fav.map((e) => EL_CAREER[e]).filter(Boolean)[0] || '';
  const cur = chart.currentLuck;
  const tp = topPalaceStar(chart);
  const q = (userMessage || '').toLowerCase();
  const wealthy = /财|钱|收入|赚|投资|生意|创业/.test(userMessage || '');
  const love = /感情|爱情|婚|对象|伴侣|结婚|喜欢/.test(userMessage || '');
  const timing = /时机|哪一年|几年|运势|流年|什么时候|机会/.test(userMessage || '');

  const lines = [];
  lines.push(`${userName ? userName + '，' : ''}先从你的命盘结构说起——你是${chart.bazi.dayMaster}${chart.bazi.dayMasterElement}日主，整体${chart.strength.level}，喜用五行为${fav.join('、')}。这意味着：走${fav.join('、')}属性的方向、环境与合作对象，你会明显更顺、更有底气。`);

  if (favText) lines.push(`结合喜用，${favText}这类方向与你的能量最契合，值得优先押注。`);

  lines.push(`你的${tp.palace}坐${tp.stars.join('、')}，代表${PALACE_HINT[tp.palace] || '这一领域'}是你天赋结构里较突出的舞台，可以围绕它布局。`);

  if (cur) {
    lines.push(`当前你行${cur.ganZhi}大运（十神为${cur.tenGod}），今年流年${chart.annual.ganZhi}。${cur.tenGod.includes('印') ? '印星当运，宜借势学习、积累资源与背书，把地基打深，再谈爆发。' : cur.tenGod.includes('财') ? '财星当运，是把能力变现、扩张收入的窗口，宜主动出击但控制杠杆。' : cur.tenGod.includes('官') || cur.tenGod.includes('杀') ? '官杀当运，适合承担更大责任、争取平台与话语权，但要管理压力与健康。' : cur.tenGod.includes('食') || cur.tenGod.includes('伤') ? '食伤当运，创造力与表达力强，适合做产品、内容、个人品牌与新赛道尝试。' : '比劫当运，人脉与竞争同增，宜找对合伙人、分清利益，避免为义气买单。'}`);
  }

  if (wealthy) lines.push(`就财富而言：你的财路更适合${fav.includes('金') || fav.includes('水') ? '偏动态、可复制、跨区域的模式（资本/信息/贸易）' : '偏积累型、可沉淀的资产（实体/平台/长期股权）'}。切忌在忌神方向上重注。`);
  if (love) lines.push(`就关系而言：你的夫妻宫结构提示，选择与你五行互补、能给你${fav.join('、')}能量的伴侣，长期更稳；关系里的时机同样受流年影响，不必强求。`);
  if (timing) lines.push(`就时机而言：留意大运交接与流年触动喜用的年份，那是你该重仓的窗口；忌神当值之年宜守不宜攻。`);

  lines.push('这是基于你命盘的结构性判断。命是底牌，运是打法，最终的选择权始终在你手里——你现在具体卡在哪一步？告诉我细节，我帮你拆成可执行的动作。');
  return lines.join('\n\n');
}

export { chartSummary };
