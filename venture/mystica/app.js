/* Mystica front-end v2 — i18n + deep report + share image + shop matrix */
(function(){
"use strict";
const E = window.MysticaEngine, I = window.MysticaI18N;
let lang = I.detect();
let currentChart = null;

/* ---------- starfield ---------- */
const sf=document.getElementById('stars');
for(let i=0;i<80;i++){const s=document.createElement('div');s.className='star';const z=Math.random()*2+1;
  s.style.width=z+'px';s.style.height=z+'px';s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';
  s.style.animationDelay=(Math.random()*3)+'s';sf.appendChild(s);}

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();

/* ---------- language switcher ---------- */
const langSel=document.getElementById('langSel');
I.LANG_ORDER.forEach(code=>{const o=document.createElement('option');o.value=code;o.textContent=I.I18N[code].label;langSel.appendChild(o);});
langSel.value=lang;
langSel.addEventListener('change',()=>{lang=langSel.value;localStorage.setItem('myst_lang',lang);applyI18n();
  if(currentChart) renderResult(currentChart);});
const saved=localStorage.getItem('myst_lang'); if(saved&&I.I18N[saved]){lang=saved;langSel.value=lang;}

function applyI18n(){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=I.t(lang,el.getAttribute('data-i18n'));});
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=I.t(lang,el.getAttribute('data-i18n-html'));});
  buildHourOptions(); buildGenderOptions(); renderShop();
}
function buildHourOptions(){
  const sel=document.getElementById('hourSel'); const cur=sel.value; sel.innerHTML='';
  const o0=document.createElement('option');o0.value='12';o0.textContent=I.t(lang,'f_hour_unsure');sel.appendChild(o0);
  for(let h=0;h<24;h++){const o=document.createElement('option');o.value=h;o.textContent=String(h).padStart(2,'0')+':00';sel.appendChild(o);}
  if(cur) sel.value=cur;
}
function buildGenderOptions(){
  const sel=document.getElementById('genderSel'); const cur=sel.value; sel.innerHTML='';
  [['female','g_female'],['male','g_male']].forEach(([v,k])=>{const o=document.createElement('option');o.value=v;o.textContent=I.t(lang,k);sel.appendChild(o);});
  if(cur) sel.value=cur;
}

/* ---------- form ---------- */
const form=document.getElementById('birthForm');
form.addEventListener('submit',e=>{
  e.preventDefault();
  const fd=new FormData(form);
  const input={name:(fd.get('name')||'').trim(),year:+fd.get('year'),month:+fd.get('month'),day:+fd.get('day'),
    hour:+(fd.get('hour')||12),gender:fd.get('gender')||'female'};
  if(!input.year||!input.month||!input.day)return;
  currentChart=E.buildChart(input);
  renderResult(currentChart);
  track('chart_generated',{sign:currentChart.western.name,lang});
});

/* ---------- render free result ---------- */
function renderResult(chart){
  const free=E.freeReport(chart), els=chart.elements;
  const colors={Wood:'#7ec8a0',Fire:'#e8836b',Earth:'#d4af6a',Metal:'#c9d1d9',Water:'#6b9fe8'};
  const bars=Object.entries(els.count).map(([k,v])=>{const pct=Math.round(v/Object.values(els.count).reduce((a,b)=>a+b,0)*100);
    return `<div class="flex items-center gap-3 mb-2"><span class="w-14 text-xs text-purple-200/70">${k}</span>
      <div class="flex-1 bg-black/30 rounded-full h-2"><div class="h-2 rounded-full" style="width:${pct}%;background:${colors[k]}"></div></div>
      <span class="text-xs w-8 text-right gold">${pct}%</span></div>`;}).join('');
  const P=chart.pillars;
  const card=(labelKey,p,star)=>`<div class="text-center px-1"><div class="text-[10px] uppercase tracking-wider text-purple-300/50">${I.t(lang,labelKey)}</div>
    <div class="serif text-2xl gold mt-1">${p.cn}</div><div class="text-[10px] text-purple-200/50">${p.en}</div></div>`;

  document.getElementById('resultContent').innerHTML=`
    <div class="text-center mb-8">
      <p class="gold tracking-widest text-xs uppercase mb-3">${I.t(lang,'res_kicker')}</p>
      <h2 class="serif text-4xl md:text-5xl mb-2">${free.headline}</h2>
      <p class="text-purple-200/70 text-sm">${free.subtitle}</p>
    </div>
    <p class="text-center text-lg text-purple-100/90 font-light italic serif mb-8">"${free.body}"</p>
    <div class="glass rounded-2xl p-5 mb-6">
      <div class="text-xs uppercase tracking-wider text-purple-300/60 mb-3 text-center">${I.t(lang,'res_pillars')}</div>
      <div class="flex justify-around">${card('res_year',P.year)}${card('res_month',P.month)}${card('res_day',P.day)}${card('res_hour',P.hour)}</div>
    </div>
    <div class="glass rounded-2xl p-5 mb-6"><div class="text-xs uppercase tracking-wider text-purple-300/60 mb-3">${I.t(lang,'res_elements')}</div>${bars}</div>
    <div class="bg-gradient-to-r from-[var(--gold)]/10 to-transparent border-l-2 border-[var(--gold)] rounded-r-xl p-5 mb-2">
      <p class="text-purple-100/90 text-sm leading-relaxed">${free.teaser}</p></div>
    <div class="mt-6 space-y-3">${free.lockedSections.map(s=>`
      <div class="glass rounded-xl p-4 flex items-center gap-3"><span class="text-lg">🔒</span>
        <span class="text-sm text-purple-100/80 flex-1">${s.split(' — ')[0]}</span>
        <span class="text-xs text-purple-300/40 locked">${s.split(' — ')[1]||'••••••'}</span></div>`).join('')}
    </div>`;
  const res=document.getElementById('result'); res.classList.remove('hidden');
  res.scrollIntoView({behavior:'smooth',block:'start'});
  applyI18nToDynamic();
}
function applyI18nToDynamic(){ // re-apply for paywall texts inside #result
  document.querySelectorAll('#result [data-i18n]').forEach(el=>el.textContent=I.t(lang,el.getAttribute('data-i18n')));
  document.querySelectorAll('#result [data-i18n-html]').forEach(el=>el.innerHTML=I.t(lang,el.getAttribute('data-i18n-html')));
}

/* ---------- checkout ---------- */
const LINKS={ one:'https://YOUR-STORE.lemonsqueezy.com/buy/DEEP-READING-19', sub:'https://YOUR-STORE.lemonsqueezy.com/buy/MEMBERSHIP-9MO' };
async function checkout(plan){
  track('checkout_click',{plan,lang});
  const url=LINKS[plan];
  if(url.includes('YOUR-STORE')){
    // DEMO: 直接展示真实深度报告(生产中应在支付成功回调后调用)
    await unlockDeepReport();
  } else { window.location.href=url; }
}
async function unlockDeepReport(){
  if(!currentChart)return;
  const box=document.getElementById('deepReport'); box.classList.remove('hidden');
  box.innerHTML=`<div class="text-center py-8"><div class="inline-block spin text-3xl gold">✦</div><p class="text-purple-200/70 mt-3">${I.t(lang,'generating')}</p></div>`;
  box.scrollIntoView({behavior:'smooth'});
  try{
    const payload=E.reportPayload(currentChart);
    const r=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,lang})});
    const data=await r.json();
    renderDeep(data.report,data.demo);
  }catch(e){ box.innerHTML=`<p class="text-center text-purple-300/60">The oracle is resting. Please try again.</p>`; }
}
function renderDeep(rep,demo){
  const box=document.getElementById('deepReport');
  box.innerHTML=`
    <div class="text-center mb-8"><p class="gold tracking-widest text-xs uppercase mb-2">✦ Deep Reading</p>
      <h3 class="serif text-4xl mb-3">${rep.title||''}</h3>
      <p class="text-purple-100/90 italic serif text-lg max-w-lg mx-auto">${rep.opening||''}</p></div>
    ${(rep.sections||[]).map(s=>`<div class="glass rounded-2xl p-6 mb-4">
      <h4 class="serif text-2xl gold mb-2">${s.emoji||'✦'} ${s.heading||''}</h4>
      <p class="text-sm text-purple-100/80 leading-relaxed">${s.body||''}</p></div>`).join('')}
    <p class="text-center serif text-xl gold mt-6">${rep.closing||''}</p>
    ${demo?'<p class="text-center text-[11px] text-purple-300/30 mt-4">Demo report (connect AI key for the fully individualized version).</p>':''}`;
}

/* ---------- SHOP MATRIX (实物 + 复购产品) ---------- */
const SHOP_ITEMS=lang=>{
  const el=currentChart?currentChart.luckyCrystal:{name:'Amethyst',cn:'紫水晶'};
  const weak=currentChart?currentChart.elements.weakest:'Water';
  return [
    {icon:'💎',t:{en:`Custom ${el.name} Amulet`,zh:`定制${el.cn}护身符`,es:`Amuleto de ${el.name}`,pt:`Amuleto de ${el.name}`,ja:`${el.name} お守り`,ko:`${el.name} 부적`,hi:`कस्टम ${el.name} ताबीज़`},
      d:{en:`Hand-strung to replenish your missing ${weak} element.`,zh:`按你命盘所缺「${weak==='Water'?'水':weak}」手工串制。`,es:`Hecho a mano para tu elemento ${weak}.`,pt:`Feito à mão para seu elemento ${weak}.`,ja:`不足する五行を補う手作り。`,ko:`부족한 오행을 채우는 수제.`,hi:`आपके अभाव तत्व हेतु हस्तनिर्मित।`},p:'$79',tag:'Bestseller'},
    {icon:'💍',t:{en:'Couple Compatibility',zh:'情侣合盘',es:'Compatibilidad de Pareja',pt:'Compatibilidade do Casal',ja:'相性鑑定',ko:'궁합 리딩',hi:'युगल अनुकूलता'},
      d:{en:'Two charts, one destiny map. Where you clash & complete.',zh:'两张命盘,一张命运合图。你们何处相冲、何处互补。',es:'Dos cartas, un mapa.',pt:'Dois mapas, um destino.',ja:'二つの命盤を重ねて。',ko:'두 사주를 겹쳐서.',hi:'दो कुंडलियाँ, एक नक्शा।'},p:'$29',tag:'Popular'},
    {icon:'👶',t:{en:'Baby Name by Five Elements',zh:'五行补缺·宝宝起名',es:'Nombre de Bebé',pt:'Nome do Bebê',ja:'赤ちゃん命名',ko:'아기 작명',hi:'शिशु नामकरण'},
      d:{en:'A name engineered to balance your child\'s chart.',zh:'依宝宝命盘五行,量身取一个补运的好名字。',es:'Un nombre que equilibra su carta.',pt:'Um nome que equilibra o mapa.',ja:'命盤を整える名前を。',ko:'사주를 보완하는 이름.',hi:'बच्चे की कुंडली संतुलित करता नाम।'},p:'$49',tag:''},
    {icon:'📅',t:{en:'Auspicious Date Picker',zh:'黄道吉日·择日',es:'Fecha Auspiciosa',pt:'Data Auspiciosa',ja:'吉日選び',ko:'길일 택일',hi:'शुभ मुहूर्त'},
      d:{en:'Best dates for your wedding, launch, or big move.',zh:'为你的婚礼、开业、搬家挑选最旺的吉日。',es:'Mejores fechas para tu boda o mudanza.',pt:'Melhores datas para casamento ou mudança.',ja:'結婚・開業・引越の吉日を。',ko:'결혼·개업·이사 길일.',hi:'विवाह, शुभारंभ हेतु सर्वोत्तम तिथि।'},p:'$15',tag:''},
    {icon:'📜',t:{en:'Annual Grand Fortune Scroll',zh:'年度大运·卷轴报告',es:'Pergamino Anual',pt:'Pergaminho Anual',ja:'年間大運の巻物',ko:'연간 대운 두루마리',hi:'वार्षिक भाग्य पत्र'},
      d:{en:'Your 12-month luck map, printed on premium scroll.',zh:'你的十二月运势地图,印在高级卷轴上,可裱可赠。',es:'Tu mapa de suerte de 12 meses impreso.',pt:'Seu mapa de sorte de 12 meses impresso.',ja:'12ヶ月の運勢を巻物に。',ko:'12개월 운세 두루마리.',hi:'12-माह भाग्य मानचित्र, प्रिंट।'},p:'$59',tag:'New'},
    {icon:'🔔',t:{en:'Cosmic Membership',zh:'星运会员',es:'Membresía Cósmica',pt:'Assinatura Cósmica',ja:'コズミック会員',ko:'코스믹 멤버십',hi:'कॉस्मिक सदस्यता'},
      d:{en:'Daily East-West guidance + unlimited readings.',zh:'每日东西合璧指引 + 无限次解读与合盘。',es:'Guía diaria + lecturas ilimitadas.',pt:'Orientação diária + leituras ilimitadas.',ja:'毎日の指針 + 無制限鑑定。',ko:'매일 가이드 + 무제한 리딩.',hi:'दैनिक मार्गदर्शन + असीमित पठन।'},p:'$9/mo',tag:'Subscribe'},
  ];
};
function renderShop(){
  const grid=document.getElementById('shopGrid'); if(!grid)return;
  grid.innerHTML=SHOP_ITEMS(lang).map((it,i)=>`
    <div class="glass rounded-2xl p-6 flex flex-col hover:border-[var(--gold)]/60 transition">
      <div class="flex items-start justify-between"><div class="text-3xl mb-3">${it.icon}</div>
        ${it.tag?`<span class="text-[10px] uppercase tracking-wider bg-gold text-black px-2 py-1 rounded-full">${it.tag}</span>`:''}</div>
      <h3 class="serif text-xl gold mb-2">${it.t[lang]||it.t.en}</h3>
      <p class="text-sm text-purple-200/70 flex-1 mb-4">${it.d[lang]||it.d.en}</p>
      <div class="flex items-center justify-between">
        <span class="serif text-2xl">${it.p}</span>
        <button onclick="Mystica.buy(${i})" class="text-sm border border-[var(--gold)] gold px-4 py-2 rounded-full hover:bg-gold hover:text-black transition">${I.t(lang,'nav_cta')}</button>
      </div></div>`).join('');
}

/* ---------- SHARE IMAGE (viral engine) ---------- */
async function shareResult(){
  if(!currentChart)return;
  track('share_click',{lang});
  const url=await drawShareCard(currentChart);
  // try native share with file
  try{
    const blob=await (await fetch(url)).blob();
    const file=new File([blob],'mystica.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:'Mystica',text:'My East-West soul blueprint ✦ mystica.app'});
      return;
    }
  }catch(_){}
  // fallback: download
  const a=document.createElement('a');a.href=url;a.download='mystica-blueprint.png';a.click();
}
function drawShareCard(chart){
  return new Promise(resolve=>{
    const c=document.getElementById('shareCanvas'),x=c.getContext('2d');
    const W=c.width,H=c.height;
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#241452');g.addColorStop(.55,'#0b0a1f');g.addColorStop(1,'#05040f');
    x.fillStyle=g;x.fillRect(0,0,W,H);
    // stars
    x.fillStyle='#fff';for(let i=0;i<120;i++){x.globalAlpha=Math.random()*.8+.1;const s=Math.random()*2.5;x.beginPath();x.arc(Math.random()*W,Math.random()*H,s,0,7);x.fill();}
    x.globalAlpha=1;
    const free=E.freeReport(chart);
    x.textAlign='center';
    x.fillStyle='#d4af6a';x.font='500 34px Cormorant Garamond, serif';x.fillText('✦ MYSTICA',W/2,120);
    x.font='italic 300 30px Inter, sans-serif';x.fillStyle='rgba(239,233,255,.6)';x.fillText(I.t(lang,'res_kicker'),W/2,175);
    // title
    x.fillStyle='#f5e6b8';x.font='600 76px Cormorant Garamond, serif';
    wrap(x,chart.archetype.title,W/2,360,W-160,84);
    x.fillStyle='rgba(239,233,255,.85)';x.font='300 34px Inter, sans-serif';
    x.fillText(`${chart.western.glyph} ${chart.western.name}  ·  ${chart.zodiacCn} ${chart.zodiac}`,W/2,470);
    // pillars
    const P=chart.pillars,pl=[P.year,P.month,P.day,P.hour];const bx=W/2-330;
    x.font='500 60px Cormorant Garamond, serif';
    pl.forEach((p,i)=>{x.fillStyle='rgba(255,255,255,.06)';const cx=bx+i*220;
      roundRect(x,cx,560,190,220,20);x.fill();
      x.fillStyle='#d4af6a';x.fillText(p.cn,cx+95,690);});
    // quote
    x.fillStyle='rgba(239,233,255,.9)';x.font='italic 300 36px Cormorant Garamond, serif';
    wrap(x,'"'+chart.archetype.short+'"',W/2,900,W-200,52);
    // cta
    x.fillStyle='#d4af6a';x.font='500 30px Inter, sans-serif';x.fillText('Discover yours free  ·  mystica.app',W/2,H-90);
    resolve(c.toDataURL('image/png'));
  });
}
function wrap(x,text,cx,cy,maxW,lh){const words=(''+text).split(' ');let line='',y=cy;
  for(const w of words){const t=line+w+' ';if(x.measureText(t).width>maxW&&line){x.fillText(line.trim(),cx,y);line=w+' ';y+=lh;}else line=t;}
  x.fillText(line.trim(),cx,y);}
function roundRect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}

document.getElementById('shareBtn').addEventListener('click',shareResult);

/* ---------- analytics stub ---------- */
function track(ev,props){ if(window.gtag)window.gtag('event',ev,props); if(window.ttq)window.ttq.track(ev,props);
  console.log('[track]',ev,props||{}); }

/* ---------- expose ---------- */
window.Mystica={checkout,buy:(i)=>{track('shop_buy',{item:i,lang});checkout('one');},shareResult};

applyI18n();
})();
