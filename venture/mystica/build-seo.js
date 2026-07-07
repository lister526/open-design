/* Mystica SEO 矩阵生成器
 * 生成 12 星座 × 12 生肖 = 144 个长尾落地页 + sitemap.xml
 * 每页针对 "Leo Dragon personality / love / wealth" 这类高搜索长尾词,
 * 是零成本获取 Google 自然流量的核心护城河。运行: node build-seo.js
 */
const fs = require("fs");
const path = require("path");
const E = require("./engine.js");

const OUT = path.join(__dirname, "s"); // /s/leo-dragon.html
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const SIGNS = E.WESTERN_SIGNS.map(s => s.name);
const ANIMALS = E.ZODIAC_ANIMALS;
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// 每个西方星座的关键词
const SIGN_TRAIT = {
  Aries:"bold, pioneering, impatient", Taurus:"grounded, sensual, stubborn",
  Gemini:"quick, curious, restless", Cancer:"nurturing, intuitive, guarded",
  Leo:"radiant, generous, proud", Virgo:"precise, devoted, self-critical",
  Libra:"charming, fair, indecisive", Scorpio:"intense, magnetic, secretive",
  Sagittarius:"free, honest, reckless", Capricorn:"ambitious, disciplined, cold",
  Aquarius:"visionary, detached, rebellious", Pisces:"dreamy, empathic, escapist"
};
const ANIMAL_TRAIT = {
  Rat:"resourceful and sharp", Ox:"steadfast and reliable", Tiger:"brave and commanding",
  Rabbit:"gentle and diplomatic", Dragon:"charismatic and unstoppable", Snake:"wise and enigmatic",
  Horse:"energetic and free-spirited", Goat:"artistic and tender", Monkey:"clever and inventive",
  Rooster:"confident and meticulous", Dog:"loyal and just", Pig:"generous and sincere"
};

function pageHTML(sign, animal){
  const title = `${sign} ${animal}: Personality, Love & Wealth — Western Astrology × Chinese Zodiac`;
  const desc = `What does it mean to be a ${sign} born in the Year of the ${animal}? Discover how your Western sun sign and Chinese zodiac fuse to shape your personality, love life and destiny.`;
  const canonical = `/s/${slug(sign)}-${slug(animal)}.html`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://mystica.app${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${title}","description":"${desc}"}</script>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>body{font-family:Inter,sans-serif;background:radial-gradient(ellipse at top,#241452,#0b0a1f 55%,#05040f);color:#efe9ff}.serif{font-family:'Cormorant Garamond',serif}.gold{color:#d4af6a}.glass{background:rgba(255,255,255,.04);border:1px solid rgba(212,175,106,.25)}</style>
</head><body class="min-h-screen">
<nav class="max-w-3xl mx-auto flex justify-between items-center px-6 py-6"><a href="/" class="serif text-2xl gold">✦ Mystica</a><a href="/#reading" class="text-sm border border-[#d4af6a] gold px-5 py-2 rounded-full">Get My Free Reading</a></nav>
<article class="max-w-3xl mx-auto px-6 py-10">
<p class="gold tracking-widest text-xs uppercase mb-3">Western Astrology × Chinese Zodiac</p>
<h1 class="serif text-4xl md:text-5xl mb-6">The ${sign} ${animal}</h1>
<p class="text-lg text-purple-200/80 mb-8 font-light">A <strong>${sign}</strong> (${SIGN_TRAIT[sign]}) born in the Year of the <strong>${animal}</strong> (${ANIMAL_TRAIT[animal]}) is one of the rarest and most compelling combinations in the zodiac. Your Western sun and Chinese year sign pull you in two directions — and understanding that tension is the key to your life.</p>

<div class="glass rounded-2xl p-6 mb-6"><h2 class="serif text-2xl gold mb-3">Personality</h2>
<p class="text-purple-100/80 leading-relaxed">As a ${sign} ${animal}, your ${SIGN_TRAIT[sign].split(",")[0]} nature meets the ${ANIMAL_TRAIT[animal].split(" ")[0]} spirit of the ${animal}. In practice this makes you someone who is drawn to leadership yet quietly self-doubting, ambitious yet loyal. The ${sign} in you wants the spotlight; the ${animal} in you wants to earn it honestly.</p></div>

<div class="glass rounded-2xl p-6 mb-6"><h2 class="serif text-2xl gold mb-3">Love & Compatibility</h2>
<p class="text-purple-100/80 leading-relaxed">In love, the ${sign} ${animal} needs a partner who respects both your fire and your caution. You are most compatible with signs that ground your restlessness and celebrate your loyalty. Your true blueprint — including the exact elements you clash with — is revealed in your full BaZi Day Master reading.</p></div>

<div class="glass rounded-2xl p-6 mb-6"><h2 class="serif text-2xl gold mb-3">Wealth & Career</h2>
<p class="text-purple-100/80 leading-relaxed">Money follows the ${sign} ${animal} when you align work with your favorable element. Your Chinese chart hides the timing of your wealth years — something Western astrology alone can never tell you. This is where East and West must be read together.</p></div>

<div class="glass rounded-2xl p-8 text-center mt-10"><h2 class="serif text-3xl mb-3">This is only the surface.</h2>
<p class="text-purple-200/70 mb-6 max-w-md mx-auto">Your sun sign and Chinese year are just 2 of your 4 Pillars of Destiny. Enter your exact birth date to unlock your true Day Master, five-element balance, and personalized forecast — free.</p>
<a href="/#reading" class="inline-block bg-[#d4af6a] text-black font-semibold px-10 py-4 rounded-full">Reveal My Full Blueprint — Free ✦</a></div>

<nav class="mt-12 text-sm text-purple-300/50"><p class="mb-2 gold">Explore other combinations:</p><div class="flex flex-wrap gap-x-4 gap-y-1">${
  ANIMALS.map(a=>`<a class="hover:text-[#d4af6a]" href="/s/${slug(sign)}-${slug(a)}.html">${sign} ${a}</a>`).join("")
}</div></nav>
</article>
<footer class="border-t border-purple-400/10 py-8 text-center text-purple-300/40 text-xs mt-10"><p>For entertainment & self-reflection. © Mystica</p></footer>
</body></html>`;
}

let count = 0;
const urls = [];
for (const sign of SIGNS){
  for (const animal of ANIMALS){
    const fname = `${slug(sign)}-${slug(animal)}.html`;
    fs.writeFileSync(path.join(OUT, fname), pageHTML(sign, animal));
    urls.push(`https://mystica.app/s/${fname}`);
    count++;
  }
}

// sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
<url><loc>https://mystica.app/</loc><priority>1.0</priority></url>
${urls.map(u=>`<url><loc>${u}</loc><priority>0.7</priority></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(__dirname, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://mystica.app/sitemap.xml\n");

console.log(`✓ Generated ${count} SEO landing pages in /s/`);
console.log(`✓ sitemap.xml (${urls.length+1} urls) + robots.txt`);
