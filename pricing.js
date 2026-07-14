/* Mystica 全球本地化定价引擎 (PPP-aware pricing)
 * ------------------------------------------------------------------
 * 护城河核心之一: 同一产品, 按市场自动切换 (货币 / PPP调价 / 本地支付方式).
 * 研究结论:
 *   - 平价 $19 在印度/巴西直接扼杀转化 -> 必须按购买力平价(PPP)本地化.
 *   - 印度必须 UPI; 巴西必须 Pix(占电商40%); 日韩偏好本地卡/Kakao/PayPay.
 *   - BaZi/四柱/사주 在 zh/ja/ko 是母语概念 -> 主打本命, 西占为辅.
 *
 * 用法:
 *   const P = require("./pricing.js");
 *   P.localize("deep", "hi")  // -> {product, market, currency, symbol, amount, display, was, methods, provider_hint}
 *
 * 定价以美元锚(usdAnchor)为基准, 各市场用 pppFactor 缩放, 再套本地货币汇率, 最后按
 * 本地"心理价位"取整(psychological rounding). 真实扣款仍以支付平台配置为准 —— 这里
 * 生成的是"展示价 + 支付方式 + 应走的支付渠道", 供前端与结账层使用.
 */

// ---- 产品美元锚价 (与 payment.js PRODUCTS 对齐) ----
// 依市场验证调整: 数字报告=引流款(价格弹性); 实物新增中低价入门层(贴近已验证 AOV $31.81);
// 高端护身符保留。实物是利润引擎(毛利~70%), 数字是获客工具。
const USD_ANCHOR = {
  mini:     { usd: 9,  wasUsd: 19 },  // 迷你深读: 对标 Co-Star $8.99, 入门引流
  deep:     { usd: 19, wasUsd: 39 },  // 完整深读: 更长+东西合璧, 价值撑价
  compat:   { usd: 29, wasUsd: 59 },  // 合盘: AstroTalk 65% 收入来自关系
  naming:   { usd: 49, wasUsd: 99 },
  dates:    { usd: 15, wasUsd: 29 },  // 择日: 韩国核心
  scroll:   { usd: 59, wasUsd: 99 },
  bracelet: { usd: 35, wasUsd: 59 },  // 实物入门(手链/卡片): 贴近验证 AOV $31.81, 70%毛利
  amulet:   { usd: 79, wasUsd: 129 }, // 高端定制护身符
  member:   { usd: 9,  wasUsd: 19, recurring: true },
};

// ---- 语言 -> 主市场映射 (默认市场; 可被显式 country 覆盖) ----
const LANG_MARKET = {
  en: "US", zh: "CN", es: "MX", pt: "BR", ja: "JP", ko: "KR", hi: "IN",
};

/* 市场配置:
 *   currency/symbol : 展示货币
 *   fx              : 1 USD = fx 本地货币 (粗略, 仅用于展示换算; 真实收款按平台)
 *   ppp             : 购买力平价系数 (<1 表示该市场需下调价格以匹配可支配收入)
 *   round           : 心理取整函数 (让价格落在本地习惯的"好看"数字)
 *   methods         : 该市场应展示/支持的支付方式 (顺序=展示优先级)
 *   provider        : 建议走的收单渠道 (razorpay=印度UPI, mercadopago=巴西Pix, 其余 lemonsqueezy MoR)
 *   taxNote         : 税务说明 (MoR 平台自动代扣;区域备注)
 */
const MARKETS = {
  US: { currency:"USD", symbol:"$",  fx:1,     ppp:1.00, round:endNine,
        methods:["card","paypal","applepay","googlepay"], provider:"lemonsqueezy",
        locale:"en-US", taxNote:"Tax handled by Merchant of Record." },
  CN: { currency:"CNY", symbol:"¥",  fx:7.1,   ppp:0.65, round:roundTo9,
        methods:["wechatpay","alipay","card"], provider:"manual_cn",
        locale:"zh-CN", taxNote:"含税价; 微信/支付宝收单." },
  MX: { currency:"USD", symbol:"$",  fx:1,     ppp:1.00, round:endNine,
        methods:["card","paypal","oxxo","mercadopago"], provider:"lemonsqueezy",
        locale:"es-MX", taxNote:"Impuestos gestionados por el comercio (MoR)." },
  BR: { currency:"BRL", symbol:"R$", fx:5.4,   ppp:0.28, round:brlRound,
        methods:["pix","card","boleto","paypal"], provider:"mercadopago",
        locale:"pt-BR", taxNote:"Impostos incl.; Pix é o método preferido no Brasil." },
  JP: { currency:"JPY", symbol:"¥",  fx:150,   ppp:0.84, round:jpyRound,
        methods:["card","paypay","konbini","applepay"], provider:"lemonsqueezy",
        locale:"ja-JP", taxNote:"税込価格 (販売事業者が代理納税)." },
  KR: { currency:"KRW", symbol:"₩",  fx:1330,  ppp:0.99, round:krwRound,
        methods:["card","kakaopay","naverpay","tosspay"], provider:"lemonsqueezy",
        locale:"ko-KR", taxNote:"부가세 포함 (판매 대행사가 대납)." },
  IN: { currency:"INR", symbol:"₹",  fx:83,    ppp:0.32, round:inrRound,
        methods:["upi","card","wallet","netbanking"], provider:"razorpay",
        locale:"hi-IN", taxNote:"कर सहित; भारत में UPI सबसे लोकप्रिय." },
  // 通用兜底 (欧洲/其他英语市场)
  INTL: { currency:"USD", symbol:"$", fx:1,    ppp:0.95, round:endNine,
        methods:["card","paypal"], provider:"lemonsqueezy",
        locale:"en", taxNote:"Tax handled by Merchant of Record." },
};

// ---- 支付方式展示名 (多语言, 前端可直接用) ----
const METHOD_LABEL = {
  card:{en:"Card",zh:"银行卡",es:"Tarjeta",pt:"Cartão",ja:"カード",ko:"카드",hi:"कार्ड"},
  paypal:{en:"PayPal",zh:"PayPal",es:"PayPal",pt:"PayPal",ja:"PayPal",ko:"PayPal",hi:"PayPal"},
  applepay:{en:"Apple Pay",zh:"Apple Pay",es:"Apple Pay",pt:"Apple Pay",ja:"Apple Pay",ko:"Apple Pay",hi:"Apple Pay"},
  googlepay:{en:"Google Pay",zh:"Google Pay",es:"Google Pay",pt:"Google Pay",ja:"Google Pay",ko:"Google Pay",hi:"Google Pay"},
  upi:{en:"UPI",zh:"UPI",es:"UPI",pt:"UPI",ja:"UPI",ko:"UPI",hi:"UPI"},
  pix:{en:"Pix",zh:"Pix",es:"Pix",pt:"Pix",ja:"Pix",ko:"Pix",hi:"Pix"},
  boleto:{en:"Boleto",zh:"Boleto",es:"Boleto",pt:"Boleto",ja:"Boleto",ko:"Boleto",hi:"Boleto"},
  oxxo:{en:"OXXO",zh:"OXXO",es:"OXXO",pt:"OXXO",ja:"OXXO",ko:"OXXO",hi:"OXXO"},
  wechatpay:{en:"WeChat Pay",zh:"微信支付",es:"WeChat Pay",pt:"WeChat Pay",ja:"WeChat Pay",ko:"WeChat Pay",hi:"WeChat Pay"},
  alipay:{en:"Alipay",zh:"支付宝",es:"Alipay",pt:"Alipay",ja:"Alipay",ko:"Alipay",hi:"Alipay"},
  paypay:{en:"PayPay",zh:"PayPay",es:"PayPay",pt:"PayPay",ja:"PayPay",ko:"PayPay",hi:"PayPay"},
  konbini:{en:"Konbini",zh:"便利店支付",es:"Konbini",pt:"Konbini",ja:"コンビニ払い",ko:"Konbini",hi:"Konbini"},
  kakaopay:{en:"KakaoPay",zh:"KakaoPay",es:"KakaoPay",pt:"KakaoPay",ja:"KakaoPay",ko:"카카오페이",hi:"KakaoPay"},
  naverpay:{en:"NaverPay",zh:"NaverPay",es:"NaverPay",pt:"NaverPay",ja:"NaverPay",ko:"네이버페이",hi:"NaverPay"},
  tosspay:{en:"TossPay",zh:"TossPay",es:"TossPay",pt:"TossPay",ja:"TossPay",ko:"토스페이",hi:"TossPay"},
  wallet:{en:"Wallet",zh:"钱包",es:"Billetera",pt:"Carteira",ja:"ウォレット",ko:"지갑",hi:"वॉलेट"},
  netbanking:{en:"NetBanking",zh:"网银",es:"Banca",pt:"NetBanking",ja:"ネットバンキング",ko:"뱅킹",hi:"नेट बैंकिंग"},
  mercadopago:{en:"Mercado Pago",zh:"Mercado Pago",es:"Mercado Pago",pt:"Mercado Pago",ja:"Mercado Pago",ko:"Mercado Pago",hi:"Mercado Pago"},
};

// ---- 心理取整函数 ----
function endNine(x){ // -> .99 结尾 (欧美)
  const n = Math.max(1, Math.round(x));
  return n - 0.01 < 1 ? n : (n - 0.01);
}
function roundTo9(x){ // CNY -> 末位9 (68/98/128)
  const n = Math.round(x);
  if (n < 10) return n;
  return Math.floor(n/10)*10 + 8 >= n ? Math.floor(n/10)*10 + 8 : Math.ceil(n/10)*10 - 1;
}
function brlRound(x){ // R$29, R$59 -> 落到 x9
  const n=Math.round(x);
  if(n<15) return Math.max(9, Math.round(n/5)*5 - 1);
  return Math.max(19, Math.round(n/10)*10 - 1);
}
function jpyRound(x){ return Math.max(100, Math.round(x/200)*200); } // ¥200 单位 -> ¥2400
function krwRound(x){ return Math.max(1000, Math.round(x/1000)*1000); } // ₩1000 单位
function inrRound(x){ const n=Math.round(x); return Math.max(49, Math.round(n/50)*50 - 1); } // ₹499, ₹299

function fmt(amount, m){
  // 展示字符串 (符号在前); JPY/KRW/INR 不带小数
  const noDecimals = ["JPY","KRW","INR","CNY","BRL"].includes(m.currency)
    ? (m.currency==="BRL") ? false : true
    : false;
  let num;
  if (m.currency === "USD") num = amount.toFixed(2).replace(/\.00$/,"").replace(/(\.\d)0$/,"$1");
  else if (noDecimals) num = Math.round(amount).toLocaleString(m.locale);
  else num = amount.toLocaleString(m.locale, {minimumFractionDigits:0, maximumFractionDigits:2});
  return m.symbol + num;
}

function marketFor(lang, country){
  if (country && MARKETS[country]) return country;
  return LANG_MARKET[lang] || "INTL";
}

/* 核心: 计算某产品在某市场的本地化价格 */
function localize(product, lang, country){
  const anchor = USD_ANCHOR[product];
  if (!anchor) return null;
  const marketKey = marketFor(lang, country);
  const m = MARKETS[marketKey] || MARKETS.INTL;

  const localNow = m.round(anchor.usd * m.ppp * m.fx);
  const localWas = m.round(anchor.wasUsd * m.ppp * m.fx);

  const methods = m.methods.map(k => ({ key:k, label:(METHOD_LABEL[k]&&(METHOD_LABEL[k][lang]||METHOD_LABEL[k].en))||k }));

  return {
    product,
    market: marketKey,
    currency: m.currency,
    symbol: m.symbol,
    amount: localNow,
    was: localWas,
    display: fmt(localNow, m),
    displayWas: fmt(localWas, m),
    usd: anchor.usd,             // 结算基准 (真实扣款锚)
    recurring: !!anchor.recurring,
    methods,                     // 展示用支付方式
    primaryMethod: methods[0]?.key || "card",
    provider: m.provider,        // 建议收单渠道
    taxNote: m.taxNote,
    locale: m.locale,
  };
}

/* 全产品一次性本地化 (前端商店页一次拿全) */
function localizeAll(lang, country){
  const out = {};
  for (const p of Object.keys(USD_ANCHOR)) out[p] = localize(p, lang, country);
  return out;
}

const __pricingApi = { USD_ANCHOR, MARKETS, LANG_MARKET, METHOD_LABEL, localize, localizeAll, marketFor };
if(typeof module!=="undefined"&&module.exports){ module.exports = __pricingApi; }
if(typeof window!=="undefined"){ window.MysticaPricing = __pricingApi; }
