/* ============================================================================
 * static-api.js  —  Mystica client-side API shim
 * ----------------------------------------------------------------------------
 * Lets the ENTIRE app run as a 100% static site (no Node backend needed),
 * so it can be hosted on any static host (Cloudflare Pages, etc.) at a
 * PERMANENT URL. It intercepts window.fetch('/api/*') and computes every
 * response in-browser using the already-loaded engine.js + pricing.js.
 *
 * This mirrors the server's demo/fallback behaviour exactly (same JSON shape),
 * so app.js needs zero changes. When a real Node backend IS present (self-host
 * on Railway/Render for live LLM + real payments), simply DO NOT include this
 * file and the app talks to the real server instead.
 *
 * Persistence: orders / users / referrals live in localStorage (per-browser).
 * Payments: demo checkout auto-marks paid and routes to success.html?token=…
 * ==========================================================================*/
(function(){
  if(typeof window==="undefined") return;
  var E = window.MysticaEngine;
  var P = window.MysticaPricing;
  var realFetch = window.fetch ? window.fetch.bind(window) : null;

  /* ---------- tiny localStorage-backed store ---------- */
  var LS = {
    get:function(k,d){ try{ var v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(_){ return d; } },
    set:function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(_){ } }
  };
  function db(){ return LS.get('myst_db',{orders:{},users:{},referrals:{}}); }
  function save(d){ LS.set('myst_db',d); }
  function uid(){ return 'ord_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36); }
  function refCode(email){
    var base=(email||'').split('@')[0].replace(/[^a-z0-9]/gi,'').slice(0,6).toUpperCase()||'MYST';
    return base+Math.random().toString(36).slice(2,5).toUpperCase();
  }

  /* ---------- report fallbacks (mirror server.js) ---------- */
  function fallbackReport(p){
    var dm = p.day_master || "your Day Master";
    return {
      title: "The " + (p.day_master || "Hidden") + " Path",
      opening: p.name+", your Sun in "+p.western_sun+" gives you a face the world sees, but your "+dm+" Day Master is your true engine. Where they meet, your real story begins.",
      sections: [
        {key:"personality",emoji:"🧭",heading:"Who You Really Are",body:"As a "+dm+", your core runs deeper than your "+p.western_sun+" surface suggests. Your chart leans heavily on "+p.strongest+" energy while "+p.weakest+" stays scarce — a signature that makes you unmistakable, and occasionally misunderstood."},
        {key:"love",emoji:"💗",heading:"Love & Compatibility",body:"Your "+p.weakest+" deficit is exactly what you seek in a partner — you are drawn to those who carry the element you lack. Balance, not sameness, completes you."},
        {key:"wealth",emoji:"💰",heading:"Wealth Blueprint",body:"Your favorable elements are "+((p.favorable_elements||[]).join(" & "))+". Careers and timing that amplify these are where money flows to you most easily."},
        {key:"shadow",emoji:"⚡",heading:"Your Hidden Shadow",body:"An excess of "+p.strongest+" can tip into your defining flaw. Naming it is the first step to disarming it."},
        {key:"year",emoji:"🌙",heading:"The Year of the "+((p.current_year&&p.current_year.zodiac)||"Now"),body:"This year's "+((p.current_year&&p.current_year.element)||"")+" energy meets your chart in a way that opens a specific window. Move deliberately."},
        {key:"remedy",emoji:"💎",heading:"Your Remedy",body:"To replenish your scarce "+p.weakest+", carry "+((p.recommended_crystal&&p.recommended_crystal.name)||"a balancing stone")+" ("+((p.recommended_crystal&&p.recommended_crystal.cn)||"")+") — for "+((p.recommended_crystal&&p.recommended_crystal.benefit)||"balance")+"."},
      ],
      closing: "The chart is not your cage. It is your map. Walk it with open eyes.",
    };
  }
  function fallbackCompat(a,b,score){
    return { title:"Two Charts, One Orbit",
      score_line:"Your fused compatibility reads "+score+"/100 — "+(score>=80?"a rare resonance":score>=62?"a strong, workable bond":score>=45?"a relationship that rewards effort":"a karmic lesson worth learning")+".",
      sections:[
        {emoji:"💞",heading:"Your Spark",body:a.name+"'s "+a.day_master+" meets "+b.name+"'s "+b.day_master+". Where your elements feed each other, attraction feels effortless."},
        {emoji:"⚔️",heading:"Where You Clash",body:"Every strong pairing has friction. Yours is a teacher, not a threat — it shows each of you the edge you came here to grow."},
        {emoji:"🌱",heading:"How You Grow Together",body:"Lean on the element one of you lacks and the other carries. That exchange is the quiet engine of your bond."},
        {emoji:"🗝️",heading:"The Secret to Lasting",body:"Name the clash out loud, early. What you both understand, you can both soften."},
      ], closing:"You are not the same — and that is precisely the point." };
  }
  function fallbackNaming(adv){
    var h=adv.hint||{};
    return { title:"A Name to Balance the Stars",
      intro:"This child's chart leans away from "+adv.primaryElement+". A name that carries "+adv.primaryElement+" energy ("+(h.meaning||"balance")+") gently restores harmony.",
      names:(h.en||["Aria","Kai","Luna"]).slice(0,6).map(function(n){return{name:n,meaning:h.meaning||"balance",why:"Carries "+adv.primaryElement+" energy to complete the chart."};}),
      closing:"A good name is a quiet blessing the child carries for life." };
  }

  /* ---------- route table ---------- */
  function J(obj){ return new Response(JSON.stringify(obj),{status:200,headers:{'Content-Type':'application/json'}}); }
  function err(code,obj){ return new Response(JSON.stringify(obj),{status:code,headers:{'Content-Type':'application/json'}}); }

  var ROUTES = {
    'GET /api/health': function(){ return J({ok:true,hasKey:false,provider:'demo',persisted:true,mode:'static'}); },

    'GET /api/pricing': function(url){
      var lang=url.searchParams.get('lang')||'en';
      var country=url.searchParams.get('country'); country=country?country.toUpperCase():null;
      try{ return J({ok:true,lang:lang,market:P.marketFor(lang,country),prices:P.localizeAll(lang,country)}); }
      catch(e){ return err(500,{error:'pricing_failed',detail:e.message}); }
    },

    'POST /api/report': function(url,body){
      if(!body||!body.payload) return err(400,{error:'missing payload'});
      return J({demo:true,report:fallbackReport(body.payload)});
    },
    'POST /api/daily': function(url,body){
      return J({demo:true,text:"Today favors your strongest element. Move on the decision you have been circling — the door is briefly open."});
    },
    'POST /api/compat': function(url,body){
      if(!body||!body.a||!body.b) return err(400,{error:'missing charts'});
      return J({demo:true,report:fallbackCompat(body.a,body.b,body.score)});
    },
    'POST /api/naming': function(url,body){
      if(!body||!body.advice) return err(400,{error:'missing advice'});
      return J({demo:true,report:fallbackNaming(body.advice)});
    },
    'POST /api/dates': function(url,body){
      if(!body||!body.dates) return err(400,{error:'missing dates'});
      return J({demo:true,report:{title:"Your Auspicious Dates",dates:body.dates,note:"Ranked by harmony with your chart."}});
    },

    'POST /api/checkout': function(url,body){
      var product=body&&body.product, meta=(body&&body.meta)||{};
      if(!product) return err(400,{error:'unknown product'});
      var lang=meta.lang||'en', country=meta.country||null;
      var local; try{ local=P.localize(product,lang,country); }catch(_){ local=null; }
      // demo: create order, auto-mark paid, route to success page
      var d=db(); var token=uid();
      d.orders[token]={token:token,product:product,paid:true,meta:meta,pricing:local,ts:Date.now()};
      // referral conversion credit
      if(meta.ref && d.referrals[meta.ref]){ d.referrals[meta.ref].conversions=(d.referrals[meta.ref].conversions||0)+1;
        var owner=d.referrals[meta.ref].owner; if(owner&&d.users[owner]){ d.users[owner].credits=(d.users[owner].credits||0)+1; } }
      save(d);
      return J({url:'success.html?token='+token, token:token, provider:'demo', pricing:local});
    },
    'GET /api/order': function(url){
      var token=url.pathname.split('/').pop();
      var d=db(); var o=d.orders[token];
      if(!o) return err(404,{error:'not_found'});
      return J({token:o.token,product:o.product,paid:o.paid,meta:o.meta,pricing:o.pricing});
    },

    'POST /api/lead': function(url,body){
      var email=body&&body.email;
      if(!email||!/.+@.+\..+/.test(email)) return err(400,{error:'invalid_email'});
      var d=db(); var u=d.users[email];
      if(!u){ u={email:email,credits:0,referralCode:refCode(email),lang:body.lang,ts:Date.now()};
        d.users[email]=u; d.referrals[u.referralCode]={owner:email,clicks:0,conversions:0}; }
      save(d);
      return J({ok:true,referralCode:u.referralCode});
    },
    'POST /api/referral/click': function(url,body){
      var code=body&&body.code; if(!code) return err(400,{error:'missing_code'});
      var d=db(); if(d.referrals[code]){ d.referrals[code].clicks=(d.referrals[code].clicks||0)+1; save(d); return J({ok:true}); }
      return J({ok:false});
    },
    'GET /api/referral/stats': function(url){
      var code=url.pathname.split('/').pop();
      var d=db(); var r=d.referrals[code];
      if(!r) return err(404,{error:'not_found'});
      return J({ok:true,code:code,clicks:r.clicks||0,conversions:r.conversions||0});
    },
    'GET /api/me': function(url){
      var email=url.searchParams.get('email')||'';
      var d=db(); var u=d.users[email];
      if(!u) return err(404,{error:'not_found'});
      return J({ok:true,email:u.email,credits:u.credits||0,referralCode:u.referralCode,lang:u.lang});
    },
  };

  function match(method,pathname){
    var exact=method+' '+pathname;
    if(ROUTES[exact]) return ROUTES[exact];
    // prefix routes with trailing id/param
    if(/^\/api\/order\//.test(pathname) && method==='GET') return ROUTES['GET /api/order'];
    if(/^\/api\/referral\/stats\//.test(pathname) && method==='GET') return ROUTES['GET /api/referral/stats'];
    return null;
  }

  window.fetch = function(input,init){
    try{
      var urlStr = (typeof input==='string') ? input : (input && input.url);
      if(urlStr && urlStr.indexOf('/api/')!==-1){
        var u = new URL(urlStr, window.location.origin);
        var method = ((init&&init.method) || (input&&input.method) || 'GET').toUpperCase();
        var handler = match(method,u.pathname);
        if(handler){
          var body=null;
          try{ if(init&&init.body) body=JSON.parse(init.body); }catch(_){ }
          return Promise.resolve(handler(u,body));
        }
      }
    }catch(e){ /* fall through to real fetch */ }
    return realFetch ? realFetch(input,init) : Promise.reject(new Error('fetch unavailable'));
  };

  window.__MYSTICA_STATIC__ = true;
})();
