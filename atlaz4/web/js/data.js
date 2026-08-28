/* ============================================================================
 * Atlaz v4 · Data Layer  (DB)
 * The AI Trade Execution Network for small global merchants.
 *
 * This is MOCK data engineered to behave like a real commercial trade system:
 *   - 18 ProductOpportunities across 8 real cross-border scenarios
 *   - 90 Suppliers (>=5 per opportunity) with DYNAMIC Supplier Trust Graph scoring
 *   - 12 fully-populated SKU Deal Rooms (opportunity -> reorder loop)
 *   - 60+ Trade Loop Ledger events, 12 Compliance Routes, 12 Cash Conversion
 *     Scores, 12 Growth Experiments, 8 high-risk compliance cases, 8 order flows
 *
 * NOTHING here is lorem ipsum. Every field carries business meaning.
 * Global: DB   (also window.DB in browser)
 * ==========================================================================*/
const DB = (() => {
  /* ---- deterministic pseudo-random so mock stays stable across reloads ---- */
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0);}
  function rnd(seed){let x=hash(seed);return ()=>{x=(Math.imul(x,1103515245)+12345)>>>0;return x/4294967296;};}
  function pick(arr,seed){return arr[Math.floor(rnd(seed)()*arr.length)];}
  function between(min,max,seed){return min+(max-min)*rnd(seed)();}
  function round(n,d=2){const f=Math.pow(10,d);return Math.round(n*f)/f;}

  /* parsePrice: normalize any local-currency price band string to a USD midpoint.
     Fixes the v3 bug where "¥4,500-6,800" produced an absurd USD figure. */
  const FX_TO_USD = { "MX$":0.059, "R$":0.18, "د.إ":0.27, "C$":0.73, "A$":0.66, "¥":0.139, "€":1.08, "£":1.27, "₩":0.00075, "₹":0.012, "$":1 };
  function parsePrice(str){
    if(typeof str==="number") return str;
    if(!str) return 0;
    let sym = "$";
    // check longer / non-$ symbols first so "MX$" wins over "$", "R$" over "$", etc.
    const ordered = Object.keys(FX_TO_USD).sort((a,b)=>b.length-a.length);
    for(const k of ordered){ if(str.indexOf(k)>=0){ sym=k; break; } }
    const nums = (str.replace(/[, ]/g,"").match(/[\d.]+/g)||[]).map(Number).filter(n=>!isNaN(n));
    if(!nums.length) return 0;
    const mid = nums.length>=2 ? (nums[0]+nums[1])/2 : nums[0];
    return round(mid*(FX_TO_USD[sym]||1), 2);
  }

  /* =========================================================================
   * 18 PRODUCT OPPORTUNITIES — 8 real cross-border scenarios
   * Each is an "investment memo": full business logic, not a pretty card.
   * ======================================================================= */
  const opportunities = [
    /* ---- Scenario 1: US TikTok Shop · home cleaning (the must-pass story) ---- */
    {
      opportunityId:"OPP-4001", scenario:"US · TikTok Shop · Home Cleaning",
      category:"Home Cleaning", productConcept:"Electric spin scrubber (cordless, 4 brush heads)",
      targetRegion:"US", targetPersona:"US millennial renters & busy parents, value satisfying-clean videos",
      platform:"TikTok Shop", trendVelocity:"Rising (+38% search MoM)", demandSignal:"High",
      contentSignal:"Very high — #cleantok 84B views, before/after format proven",
      competitionIntensity:"Medium", priceBand:"$24.90–$34.90", estimatedMargin:"52%",
      landedCostEstimate:"$8.40/unit @500", complianceRisk:"Low", cashCycleRisk:"Low",
      recommendedSupplierRegion:"Ningbo / Shenzhen, CN", firstTestBudget:"$3,000",
      suggestedFirstOrderQty:100, returnRateEst:"6%", platformCommission:"8% (TikTok Shop US)",
      evidenceSummary:"Cleantok format + low unit cost + electrical-but-simple cert path makes this an ideal first short-video SKU.",
      whyNow:"Spring-cleaning seasonality + sustained #cleantok demand; creators actively seeking affordable demo products.",
      antiThesis:"Electrical small appliance = needs FCC/UL-style attention; saturated if you copy the exact viral model.",
      decision:"recommended"
    },
    /* ---- Scenario 2: UK Shopify · pet ---- */
    {
      opportunityId:"OPP-4002", scenario:"UK · Shopify · Pet",
      category:"Pet Care", productConcept:"Slow-feeder lick mat (suction base, food-grade silicone)",
      targetRegion:"UK", targetPersona:"UK dog owners 25–45, anxiety/enrichment-aware, DTC-friendly",
      platform:"Shopify", trendVelocity:"Steady (+12% MoM)", demandSignal:"Medium-High",
      contentSignal:"High — calming/enrichment niche, strong UGC",
      competitionIntensity:"Medium-High", priceBand:"£9.99–£15.99", estimatedMargin:"61%",
      landedCostEstimate:"£2.10/unit @1000", complianceRisk:"Low-Medium", cashCycleRisk:"Low",
      recommendedSupplierRegion:"Dongguan, CN", firstTestBudget:"$2,500",
      suggestedFirstOrderQty:300, returnRateEst:"4%", platformCommission:"0% (own Shopify) + 2.9% PSP",
      evidenceSummary:"Food-grade silicone, high repeat-purchase, brandable enrichment niche with healthy DTC margins.",
      whyNow:"Pet enrichment trend is durable; bundle potential (mat + treats) lifts AOV.",
      antiThesis:"Food-contact silicone = LFGB/FDA-style migration testing; many undifferentiated listings.",
      decision:"recommended"
    },
    /* ---- Scenario 3: DE Amazon · kitchen tools ---- */
    {
      opportunityId:"OPP-4003", scenario:"DE · Amazon · Kitchen Tools",
      category:"Kitchen Tools", productConcept:"Stainless herb mincer / rolling chopper",
      targetRegion:"DE", targetPersona:"German home cooks 30–55, quality- & material-conscious",
      platform:"Amazon", trendVelocity:"Steady", demandSignal:"Medium",
      contentSignal:"Medium — review-driven, less video", competitionIntensity:"High",
      priceBand:"€12.90–€18.90", estimatedMargin:"44%", landedCostEstimate:"€3.80/unit @1000",
      complianceRisk:"Medium", cashCycleRisk:"Medium", recommendedSupplierRegion:"Yangjiang, CN (cutlery cluster)",
      firstTestBudget:"$4,000", suggestedFirstOrderQty:500, returnRateEst:"7%",
      platformCommission:"15% (Amazon) + FBA fees",
      evidenceSummary:"Yangjiang cutlery cluster gives quality at scale; German buyers pay for material & finish.",
      whyNow:"Stable evergreen kitchen demand; LMIV food-contact labeling is learnable and reusable.",
      antiThesis:"High Amazon competition + 15% fee + LFGB food-contact compliance squeeze margins.",
      decision:"watch"
    },
    /* ---- Scenario 4: FR baby · HIGH compliance risk ---- */
    {
      opportunityId:"OPP-4004", scenario:"FR · Shopify/Amazon · Baby (HIGH RISK)",
      category:"Baby & Infant", productConcept:"Silicone baby feeding set (plate + spoon + bib)",
      targetRegion:"FR", targetPersona:"French new parents, safety-first, premium willingness",
      platform:"Shopify", trendVelocity:"Steady", demandSignal:"Medium-High",
      contentSignal:"Medium", competitionIntensity:"Medium", priceBand:"€16.90–€24.90",
      estimatedMargin:"57%", landedCostEstimate:"€4.20/unit @1000", complianceRisk:"High",
      cashCycleRisk:"Medium", recommendedSupplierRegion:"Dongguan, CN (food-grade silicone)",
      firstTestBudget:"$5,000", suggestedFirstOrderQty:300, returnRateEst:"5%",
      platformCommission:"0% Shopify + 2.9% PSP",
      evidenceSummary:"Strong margin & repeat, BUT infant food-contact in EU is a high-compliance gate (EN 14372 / EC 1935/2004 / LFGB).",
      whyNow:"Premium baby is resilient; but DO NOT launch before certification path is cleared.",
      antiThesis:"Infant + food-contact + EU = highest regulatory exposure; a recall could end a small business.",
      decision:"high_risk_review"
    },
    /* ---- Scenario 5: SEA beauty / personal-care ---- */
    {
      opportunityId:"OPP-4005", scenario:"SEA · TikTok Shop · Beauty / Personal Care",
      category:"Beauty & Personal Care", productConcept:"Heatless curling rod set (satin, travel pouch)",
      targetRegion:"ID/PH/MY (SEA)", targetPersona:"SEA Gen-Z women 16–28, value + tutorial-driven",
      platform:"TikTok Shop", trendVelocity:"Rising (+44% MoM)", demandSignal:"High",
      contentSignal:"Very high — overnight-curl tutorials viral in SEA",
      competitionIntensity:"High", priceBand:"$3.90–$6.90", estimatedMargin:"49%",
      landedCostEstimate:"$1.05/unit @2000", complianceRisk:"Low", cashCycleRisk:"Medium-High",
      recommendedSupplierRegion:"Yiwu, CN (accessories cluster)", firstTestBudget:"$2,000",
      suggestedFirstOrderQty:1000, returnRateEst:"9%", platformCommission:"5–8% (TikTok Shop SEA)",
      evidenceSummary:"Ultra-low cost + viral tutorial format; volume game with thin per-unit margin.",
      whyNow:"SEA TikTok Shop GMV surging; cheap testable hero product for creator volume.",
      antiThesis:"Thin margins + high return + price war; only works with content velocity and tight cash.",
      decision:"recommended"
    },
    /* ---- Scenario 6: ME gifts / home ---- */
    {
      opportunityId:"OPP-4006", scenario:"ME · Shopify/Instagram · Gifts & Home",
      category:"Gifts & Home Decor", productConcept:"Arabic calligraphy LED wall light (gift-boxed)",
      targetRegion:"UAE/KSA (ME)", targetPersona:"Gulf gift-buyers, Ramadan/Eid seasonal, premium gifting",
      platform:"Shopify", trendVelocity:"Seasonal spike (Ramadan)", demandSignal:"Medium-High",
      contentSignal:"High — gifting reels, Arabic creators", competitionIntensity:"Medium",
      priceBand:"د.إ79–د.إ149", estimatedMargin:"58%", landedCostEstimate:"$9.80/unit @500",
      complianceRisk:"Medium", cashCycleRisk:"Medium", recommendedSupplierRegion:"Shenzhen, CN (LED) + Yiwu",
      firstTestBudget:"$3,500", suggestedFirstOrderQty:200, returnRateEst:"6%",
      platformCommission:"0% Shopify + COD handling 3–5%",
      evidenceSummary:"High gifting AOV + Ramadan seasonality; Arabic localization and COD logistics are the edge.",
      whyNow:"Pre-Ramadan window; gift-boxed premium items convert well via Gulf creators.",
      antiThesis:"COD return risk + electrical (LED driver) + Arabic RTL packaging requirements.",
      decision:"recommended"
    },
    /* ---- Scenario 7: LatAm small-wholesale buyer ---- */
    {
      opportunityId:"OPP-4007", scenario:"LatAm · Wholesale buyer · Mercado/own store",
      category:"Consumer Electronics Accessories", productConcept:"Multi-port GaN fast charger (65W)",
      targetRegion:"MX/BR (LatAm)", targetPersona:"LatAm small wholesaler reselling to local shops",
      platform:"Mercado Libre / wholesale", trendVelocity:"Steady (+18% MoM)", demandSignal:"High",
      contentSignal:"Low — spec/price-driven, B2B", competitionIntensity:"High",
      priceBand:"MX$320–MX$480", estimatedMargin:"33%", landedCostEstimate:"$7.20/unit @2000",
      complianceRisk:"High", cashCycleRisk:"High", recommendedSupplierRegion:"Shenzhen, CN (GaN chargers)",
      firstTestBudget:"$6,000", suggestedFirstOrderQty:1000, returnRateEst:"8%",
      platformCommission:"12–16% Mercado Libre",
      evidenceSummary:"Wholesale volume play; electrical safety + NOM/Anatel certification is the gating cost.",
      whyNow:"GaN replacing legacy chargers; wholesalers want reliable certified supply.",
      antiThesis:"Electrical + LatAm certification (NOM MX / ANATEL BR) + thin margin + FX volatility.",
      decision:"high_risk_review"
    },
    /* ---- Scenario 8: Overseas boutique small-batch restock ---- */
    {
      opportunityId:"OPP-4008", scenario:"US · Boutique buyer · Small-batch restock",
      category:"Apparel Accessories", productConcept:"Linen-blend bucket hat (boutique colorways)",
      targetRegion:"US", targetPersona:"US independent boutique owner, small-batch curated restock",
      platform:"Faire / own boutique", trendVelocity:"Seasonal (SS)", demandSignal:"Medium",
      contentSignal:"Medium — lifestyle flatlays", competitionIntensity:"Medium",
      priceBand:"$18.00–$28.00", estimatedMargin:"55%", landedCostEstimate:"$4.60/unit @300",
      complianceRisk:"Low-Medium", cashCycleRisk:"Medium", recommendedSupplierRegion:"Shantou / Hangzhou, CN",
      firstTestBudget:"$2,800", suggestedFirstOrderQty:150, returnRateEst:"5%",
      platformCommission:"15–25% Faire (first orders)",
      evidenceSummary:"Small-batch curated restock; low MOQ flexibility and color matching are the supplier edge.",
      whyNow:"Boutiques want differentiated small runs vs. mass marketplaces.",
      antiThesis:"Textile labeling (fiber content/care/country of origin) + small MOQ raises unit cost.",
      decision:"watch"
    }
  ];

  /* ---- 10 more opportunities (variations across the 8 scenarios) to reach 18 ---- */
  const more = [
    {opportunityId:"OPP-4009",scenario:"US · TikTok Shop · Home Cleaning",category:"Home Cleaning",productConcept:"Grout & tile cleaning gel (foaming, citrus)",targetRegion:"US",targetPersona:"US homeowners, satisfying-clean viewers",platform:"TikTok Shop",trendVelocity:"Rising (+29% MoM)",demandSignal:"High",contentSignal:"Very high — grout transformation videos",competitionIntensity:"Medium-High",priceBand:"$12.90–$17.90",estimatedMargin:"63%",landedCostEstimate:"$2.30/unit @1000",complianceRisk:"Medium",cashCycleRisk:"Low",recommendedSupplierRegion:"Guangzhou, CN (chemicals)",firstTestBudget:"$2,500",suggestedFirstOrderQty:500,returnRateEst:"4%",platformCommission:"8% TikTok Shop US",evidenceSummary:"Chemical/consumable = high repeat, but liquids face shipping & GHS labeling constraints.",whyNow:"Consumable repeat-purchase model + viral demo format.",antiThesis:"Chemical formulation/SDS, air-freight restrictions on liquids, US OTC/labeling rules.",decision:"high_risk_review"},
    {opportunityId:"OPP-4010",scenario:"UK · Shopify · Pet",category:"Pet Care",productConcept:"Dog car seat-belt harness (crash-tested style)",targetRegion:"UK",targetPersona:"UK dog owners who travel, safety-minded",platform:"Shopify",trendVelocity:"Steady",demandSignal:"Medium",contentSignal:"Medium",competitionIntensity:"Medium",priceBand:"£14.99–£22.99",estimatedMargin:"58%",landedCostEstimate:"£3.40/unit @1000",complianceRisk:"Medium",cashCycleRisk:"Low",recommendedSupplierRegion:"Nantong, CN (pet webbing)",firstTestBudget:"$3,000",suggestedFirstOrderQty:300,returnRateEst:"6%",platformCommission:"0% Shopify + 2.9% PSP",evidenceSummary:"Safety positioning lifts margin; 'crash-tested' claims need substantiation.",whyNow:"Pet-travel safety awareness rising in UK.",antiThesis:"Safety claims = advertising-claim risk without real test data.",decision:"watch"},
    {opportunityId:"OPP-4011",scenario:"DE · Amazon · Kitchen Tools",category:"Kitchen Tools",productConcept:"Adjustable mandoline slicer (finger guard)",targetRegion:"DE",targetPersona:"German home cooks, precision-focused",platform:"Amazon",trendVelocity:"Steady",demandSignal:"Medium",contentSignal:"Low-Medium",competitionIntensity:"High",priceBand:"€16.90–€26.90",estimatedMargin:"46%",landedCostEstimate:"€5.10/unit @1000",complianceRisk:"Medium",cashCycleRisk:"Medium",recommendedSupplierRegion:"Yangjiang, CN",firstTestBudget:"$4,500",suggestedFirstOrderQty:500,returnRateEst:"9%",platformCommission:"15% Amazon + FBA",evidenceSummary:"Higher AOV than herb mincer; sharp-blade injury & GS-mark expectations.",whyNow:"Evergreen; bundle with herb mincer for AOV.",antiThesis:"Injury liability + high returns + Amazon DE GS-mark buyer expectation.",decision:"watch"},
    {opportunityId:"OPP-4012",scenario:"FR · Shopify · Baby",category:"Baby & Infant",productConcept:"Organic cotton baby muslin swaddle (3-pack)",targetRegion:"FR",targetPersona:"French eco-conscious new parents",platform:"Shopify",trendVelocity:"Steady",demandSignal:"Medium",contentSignal:"Medium",competitionIntensity:"Medium",priceBand:"€24.90–€34.90",estimatedMargin:"60%",landedCostEstimate:"€5.80/unit @1000",complianceRisk:"Medium-High",cashCycleRisk:"Medium",recommendedSupplierRegion:"Nantong / Gaomi, CN (cotton)",firstTestBudget:"$4,000",suggestedFirstOrderQty:300,returnRateEst:"4%",platformCommission:"0% Shopify",evidenceSummary:"Textile (not food-contact) lowers risk vs feeding set; OEKO-TEX & GOTS substantiate 'organic'.",whyNow:"Eco baby textiles command premium in FR.",antiThesis:"'Organic' claim needs GOTS; infant textile flammability/labeling rules.",decision:"watch"},
    {opportunityId:"OPP-4013",scenario:"SEA · TikTok Shop · Beauty",category:"Beauty & Personal Care",productConcept:"Color-stay lip & cheek tint (vegan)",targetRegion:"ID/PH (SEA)",targetPersona:"SEA Gen-Z, value cosmetics",platform:"TikTok Shop",trendVelocity:"Rising (+51% MoM)",demandSignal:"High",contentSignal:"Very high — GRWM/tint swatches",competitionIntensity:"High",priceBand:"$2.90–$5.90",estimatedMargin:"54%",landedCostEstimate:"$0.78/unit @3000",complianceRisk:"High",cashCycleRisk:"High",recommendedSupplierRegion:"Guangzhou, CN (cosmetics OEM)",firstTestBudget:"$2,500",suggestedFirstOrderQty:2000,returnRateEst:"7%",platformCommission:"5–8% TikTok Shop SEA",evidenceSummary:"Cosmetic = skin contact + ingredient & registration regimes (BPOM ID / FDA PH).",whyNow:"SEA color cosmetics booming on TikTok.",antiThesis:"Leave-on cosmetic = ingredient compliance, BPOM/FDA registration, allergen labeling.",decision:"high_risk_review"},
    {opportunityId:"OPP-4014",scenario:"ME · Shopify · Gifts & Home",category:"Gifts & Home Decor",productConcept:"Premium incense & bakhoor gift set",targetRegion:"KSA/UAE (ME)",targetPersona:"Gulf gifting & majlis hospitality",platform:"Shopify",trendVelocity:"Seasonal",demandSignal:"Medium-High",contentSignal:"Medium-High",competitionIntensity:"Medium",priceBand:"د.إ99–د.إ189",estimatedMargin:"62%",landedCostEstimate:"$11.50/unit @500",complianceRisk:"Medium",cashCycleRisk:"Medium",recommendedSupplierRegion:"Yiwu, CN + local ME blends",firstTestBudget:"$4,000",suggestedFirstOrderQty:200,returnRateEst:"5%",platformCommission:"0% Shopify + COD",evidenceSummary:"Culturally resonant high-AOV gifting; fragrance/combustible shipping constraints.",whyNow:"Ramadan/Eid + wedding-season gifting.",antiThesis:"Combustible + fragrance allergen labeling + COD returns.",decision:"watch"},
    {opportunityId:"OPP-4015",scenario:"LatAm · Wholesale · Home",category:"Home & Kitchen",productConcept:"Insulated stainless tumbler (40oz, handle)",targetRegion:"MX (LatAm)",targetPersona:"LatAm wholesaler reselling trendy drinkware",platform:"Mercado Libre / wholesale",trendVelocity:"Rising (+22% MoM)",demandSignal:"High",contentSignal:"Medium",competitionIntensity:"High",priceBand:"MX$280–MX$420",estimatedMargin:"38%",landedCostEstimate:"$5.10/unit @2000",complianceRisk:"Medium",cashCycleRisk:"High",recommendedSupplierRegion:"Yongkang, CN (drinkware cluster)",firstTestBudget:"$6,000",suggestedFirstOrderQty:1000,returnRateEst:"5%",platformCommission:"12–16% Mercado Libre",evidenceSummary:"Stanley-style trend; food-contact + Prop65-style if reselling into US too.",whyNow:"Tumbler trend reached LatAm; wholesalers chasing supply.",antiThesis:"Food-contact migration + heavy/volumetric freight + FX risk.",decision:"watch"},
    {opportunityId:"OPP-4016",scenario:"US · Boutique · Small-batch",category:"Home Fragrance",productConcept:"Hand-poured soy candle (boutique scents, 8oz)",targetRegion:"US",targetPersona:"US boutique restocking gift section",platform:"Faire / boutique",trendVelocity:"Steady",demandSignal:"Medium",contentSignal:"Medium",competitionIntensity:"Medium",priceBand:"$16.00–$26.00",estimatedMargin:"52%",landedCostEstimate:"$4.10/unit @300",complianceRisk:"Medium-High",cashCycleRisk:"Medium",recommendedSupplierRegion:"Domestic US pour OR Jiangmen, CN (glass+wax)",firstTestBudget:"$3,000",suggestedFirstOrderQty:150,returnRateEst:"4%",platformCommission:"15–25% Faire",evidenceSummary:"Boutique gifting staple; candle fire-safety/CLP fragrance labeling required.",whyNow:"Evergreen boutique gift; private-label brandable.",antiThesis:"Combustible + fragrance allergen (CLP/IFRA) labeling + air-freight limits.",decision:"high_risk_review"},
    {opportunityId:"OPP-4017",scenario:"US · TikTok Shop · Home Cleaning",category:"Home Cleaning",productConcept:"Microfiber spin mop with bucket (hands-free wring)",targetRegion:"US",targetPersona:"US households, satisfying-clean + utility buyers",platform:"TikTok Shop",trendVelocity:"Steady",demandSignal:"Medium-High",contentSignal:"High",competitionIntensity:"High",priceBand:"$29.90–$44.90",estimatedMargin:"41%",landedCostEstimate:"$11.80/unit @300",complianceRisk:"Low",cashCycleRisk:"Medium",recommendedSupplierRegion:"Cixi, CN (cleaning tools)",firstTestBudget:"$4,500",suggestedFirstOrderQty:200,returnRateEst:"7%",platformCommission:"8% TikTok Shop US",evidenceSummary:"Non-electrical, low compliance; but bulky/volumetric freight squeezes margin.",whyNow:"Always-on cleaning demand; demoable utility.",antiThesis:"Volumetric freight + bucket bulk + crowded category.",decision:"watch"},
    {opportunityId:"OPP-4018",scenario:"UK · Shopify · Pet",category:"Pet Care",productConcept:"Self-cleaning slicker brush (one-click hair release)",targetRegion:"UK",targetPersona:"UK dog & cat owners, grooming-at-home",platform:"Shopify",trendVelocity:"Rising (+24% MoM)",demandSignal:"Medium-High",contentSignal:"High — grooming ASMR/demo",competitionIntensity:"Medium",priceBand:"£11.99–£17.99",estimatedMargin:"59%",landedCostEstimate:"£2.60/unit @1000",complianceRisk:"Low",cashCycleRisk:"Low",recommendedSupplierRegion:"Dongguan, CN (pet tools)",firstTestBudget:"$2,800",suggestedFirstOrderQty:300,returnRateEst:"5%",platformCommission:"0% Shopify + 2.9% PSP",evidenceSummary:"Low compliance, strong demo content, healthy margin — clean DTC starter.",whyNow:"Grooming-at-home cost-saving trend + demo virality.",antiThesis:"Easy to copy; differentiate on brand + content.",decision:"recommended"}
  ];
  opportunities.push(...more);

  /* =========================================================================
   * SUPPLIER TRUST GRAPH — 90 suppliers (5 per opportunity), DYNAMIC scoring.
   * Trust is COMPUTED from live signals, not a static card number:
   *   quoteSpeed, sampleConsistency, onTimeRate, disputeRate,
   *   certConfidence, marketFit  ->  trustScore (0–100) + tier + trend
   * ======================================================================= */
  const REGIONS = {
    "Home Cleaning":["Ningbo, CN","Shenzhen, CN","Cixi, CN","Taizhou, CN","Guangzhou, CN"],
    "Pet Care":["Dongguan, CN","Nantong, CN","Yiwu, CN","Jinhua, CN","Shenzhen, CN"],
    "Kitchen Tools":["Yangjiang, CN","Yongkang, CN","Jieyang, CN","Ningbo, CN","Foshan, CN"],
    "Baby & Infant":["Dongguan, CN","Nantong, CN","Gaomi, CN","Xiamen, CN","Quanzhou, CN"],
    "Beauty & Personal Care":["Guangzhou, CN","Yiwu, CN","Shenzhen, CN","Jinhua, CN","Shantou, CN"],
    "Gifts & Home Decor":["Yiwu, CN","Shenzhen, CN","Jinhua, CN","Quanzhou, CN","Shantou, CN"],
    "Consumer Electronics Accessories":["Shenzhen, CN","Dongguan, CN","Huizhou, CN","Xiamen, CN","Suzhou, CN"],
    "Apparel Accessories":["Shantou, CN","Hangzhou, CN","Nantong, CN","Yiwu, CN","Guangzhou, CN"],
    "Home & Kitchen":["Yongkang, CN","Jinhua, CN","Ningbo, CN","Foshan, CN","Chaozhou, CN"],
    "Home Fragrance":["Jiangmen, CN","Yiwu, CN","Guangzhou, CN","Shantou, CN","Quanzhou, CN"]
  };
  const FACTORY_TAGS = ["Trading + own line","Verified factory","OEM/ODM factory","Large export factory","Boutique workshop"];
  const CERT_POOL = {
    "Home Cleaning":["CE","RoHS","FCC","UL-style report"],
    "Pet Care":["LFGB (food-grade)","FDA (food-contact)","REACH","ISO 9001"],
    "Kitchen Tools":["LFGB","FDA","CE","GS-mark report"],
    "Baby & Infant":["EN 14372","EC 1935/2004","LFGB","FDA","CPC (US)"],
    "Beauty & Personal Care":["GMPC/ISO 22716","BPOM-ready dossier","FDA OTC-ready","SGS ingredient report"],
    "Gifts & Home Decor":["CE","RoHS","FCC","REACH"],
    "Consumer Electronics Accessories":["CE","FCC","UL","NOM (MX)","ANATEL (BR)","RoHS"],
    "Apparel Accessories":["OEKO-TEX","fiber content lab report","REACH (azo dyes)"],
    "Home & Kitchen":["LFGB","FDA","Prop65 report","CE"],
    "Home Fragrance":["IFRA","CLP/SDS","REACH","fire-safety report"]
  };

  /* Five deterministic supplier ROLES per opportunity so every shortlist
     contains a small-test pick, a cert-trustworthy pick, a scale pick,
     a balanced pick, and a high-risk option. This makes the must-pass story
     ("which for small-test, which more cert-trustworthy, which high-risk")
     true for ALL 18 opportunities. */
  const ROLES = [
    {key:"recommended_test", moq:100,  qs:0.92,sc:0.88,ot:0.94,dr:0.02,cc:0.74,mf:0.9, resp:[2,8],   priceMul:0.36,
      bestFor:"Small test orders — fast quotes, consistent samples, low 100-unit MOQ.", watchOut:"Premium unit price vs. larger factories — fine for testing, renegotiate at scale.", tag:"Boutique workshop"},
    {key:"recommended_cert", moq:300,  qs:0.78,sc:0.93,ot:0.96,dr:0.015,cc:0.95,mf:0.84,resp:[6,16], priceMul:0.40,
      bestFor:"Compliance-sensitive markets — strongest, verifiable certification confidence.", watchOut:"Longer sample lead time and higher MOQ than the test pick.", tag:"Verified factory"},
    {key:"recommended_scale",moq:1000, qs:0.7, sc:0.85,ot:0.9, dr:0.03,cc:0.7, mf:0.8, resp:[8,20], priceMul:0.26,
      bestFor:"Scale orders — lowest unit cost once the product is validated.", watchOut:"1000-unit MOQ; do NOT use for first test — cash risk.", tag:"Large export factory"},
    {key:"conditional",      moq:500,  qs:0.75,sc:0.8, ot:0.87,dr:0.04,cc:0.68,mf:0.78,resp:[10,24],priceMul:0.32,
      bestFor:"Balanced mid-option — reasonable on every axis.", watchOut:"No standout strength; only choose after a War Room comparison.", tag:"OEM/ODM factory"},
    {key:"not_recommended",  moq:2000, qs:0.55,sc:0.6, ot:0.7, dr:0.08,cc:0.42,mf:0.6, resp:[26,42],priceMul:0.23,
      bestFor:"Backup / last resort only.", watchOut:"Elevated dispute rate, weak certification confidence and slow replies — verify heavily before any sample.", tag:"Trading + own line"}
  ];

  function buildSuppliers(opp, oppIdx){
    const regions = REGIONS[opp.category] || ["Shenzhen, CN"];
    const certs = CERT_POOL[opp.category] || ["CE","RoHS"];
    const out = [];
    for(let i=0;i<5;i++){
      const role = ROLES[i];
      const seed = opp.opportunityId+"-S"+i;
      const r = rnd(seed);
      // signals jittered slightly around the role profile (keeps it non-identical)
      const j=(base,amt)=>Math.max(0.01,Math.min(0.99,round(base+between(-amt,amt,seed+base),3)));
      const quoteSpeed = j(role.qs,0.05), sampleConsistency=j(role.sc,0.05), onTimeRate=j(role.ot,0.04);
      const disputeRate = round(Math.max(0.005,role.dr+between(-0.01,0.01,seed+"d")),3);
      const certConfidence = j(role.cc,0.05), marketFit=j(role.mf,0.05);
      const responseSpeedHours = round(between(role.resp[0],role.resp[1],seed+"h"),1);
      const trustScore = Math.round(100*(
        0.20*quoteSpeed + 0.22*sampleConsistency + 0.22*onTimeRate +
        0.18*(1-disputeRate*5) + 0.10*certConfidence + 0.08*marketFit
      ));
      const tier = trustScore>=82?"A · Trusted":trustScore>=70?"B · Reliable":trustScore>=58?"C · Workable":"D · Caution";
      const trend = pick(["improving","stable","stable","declining"], seed+"trend");
      const priceUsd = round(parsePrice(opp.priceBand)*role.priceMul,2);
      const moq = role.moq;
      const certCount = role.key==="not_recommended"?1:(role.key==="recommended_cert"?certs.length:Math.min(3,certs.length));
      const supCerts = certs.slice(0, Math.max(1,certCount));
      const commRisk = responseSpeedHours>24?"Medium-High":responseSpeedHours>12?"Medium":"Low";
      const recommend = role.key, bestFor=role.bestFor, watchOut=role.watchOut;
      out.push({_raw:{quoteSpeed,sampleConsistency,onTimeRate,disputeRate,certConfidence,marketFit},
        supplierId:`SUP-${opp.opportunityId.slice(4)}-${i+1}`,
        opportunityId:opp.opportunityId,
        factoryName:`${pick(["Hongsheng","Jiale","Yuanfeng","Tianhe","Borui","Kaixin","Mingda","Senrong"],seed+"n")} ${opp.category.split(" ")[0]} Co.`,
        factoryRegion:pick(regions,seed+"r"),
        factoryTag:role.tag,
        mainCategories:[opp.category, pick(["accessories","gift packaging","spare parts","bundles"],seed+"cat")],
        moq,
        priceRange:`$${round(priceUsd*0.92,2)}–$${round(priceUsd*1.12,2)} /unit`,
        unitPriceUsd:priceUsd,
        sampleLeadTimeDays:Math.round(between(3,14,seed+"slt")),
        productionLeadTimeDays:Math.round(between(12,38,seed+"plt")),
        certifications:supCerts,
        exportMarkets:pick([["US","EU","UK"],["US","SEA","ME"],["EU","UK","LatAm"],["US","EU","SEA","ME","LatAm"]],seed+"ex"),
        onTimeFulfillmentRate:Math.round(onTimeRate*100)+"%",
        returnDisputeRate:round(disputeRate*100,1)+"%",
        platformRating:round(between(3.6,4.9,seed+"pr"),1),
        responseSpeedHours,
        qualityConsistencyScore:Math.round(sampleConsistency*100),
        communicationRisk:commRisk,
        certificationConfidence:Math.round(certConfidence*100),
        marketFit:Math.round(marketFit*100),
        quoteSpeedScore:Math.round(quoteSpeed*100),
        // dynamic trust graph output
        trustScore, trustTier:tier, trustTrend:trend,
        bestFor, watchOut, recommend,
        recommendedNegotiation: moq>500
          ? `Anchor on a ${Math.round(moq/3)}-unit trial at sample price; ask to amortize tooling over first 3 orders.`
          : `Lock unit price for 90 days; request 2 free revised samples before PO.`
      });
    }
    // sort by trust descending so shortlist ordering is meaningful
    return out.sort((a,b)=>b.trustScore-a.trustScore);
  }

  const suppliersByOpp = {};
  opportunities.forEach((o,idx)=>{ suppliersByOpp[o.opportunityId]=buildSuppliers(o,idx); });
  const allSuppliers = Object.values(suppliersByOpp).flat();

  /* trust signals (append-only feed behind the dynamic score) */
  const supplierTrustSignals = [];
  allSuppliers.forEach((s)=>{
    [["quote_returned",`Quote returned in ${s.responseSpeedHours}h`],
     ["sample_consistency",`Sample consistency ${s.qualityConsistencyScore}/100 vs spec`],
     ["on_time",`On-time fulfillment ${s.onTimeFulfillmentRate}`],
     ["cert_confidence",`Certification confidence ${s.certificationConfidence}/100`]
    ].forEach(([type,note],i)=>{
      supplierTrustSignals.push({signalId:`TS-${s.supplierId}-${i}`,supplierId:s.supplierId,signalType:type,weight:[0.2,0.22,0.22,0.1][i],note,observedAt:`2026-0${(i%5)+1}-1${i}T09:00:00Z`});
    });
  });

  /* =========================================================================
   * SKU PASSPORTS — the irreplaceable data asset.
   * First 12 opportunities have a fully-populated passport (active Deal Rooms).
   * ======================================================================= */
  const STAGES = ["opportunity_confirmed","supplier_inquiry","quote_received","sample_requested",
    "sample_in_production","sample_received","sample_feedback","small_batch_po","production",
    "quality_inspection","shipping_quote","customs_clearance","delivered","after_sales","reorder_decision"];
  const STAGE_FOR_INDEX = [13,4,9,6,7,2,11,5,8,3,10,1]; // varied current stage per passport

  const passports = opportunities.slice(0,12).map((opp,idx)=>{
    const sid = `SKU-${opp.opportunityId.slice(4)}`;
    const stageIdx = STAGE_FOR_INDEX[idx];
    const sup = suppliersByOpp[opp.opportunityId];
    const lead = sup[0];
    return {
      skuPassportId:sid, opportunityId:opp.opportunityId,
      skuName:opp.productConcept, category:opp.category,
      targetRegion:opp.targetRegion, platform:opp.platform, targetPersona:opp.targetPersona,
      currentStage:STAGES[stageIdx], stageIndex:stageIdx,
      overallRisk: opp.complianceRisk==="High"?"High":opp.complianceRisk.indexOf("Medium")>=0?"Medium":"Low",
      leadSupplierId:lead.supplierId, leadSupplierTrust:lead.trustScore,
      createdAt:`2026-0${(idx%5)+1}-1${idx%9}T08:00:00Z`,
      history:["opportunity_discovered","thesis_generated","suppliers_matched"].concat(STAGES.slice(0,stageIdx))
    };
  });
  const passportByOpp = {}; passports.forEach(p=>passportByOpp[p.opportunityId]=p);

  /* =========================================================================
   * TRADE LOOP LEDGER seed events (>=60, append-only). actorType: user/ai/supplier/system
   * ======================================================================= */
  const ledgerEvents = [];
  let lc = 1000;
  const EV = [
    ["opportunity_discovered","ai","MarketDemandSignal scan","Low"],
    ["thesis_generated","ai","TradeAiService.generateOpportunityReport","Low"],
    ["suppliers_matched","ai","TradeAiService.recommendSuppliers","Low"],
    ["inquiry_drafted","ai","TradeAiService.generateInquiryEmail","Medium"],
    ["human_approved_inquiry","user","Human approval","Medium"],
    ["quote_received","supplier","Supplier response (mock)","Low"],
    ["compliance_checked","ai","TradeAiService.runComplianceRouteCheck","Medium"],
    ["cash_score_calculated","ai","CashEngine","Medium"]
  ];
  passports.forEach((p)=>{
    EV.slice(0, 5+ (p.stageIndex%4)).forEach(([type,actor,src,risk],i)=>{
      ledgerEvents.push({
        eventId:`LE-${lc++}`, skuPassportId:p.skuPassportId, eventType:type,
        timestamp:`2026-0${(i%5)+1}-1${(i%9)}T1${i%9}:00:00Z`, actorType:actor, source:src,
        confidenceScore: actor==="ai"?round(between(0.7,0.92,p.skuPassportId+type),2):1,
        riskLevel:risk, userApprovalRequired: type.startsWith("human"), 
        evidence:`Recorded for ${p.skuName} (${p.targetRegion}/${p.platform}).`,
        nextAction:"advance_stage", auditNote:"Seed ledger entry."
      });
    });
  });

  /* =========================================================================
   * COMPLIANCE ROUTES (>=12; >=8 high-risk). Reusable Compliance Memory.
   * ======================================================================= */
  // >=8 high-risk compliance CASES within the 12 active routes (baby, electrical,
  // chemical, cosmetics, fragrance, food-contact, sharp-blade, claims-heavy).
  const HIGH_RISK_OPPS = ["OPP-4004","OPP-4007","OPP-4009","OPP-4011","OPP-4012","OPP-4003","OPP-4006","OPP-4010"];
  const complianceRoutes = opportunities.slice(0,12).map((opp)=>{
    const high = opp.complianceRisk==="High" || HIGH_RISK_OPPS.indexOf(opp.opportunityId)>=0;
    const med = !high && opp.complianceRisk.indexOf("Medium")>=0;
    const level = high?"High":med?"Medium":"Low";
    return {
      complianceRouteId:`CR-${opp.opportunityId.slice(4)}`, opportunityId:opp.opportunityId,
      country:opp.targetRegion, platform:opp.platform, category:opp.category,
      riskLevel:level, goNoGo: high?"no_go_until_certified":med?"go_with_conditions":"go",
      certifications: (CERT_POOL[opp.category]||["CE"]).slice(0,high?5:3),
      requiredDocuments: high?["Test report","Certificate of conformity","Material safety/SDS","Importer declaration","Labeling proof"]:["Test report","Certificate of conformity","Labeling proof"],
      restrictedKeywords: opp.category.indexOf("Baby")>=0?["medical","cures colic","BPA-free (unless tested)","hospital-grade"]
        : opp.category.indexOf("Beauty")>=0?["anti-aging","heals","dermatologist-approved (unless substantiated)","FDA-approved"]
        : opp.category.indexOf("Cleaning")>=0?["disinfects 99.9% (unless EPA-tested)","kills all germs","non-toxic (unless verified)"]
        : ["best in the world","guaranteed","#1 (unless substantiated)"],
      saferAlternatives: high?[`Non-food-contact variant of ${opp.category}`, "Pre-certified supplier SKU"]:["Lower-claim positioning"],
      reusableFor:`${opp.targetRegion} · ${opp.platform} · ${opp.category}`
    };
  });

  /* =========================================================================
   * CASH CONVERSION inputs (>=12) feeding the Cash Conversion cockpit.
   * ======================================================================= */
  function cashInputsFor(opp){
    const sup = suppliersByOpp[opp.opportunityId];
    const testSup = sup.find(s=>s.recommend==="recommended_test")||sup[0];
    const sellUsd = parsePrice(opp.priceBand);
    const buyUsd = testSup.unitPriceUsd;
    const commPct = opp.platform.indexOf("Amazon")>=0?0.15:opp.platform.indexOf("TikTok")>=0?0.08:opp.platform.indexOf("Mercado")>=0?0.14:0.029;
    const retPct = parseFloat(opp.returnRateEst)/100 || 0.06;
    return {
      opportunityId:opp.opportunityId, currency:"USD",
      purchaseUnitPrice:buyUsd,
      // Default cockpit qty = the merchant's suggested first-order size (varies
      // 100–1000). Large orders surface "test_smaller"; thin margins surface
      // "negotiate"/"stop". The cockpit sliders let the user change this live.
      moq: opp.suggestedFirstOrderQty,
      // Tooling only for genuinely custom-mold products; catalog SKUs (the
      // first-test home-cleaning hero) reuse existing molds => no tooling.
      sampleFee:round(buyUsd*3+15,2),
      toolingFee: opp.category.indexOf("Electronics")>=0?280:0,
      packagingPerUnit:round(sellUsd*0.04+0.2,2),
      intlFreightPerUnit:round(sellUsd*(opp.category.indexOf("Home & Kitchen")>=0||opp.productConcept.indexOf("mop")>=0?0.16:0.07),2),
      localWarehousingPerUnit:round(sellUsd*0.02,2),
      tariffPct: opp.targetRegion==="US"?0.06:opp.targetRegion.indexOf("EU")>=0||opp.targetRegion==="FR"||opp.targetRegion==="DE"?0.045:opp.targetRegion.indexOf("LatAm")>=0||opp.targetRegion.indexOf("MX")>=0?0.16:0.05,
      platformCommissionPct:commPct, paymentFeePct:0.029,
      // Realistic test ad budget: a small merchant caps ad spend (not scaled
      // linearly with a huge first order). 8–14% of expected first-batch revenue, capped.
      adBudget: Math.min(1200, round(sellUsd*Math.min(opp.suggestedFirstOrderQty,200)*between(0.10,0.16,opp.opportunityId+"ad"),0)),
      sellingPrice:sellUsd, discountPct: opp.platform.indexOf("TikTok")>=0?0.1:0.05,
      returnRatePct:retPct, damageRatePct:0.015,
      fxBufferPct: opp.targetRegion.indexOf("LatAm")>=0||opp.targetRegion.indexOf("MX")>=0?0.04:0.02,
      supplierTermsDays: 0, expectedSellThroughDays: opp.platform.indexOf("TikTok")>=0?21:35
    };
  }
  const cashInputs = opportunities.slice(0,12).map(cashInputsFor);

  /* =========================================================================
   * GROWTH EXPERIMENTS (>=12) — each with a seeded 7-day test result.
   * ======================================================================= */
  const growthExperiments = opportunities.slice(0,12).map((opp,idx)=>{
    const r=rnd(opp.opportunityId+"g");
    const views=Math.round(between(8000,140000,opp.opportunityId+"v"));
    const ctr=round(between(0.8,4.2,opp.opportunityId+"ctr"),2);
    const clicks=Math.round(views*ctr/100);
    const cvr=round(between(0.9,5.5,opp.opportunityId+"cvr"),2);
    const orders=Math.round(clicks*cvr/100);
    const refunds=Math.round(orders*(parseFloat(opp.returnRateEst)/100||0.06));
    const adSpend=Math.round(between(120,900,opp.opportunityId+"ad7"));
    return {
      growthExperimentId:`GX-${opp.opportunityId.slice(4)}`, opportunityId:opp.opportunityId,
      platform:opp.platform, windowDays:7,
      metrics:{views,clicks,ctr,cvr,orders,refunds,adSpend,
        cac: orders? round(adSpend/orders,2):null,
        commentsSummary: pick(["mostly positive, asking price","skeptical on durability","loving the demo, want bundle","price-sensitive comments"],opp.opportunityId+"cm"),
        creatorPerformance: pick(["1 mid creator drove 60% of orders","flat across creators","top creator overperformed 4x"],opp.opportunityId+"cp"),
        customerComplaints: pick(["none","minor packaging","slow shipping perception"],opp.opportunityId+"cc")},
      status:"awaiting_decision"
    };
  });

  /* =========================================================================
   * AGENT ACTIONS needing human approval (high-risk default no auto-execute).
   * ======================================================================= */
  const HIGH_RISK_ACTIONS = ["send_inquiry","confirm_order","request_credit_terms","generate_compliance_statement","submit_listing","trigger_payment","share_supplier_data"];
  const agentActions = [];
  let ac=500;
  passports.slice(0,8).forEach((p,i)=>{
    const type=HIGH_RISK_ACTIONS[i%HIGH_RISK_ACTIONS.length];
    agentActions.push({
      agentActionId:`AA-${ac++}`, skuPassportId:p.skuPassportId, opportunityId:p.opportunityId,
      actionType:type, riskLevel: type==="trigger_payment"||type==="confirm_order"?"High":"Medium",
      humanApprovalRequired:true, status:"pending_approval",
      summary:`Atlaz proposes to ${type.replace(/_/g," ")} for ${p.skuName}.`,
      reversible: type==="trigger_payment"||type==="confirm_order"?false:true,
      proposedAt:`2026-06-1${i}T10:00:00Z`,
      sideEffects: type==="trigger_payment"?["Moves funds (mock)","Locks PO"]:type==="submit_listing"?["Publishes listing (mock)"]:["Sends external message (mock)"]
    });
  });

  /* =========================================================================
   * DOCUMENT TEMPLATES (8 types), MARKET DEMAND SIGNALS, FX RATES (10 ccy)
   * ======================================================================= */
  const documentTemplates = [
    {templateId:"DOC-PO",docType:"Purchase Order"},{templateId:"DOC-CI",docType:"Commercial Invoice"},
    {templateId:"DOC-PL",docType:"Packing List"},{templateId:"DOC-QC",docType:"QC Checklist"},
    {templateId:"DOC-SB",docType:"Sample Brief"},{templateId:"DOC-RFQ",docType:"RFQ"},
    {templateId:"DOC-LQ",docType:"Logistics Quote Request"},{templateId:"DOC-AS",docType:"After-sales Response"}
  ].map(d=>Object.assign(d,{fields:["seller","buyer","sku","qty","unitPrice","incoterm","date"]}));

  const marketDemandSignals = opportunities.map(o=>({
    signalId:`MDS-${o.opportunityId.slice(4)}`, opportunityId:o.opportunityId,
    region:o.targetRegion, platform:o.platform, trendVelocity:o.trendVelocity,
    demandSignal:o.demandSignal, contentSignal:o.contentSignal, source:"Aggregated platform/search signal (mock)"
  }));

  // FX mock service — 10 currencies. Future: replace with real FX API (see API_INTEGRATION_ROADMAP).
  const currencyRates = [
    {quote:"USD",rate:1},{quote:"CNY",rate:7.19},{quote:"EUR",rate:0.92},{quote:"GBP",rate:0.79},
    {quote:"JPY",rate:157.2},{quote:"CAD",rate:1.37},{quote:"AUD",rate:1.51},{quote:"AED",rate:3.67},
    {quote:"MXN",rate:17.1},{quote:"BRL",rate:5.42}
  ];
  const FxService = {
    base:"USD", asOf:"2026-06-13 (mock snapshot)", isMock:true,
    rate:(code)=>(currencyRates.find(r=>r.quote===code)||{rate:1}).rate,
    convert:(usd,code)=>round(usd*((currencyRates.find(r=>r.quote===code)||{rate:1}).rate),2)
  };

  /* =========================================================================
   * DEAL ROOM AGGREGATOR — assembles ONE SKU's full closed loop.
   * This is what makes Atlaz a Deal Room product, not a tab product.
   * ======================================================================= */
  function dealRoom(opportunityId){
    const opp = opportunities.find(o=>o.opportunityId===opportunityId);
    if(!opp) return null;
    return {
      opportunity:opp,
      passport:passportByOpp[opportunityId]||null,
      suppliers:suppliersByOpp[opportunityId]||[],
      compliance:complianceRoutes.find(c=>c.opportunityId===opportunityId)||null,
      cashInputs:cashInputs.find(c=>c.opportunityId===opportunityId)||cashInputsFor(opp),
      growth:growthExperiments.find(g=>g.opportunityId===opportunityId)||null,
      ledger:ledgerEvents.filter(e=>e.skuPassportId===`SKU-${opportunityId.slice(4)}`),
      agentActions:agentActions.filter(a=>a.opportunityId===opportunityId)
    };
  }
  const dealRoomIds = passports.map(p=>p.opportunityId); // 12 browsable Deal Rooms

  return { hash, rnd, pick, between, round, parsePrice, FX_TO_USD, FxService, currencyRates,
           opportunities, suppliersByOpp, allSuppliers, supplierTrustSignals,
           passports, passportByOpp, ledgerEvents, complianceRoutes, cashInputs, cashInputsFor,
           growthExperiments, agentActions, documentTemplates, marketDemandSignals,
           STAGES, HIGH_RISK_ACTIONS, dealRoom, dealRoomIds,
           getOpp:(id)=>opportunities.find(o=>o.opportunityId===id),
           getSuppliers:(id)=>suppliersByOpp[id]||[],
           getCompliance:(opp)=>complianceRoutes.find(c=>c.opportunityId===(opp.opportunityId||opp)),
           getCashInputs:(opp)=>cashInputs.find(c=>c.opportunityId===(opp.opportunityId||opp))||cashInputsFor(opp) };
})();
if (typeof window !== "undefined") window.DB = DB;
if (typeof module !== "undefined" && module.exports) module.exports = DB;
if (typeof global !== "undefined") global.DB = DB;
