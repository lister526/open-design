// i18n.js — web SPA translations. zh/en full; others fall back to en for brevity in v1.
export const LANGS = [
  { code: 'zh', label: '中文' }, { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Español' }, { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' }, { code: 'hi', label: 'हिन्दी' }, { code: 'fr', label: 'Français' },
];

let LANG = localStorage.getItem('wk_lang') || 'zh';
export function getLang() { return LANG; }
export function setLang(l) { LANG = l; localStorage.setItem('wk_lang', l); }

const DICT = {
  zh: {
    nav_studio: '创作台', nav_templates: '模板网络', nav_creator: '创作者', nav_metrics: '数据',
    login: '登录', logout: '退出',
    hero_eyebrow: 'AI 营销内容创作网络',
    hero_title: '3 分钟，把一个产品<br>变成一整套<span style="background:linear-gradient(135deg,#5b8cff,#8a6bff);-webkit-background-clip:text;background-clip:text;color:transparent">会卖货的内容</span>',
    hero_sub: '上传产品 → AI 生成本地化的图片脚本、短视频脚本、广告文案与商品描述。好作品变模板，被别人复用、创作者变现，越用越强。',
    hero_cta: '免费开始创作', hero_cta2: '逛模板网络',
    stat1_n: '9 种语言', stat1_l: '一键本地化', stat2_n: '4 类素材', stat2_l: '成套产出', stat3_n: '越用越强', stat3_l: '模板网络效应',
    why1_t: '结果导向', why1_d: '不是"好看"，是"卖得动"——每个模板都带真实使用与成交数据。',
    why2_t: '全球本地化', why2_d: '中/英/日/韩/西/葡/阿/印/法，一次生成多市场投放。',
    why3_t: '网络越用越强', why3_d: '好作品变模板被复用，创作者靠作品赚钱，平台越用越好用。',
    studio_title: '创作台', studio_sub: '填一次产品信息，成套生成多语言营销素材。',
    f_product: '产品名称', f_product_ph: '例如：便携榨汁杯',
    f_category: '品类', cat_home: '家居', cat_beauty: '美妆', cat_apparel: '服饰', cat_other: '其他',
    f_audience: '目标人群 / 市场', f_audience_ph: '例如：欧美健身年轻女性',
    f_selling: '卖点（每行一个）', f_selling_ph: '便携\n30 秒出汁\n可水洗\nUSB 充电',
    f_langs: '目标语言', f_kinds: '要生成的素材',
    kind_ad_copy: '广告文案', kind_video_script: '短视频脚本', kind_image_brief: '主图/图片指令', kind_listing: '商品描述',
    cost_note: '本次将消耗 {n} 点额度（每条素材 1 点）', generate_btn: '生成成套素材', generating: '生成中…',
    need_product: '请填写产品名称', need_kind_lang: '至少选一种语言和一类素材', done: '已生成 ✅', no_credit: '额度不足，请升级',
    layout: '版式', all: '全部',
    templates_sub: '别人做出的爆款配方，一键套用到你的产品上。使用与成交越多，排名越靠前。',
    use_template: '用它生成', prompt_product: '输入你的产品名称：',
    creator_earnings: '累计收益', creator_templates: '我的模板', creator_wins: '带来成交',
    creator_hint: '把你的爆款作品发布为模板，别人每次使用/成交你都能分成——你的观众和收入留在这里。',
    metrics_title: '增长数据（北极星）', metrics_sub: '北极星 = 每周由本平台生成并公开传播的内容数。',
    m_northstar: '已发布素材', m_gen: '生成次数', m_users: '用户', m_templates: '模板', m_wins: '上报成交',
    pricing_title: '定价', plan_starter: 'Starter', plan_pro: 'Pro', plan_team: 'Team',
    credits_mo: '点/月', choose: '选择', langs: '语言',
    feat_watermark: '去水印', feat_alltpl: '全部模板', feat_batch: '批量生成', feat_adhook: '广告投放接口', feat_seats: '多席位协作', feat_api: 'API 接入', feat_brand: '品牌资产库',
    upgraded: '已升级 ✅',
    register: '注册', password: '密码', role_merchant: '我是商家', role_creator: '我是创作者',
    need_email_pw: '请填邮箱和密码', welcome: '欢迎！', need_login: '请先登录', auth_email_taken: '邮箱已注册', auth_bad_credentials: '邮箱或密码错误',
  },
  en: {
    nav_studio: 'Studio', nav_templates: 'Templates', nav_creator: 'Creator', nav_metrics: 'Metrics',
    login: 'Log in', logout: 'Log out',
    hero_eyebrow: 'AI-native marketing content network',
    hero_title: 'Turn a product into a full set of<br><span style="background:linear-gradient(135deg,#5b8cff,#8a6bff);-webkit-background-clip:text;background-clip:text;color:transparent">content that sells</span> — in 3 minutes',
    hero_sub: 'Upload a product → AI generates localized image briefs, short-video scripts, ad copy and listings. Great outputs become templates others remix and creators earn from — it compounds.',
    hero_cta: 'Start free', hero_cta2: 'Browse templates',
    stat1_n: '9 languages', stat1_l: 'one-click localize', stat2_n: '4 asset types', stat2_l: 'full set', stat3_n: 'compounds', stat3_l: 'template network',
    why1_t: 'Outcome-first', why1_d: 'Not "pretty" — "converts". Every template carries real usage & win data.',
    why2_t: 'Global localization', why2_d: 'ZH/EN/JA/KO/ES/PT/AR/HI/FR — one generation, many markets.',
    why3_t: 'Network effect', why3_d: 'Best outputs become remixable templates; creators earn; the product gets better the more it is used.',
    studio_title: 'Studio', studio_sub: 'Fill product info once, generate a full multilingual asset set.',
    f_product: 'Product name', f_product_ph: 'e.g. Portable juice blender',
    f_category: 'Category', cat_home: 'Home', cat_beauty: 'Beauty', cat_apparel: 'Apparel', cat_other: 'Other',
    f_audience: 'Audience / market', f_audience_ph: 'e.g. US fitness young women',
    f_selling: 'Selling points (one per line)', f_selling_ph: 'Portable\n30s to juice\nWashable\nUSB charging',
    f_langs: 'Target languages', f_kinds: 'Assets to generate',
    kind_ad_copy: 'Ad copy', kind_video_script: 'Video script', kind_image_brief: 'Image brief', kind_listing: 'Listing',
    cost_note: 'This will spend {n} credits (1 per asset)', generate_btn: 'Generate full set', generating: 'Generating…',
    need_product: 'Enter a product name', need_kind_lang: 'Pick at least one language and asset', done: 'Generated ✅', no_credit: 'Out of credits — upgrade',
    layout: 'Layout', all: 'All',
    templates_sub: "Winning recipes made by others — apply to your product in one click. More usage & wins rank higher.",
    use_template: 'Use it', prompt_product: 'Enter your product name:',
    creator_earnings: 'Total earnings', creator_templates: 'My templates', creator_wins: 'Wins driven',
    creator_hint: 'Publish your winners as templates. Earn every time others use/convert — your audience and income stay here.',
    metrics_title: 'Growth metrics (North-Star)', metrics_sub: 'North-Star = weekly content generated here and publicly published.',
    m_northstar: 'Published assets', m_gen: 'Generations', m_users: 'Users', m_templates: 'Templates', m_wins: 'Reported wins',
    pricing_title: 'Pricing', plan_starter: 'Starter', plan_pro: 'Pro', plan_team: 'Team',
    credits_mo: 'credits/mo', choose: 'Choose', langs: 'languages',
    feat_watermark: 'No watermark', feat_alltpl: 'All templates', feat_batch: 'Batch generate', feat_adhook: 'Ad placement hooks', feat_seats: 'Multi-seat', feat_api: 'API access', feat_brand: 'Brand assets',
    upgraded: 'Upgraded ✅',
    register: 'Sign up', password: 'Password', role_merchant: "I'm a merchant", role_creator: "I'm a creator",
    need_email_pw: 'Enter email and password', welcome: 'Welcome!', need_login: 'Please log in first', auth_email_taken: 'Email already registered', auth_bad_credentials: 'Wrong email or password',
  },
};

export function t(key) {
  const d = DICT[LANG] || DICT.en;
  return d[key] ?? DICT.en[key] ?? key;
}
