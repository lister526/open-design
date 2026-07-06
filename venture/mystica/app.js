/* Mystica front-end interactions */
(function(){
  // ---- decorative starfield ----
  const sf = document.getElementById('stars');
  if(sf){
    for(let i=0;i<80;i++){
      const s=document.createElement('div');
      s.className='star';
      const sz=Math.random()*2+1;
      s.style.width=sz+'px'; s.style.height=sz+'px';
      s.style.left=Math.random()*100+'%'; s.style.top=Math.random()*100+'%';
      s.style.animationDelay=(Math.random()*3)+'s';
      sf.appendChild(s);
    }
  }

  // ---- fade-in on scroll ----
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting)e.target.classList.add('show'); }),{threshold:.15});
  document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));

  document.getElementById('yr').textContent=new Date().getFullYear();

  // ---- form submit ----
  const form=document.getElementById('birthForm');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    const fd=new FormData(form);
    const input={
      name:(fd.get('name')||'').trim(),
      year:parseInt(fd.get('year')),
      month:parseInt(fd.get('month')),
      day:parseInt(fd.get('day')),
      hour:parseInt(fd.get('hour')||'12'),
    };
    if(!input.year||!input.month||!input.day){ return; }

    const chart=window.MysticaEngine.buildChart(input);
    const free=window.MysticaEngine.freeReport(chart);
    renderResult(chart,free);

    // analytics hook (占位, 生产接入 GA4 / TikTok Pixel / Meta Pixel)
    if(window.trackEvent) window.trackEvent('chart_generated',{sign:chart.western.name});
  });

  function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

  function renderResult(chart,free){
    const c=document.getElementById('resultContent');
    const els=chart.elements;
    const bars=Object.entries(els.count).map(([k,v])=>{
      const pct=Math.round(v/8*100);
      const colors={Wood:'#7ec8a0',Fire:'#e8836b',Earth:'#d4af6a',Metal:'#c9d1d9',Water:'#6b9fe8'};
      return `<div class="flex items-center gap-3 mb-2">
        <span class="w-14 text-xs text-purple-200/70">${k}</span>
        <div class="flex-1 bg-black/30 rounded-full h-2"><div class="h-2 rounded-full" style="width:${pct}%;background:${colors[k]}"></div></div>
        <span class="text-xs w-8 text-right gold">${v}</span></div>`;
    }).join('');

    const pillars=chart.pillars;
    const pillarCard=(label,p)=>`<div class="text-center px-2">
      <div class="text-[10px] uppercase tracking-wider text-purple-300/50">${label}</div>
      <div class="serif text-2xl gold mt-1">${p.cn}</div>
      <div class="text-[10px] text-purple-200/50">${p.en}</div></div>`;

    c.innerHTML=`
      <div class="text-center mb-8">
        <p class="gold tracking-widest text-xs uppercase mb-3">Your Soul Blueprint</p>
        <h2 class="serif text-4xl md:text-5xl mb-2">${free.headline}</h2>
        <p class="text-purple-200/70 text-sm">${free.subtitle}</p>
      </div>

      <p class="text-center text-lg text-purple-100/90 font-light italic serif mb-8">"${free.body}"</p>

      <div class="glass rounded-2xl p-5 mb-6">
        <div class="text-xs uppercase tracking-wider text-purple-300/60 mb-3 text-center">Your Four Pillars of Destiny · 四柱</div>
        <div class="flex justify-around">
          ${pillarCard('Year',pillars.year)}
          ${pillarCard('Month',pillars.month)}
          ${pillarCard('Day ★',pillars.day)}
          ${pillarCard('Hour',pillars.hour)}
        </div>
      </div>

      <div class="glass rounded-2xl p-5 mb-6">
        <div class="text-xs uppercase tracking-wider text-purple-300/60 mb-3">Your Five-Element Balance</div>
        ${bars}
      </div>

      <div class="bg-gradient-to-r from-[var(--gold)]/10 to-transparent border-l-2 border-[var(--gold)] rounded-r-xl p-5 mb-2">
        <p class="text-purple-100/90 text-sm leading-relaxed">${free.teaser}</p>
      </div>

      <div class="mt-6 space-y-3">
        ${free.lockedSections.map(s=>`
          <div class="glass rounded-xl p-4 flex items-center gap-3">
            <span class="text-lg">🔒</span>
            <span class="text-sm text-purple-100/80 flex-1">${s.split(' — ')[0]}</span>
            <span class="text-xs text-purple-300/40 locked">${(s.split(' — ')[1]||'')}</span>
          </div>`).join('')}
      </div>
    `;

    const res=document.getElementById('result');
    res.classList.remove('hidden');
    res.scrollIntoView({behavior:'smooth',block:'start'});
  }

  // ---- checkout (占位: 生产替换为你的 Stripe / Lemon Squeezy / Paddle 链接) ----
  window.checkout=function(plan){
    const LINKS={
      // TODO: 替换为真实支付链接. 出海推荐 Lemon Squeezy(自动代扣税/全球收款)或 Stripe.
      one:'https://YOUR-STORE.lemonsqueezy.com/buy/DEEP-READING-19',
      sub:'https://YOUR-STORE.lemonsqueezy.com/buy/MEMBERSHIP-9MO'
    };
    if(window.trackEvent) window.trackEvent('checkout_click',{plan});
    const url=LINKS[plan];
    if(url.includes('YOUR-STORE')){
      alert('🔮 Demo mode\n\nThis is where the customer is sent to secure checkout (Stripe / Lemon Squeezy).\n\nPlan: '+(plan==='one'?'Deep Reading — $19':'Cosmic Membership — $9/mo')+'\n\nReplace the placeholder link in app.js with your real payment URL to start collecting money.');
    } else {
      window.location.href=url;
    }
  };
})();
