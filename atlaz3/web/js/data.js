/* ============================================================================
 * Atlaz · Data layer (mock, production-shaped)
 * 30 domain models. Real, business-grade mock data — no lorem ipsum.
 * Global: DB
 * ==========================================================================*/
const DB = (() => {
  const REGIONS = ["Shenzhen","Guangzhou","Dongguan","Yiwu","Ningbo","Foshan","Xiamen","Qingdao","Suzhou","Hangzhou"];
  const CERTS = ["CE","FCC","RoHS","FDA(mock)","LFGB(mock)","CPSIA(mock)","REACH(mock)","ISO 9001","BSCI","Sedex","PSE(mock)","UKCA(mock)"];

  /* ---------- 1. ProductOpportunity (12, 23 fields each) ---------- */
  const opportunities = [
    {
      opportunityId:"OPP-2001", category:"Pet Care Tools", productConcept:"Portable pet grooming vacuum",
      targetRegion:"United States", targetPersona:"Urban dog owners 25-40 on TikTok", platform:"TikTok Shop",
      priceBand:"$39–59", trendVelocity:"Rising", competitionIntensity:"Medium", estimatedMargin:0.58,
      complianceRisk:"Low", recommendedSupplierRegion:"Shenzhen",
      evidenceSummary:"Pet-grooming hashtag views up 38% QoQ; low-noise motor demos convert on short video.",
      recommendedFirstOrderQty:300, testBudget:1500, riskLevel:"Low", confidenceScore:0.82,
      demandSignal:"Strong & seasonal (shedding seasons)", contentViralityScore:0.79,
      cashConversionPotential:"High", supplierAvailability:"Abundant", complianceComplexity:"Low",
      moatNote:"Repeat-purchase filters/accessories build a consumables ledger over time."
    },
    {
      opportunityId:"OPP-2002", category:"Kitchen & Lifestyle", productConcept:"Foldable travel electric kettle",
      targetRegion:"Japan", targetPersona:"Frequent domestic travelers, 30-55", platform:"Amazon",
      priceBand:"¥4,500–6,800", trendVelocity:"Stable", competitionIntensity:"High", estimatedMargin:0.41,
      complianceRisk:"Medium", recommendedSupplierRegion:"Ningbo",
      evidenceSummary:"Compact travel appliances steady on Amazon JP; PSE expectation raises the bar.",
      recommendedFirstOrderQty:200, testBudget:1200, riskLevel:"Medium", confidenceScore:0.7,
      demandSignal:"Steady", contentViralityScore:0.42, cashConversionPotential:"Medium",
      supplierAvailability:"Moderate", complianceComplexity:"Medium (PSE mock + voltage labeling)",
      moatNote:"PSE-route knowledge becomes reusable Compliance Route template for JP small appliances."
    },
    {
      opportunityId:"OPP-2003", category:"Home Wellness", productConcept:"Ergonomic posture corrector",
      targetRegion:"Germany", targetPersona:"Desk workers & remote employees 28-45", platform:"Shopify",
      priceBand:"€24–39", trendVelocity:"Rising", competitionIntensity:"High", estimatedMargin:0.62,
      complianceRisk:"High", recommendedSupplierRegion:"Dongguan",
      evidenceSummary:"High demand but health-benefit claims are heavily regulated in DE/EU.",
      recommendedFirstOrderQty:250, testBudget:1400, riskLevel:"High", confidenceScore:0.6,
      demandSignal:"Strong but claim-sensitive", contentViralityScore:0.55, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"High (medical-adjacent claims)",
      moatNote:"Claim-rewrite library for wellness becomes defensible compliance IP."
    },
    {
      opportunityId:"OPP-2004", category:"Outdoor & Solar", productConcept:"Solar camping light",
      targetRegion:"Southeast Asia", targetPersona:"Outdoor & off-grid buyers 20-40", platform:"TikTok Shop",
      priceBand:"$12–22", trendVelocity:"Rising", competitionIntensity:"Medium", estimatedMargin:0.49,
      complianceRisk:"Low", recommendedSupplierRegion:"Foshan",
      evidenceSummary:"Outage-resilience and camping content drive impulse buys in SEA.",
      recommendedFirstOrderQty:500, testBudget:1000, riskLevel:"Low", confidenceScore:0.76,
      demandSignal:"Strong", contentViralityScore:0.7, cashConversionPotential:"High",
      supplierAvailability:"Abundant", complianceComplexity:"Low",
      moatNote:"Low ASP + high velocity = fast Trade Loop iterations feeding the demand graph."
    },
    {
      opportunityId:"OPP-2005", category:"Kitchen & Eco", productConcept:"Reusable silicone food bags",
      targetRegion:"France", targetPersona:"Eco-conscious households 28-50", platform:"Shopify",
      priceBand:"€14–24", trendVelocity:"Stable", competitionIntensity:"Medium", estimatedMargin:0.55,
      complianceRisk:"Medium", recommendedSupplierRegion:"Xiamen",
      evidenceSummary:"Food-contact silicone steady in FR; LFGB-style expectation present.",
      recommendedFirstOrderQty:400, testBudget:1100, riskLevel:"Medium", confidenceScore:0.68,
      demandSignal:"Steady", contentViralityScore:0.4, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"Medium (food-contact material)",
      moatNote:"Food-contact material profiles become a reusable MaterialProfile + compliance asset."
    },
    {
      opportunityId:"OPP-2006", category:"Beauty Tech", productConcept:"Compact beauty fridge",
      targetRegion:"United States", targetPersona:"Beauty creators & skincare fans 18-34", platform:"Instagram / creator commerce",
      priceBand:"$49–79", trendVelocity:"Rising", competitionIntensity:"Medium", estimatedMargin:0.52,
      complianceRisk:"Medium", recommendedSupplierRegion:"Guangzhou",
      evidenceSummary:"Aesthetic desk product; strong creator unboxing potential; FCC for the cooler module.",
      recommendedFirstOrderQty:250, testBudget:1600, riskLevel:"Medium", confidenceScore:0.72,
      demandSignal:"Strong (creator-led)", contentViralityScore:0.74, cashConversionPotential:"Medium",
      supplierAvailability:"Moderate", complianceComplexity:"Medium (electrical + FCC)",
      moatNote:"Creator-signal data + bundle accessories create recurring content-commerce loops."
    },
    {
      opportunityId:"OPP-2007", category:"Home Organization", productConcept:"Modular closet organizer",
      targetRegion:"United Kingdom", targetPersona:"Renters & small-flat dwellers 25-45", platform:"Amazon",
      priceBand:"£18–34", trendVelocity:"Stable", competitionIntensity:"High", estimatedMargin:0.47,
      complianceRisk:"Low", recommendedSupplierRegion:"Yiwu",
      evidenceSummary:"Evergreen organization demand; UKCA labeling expectation low-risk but present.",
      recommendedFirstOrderQty:350, testBudget:1000, riskLevel:"Low", confidenceScore:0.69,
      demandSignal:"Steady", contentViralityScore:0.38, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"Low (UKCA mock labeling)",
      moatNote:"Bundle/size-variant data improves SKU Passport variant intelligence."
    },
    {
      opportunityId:"OPP-2008", category:"Kids & Lunch", productConcept:"Kids lunch bento accessories",
      targetRegion:"Japan", targetPersona:"Parents of school-age children 30-45", platform:"Amazon",
      priceBand:"¥1,800–3,200", trendVelocity:"Stable", competitionIntensity:"Medium", estimatedMargin:0.5,
      complianceRisk:"High", recommendedSupplierRegion:"Hangzhou",
      evidenceSummary:"Recurring demand, but kids + food-contact raises safety scrutiny.",
      recommendedFirstOrderQty:300, testBudget:900, riskLevel:"High", confidenceScore:0.58,
      demandSignal:"Steady & recurring", contentViralityScore:0.36, cashConversionPotential:"Medium",
      supplierAvailability:"Moderate", complianceComplexity:"High (kids + food-contact)",
      moatNote:"Safety-route templates for kids categories are high-value, reusable compliance IP."
    },
    {
      opportunityId:"OPP-2009", category:"Recovery & Fitness", productConcept:"Lightweight massage gun",
      targetRegion:"Germany", targetPersona:"Fitness & recovery buyers 22-40", platform:"Shopify",
      priceBand:"€39–69", trendVelocity:"Stable", competitionIntensity:"High", estimatedMargin:0.5,
      complianceRisk:"High", recommendedSupplierRegion:"Shenzhen",
      evidenceSummary:"Saturated category; therapeutic claims are the main compliance trap in DE.",
      recommendedFirstOrderQty:200, testBudget:1500, riskLevel:"High", confidenceScore:0.55,
      demandSignal:"Strong but saturated", contentViralityScore:0.5, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"High (therapeutic claims + battery)",
      moatNote:"Battery/logistics + claim-rewrite knowledge compounds across electrical categories."
    },
    {
      opportunityId:"OPP-2010", category:"Seasonal Decor", productConcept:"Ramadan home decor lights",
      targetRegion:"Middle East", targetPersona:"Festive home decorators, families", platform:"TikTok Shop",
      priceBand:"$15–29", trendVelocity:"Seasonal spike", competitionIntensity:"Medium", estimatedMargin:0.6,
      complianceRisk:"Medium", recommendedSupplierRegion:"Guangzhou",
      evidenceSummary:"Sharp seasonal demand; timing & inventory cadence are decisive.",
      recommendedFirstOrderQty:600, testBudget:1300, riskLevel:"Medium", confidenceScore:0.66,
      demandSignal:"Sharp seasonal", contentViralityScore:0.68, cashConversionPotential:"High",
      supplierAvailability:"Abundant", complianceComplexity:"Medium (electrical + seasonal timing)",
      moatNote:"Seasonal demand-signal calendar becomes a defensible timing dataset."
    },
    {
      opportunityId:"OPP-2011", category:"Creator Merch", productConcept:"Creator merch starter kit",
      targetRegion:"United States", targetPersona:"Mid-tier creators 5k–200k followers", platform:"Shopify",
      priceBand:"$25–45", trendVelocity:"Rising", competitionIntensity:"Medium", estimatedMargin:0.54,
      complianceRisk:"Low", recommendedSupplierRegion:"Dongguan",
      evidenceSummary:"Creators want fast, low-MOQ merch; print + apparel sourcing is the wedge.",
      recommendedFirstOrderQty:150, testBudget:1200, riskLevel:"Low", confidenceScore:0.71,
      demandSignal:"Rising (creator economy)", contentViralityScore:0.72, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"Low (IP/likeness checks)",
      moatNote:"Creator-signal graph + low-MOQ supplier matches unlock a creator-commerce network."
    },
    {
      opportunityId:"OPP-2012", category:"Home Improvement", productConcept:"Foldable under-desk storage rack",
      targetRegion:"Germany", targetPersona:"Home-office workers 25-45", platform:"Shopify",
      priceBand:"€19–32", trendVelocity:"Stable", competitionIntensity:"Medium", estimatedMargin:0.48,
      complianceRisk:"Low", recommendedSupplierRegion:"Suzhou",
      evidenceSummary:"Steady WFH organization demand; low compliance complexity, good margins.",
      recommendedFirstOrderQty:300, testBudget:1000, riskLevel:"Low", confidenceScore:0.7,
      demandSignal:"Steady", contentViralityScore:0.4, cashConversionPotential:"Medium",
      supplierAvailability:"Abundant", complianceComplexity:"Low",
      moatNote:"Furniture-variant + dimensional data strengthens listing/logistics intelligence."
    },
  ];

  /* ---------- 2 & 18. Suppliers (5 per opp = 60) + SupplierTrustSignal ---------- */
  function hash(s){ let h=0; for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;} return Math.abs(h); }
  const factoryNames = ["Apex","Lumen","Hongtai","Sunrise","Greenfield","Vertex","Oceanic","Skyline","Pioneer","Crest"];
  function buildSuppliers(opp, idx){
    const out=[];
    for(let i=0;i<5;i++){
      const h=hash(opp.opportunityId+"-"+i);
      const region=REGIONS[(idx+i)%REGIONS.length];
      const trust= 0.92 - i*0.08 - (h%5)*0.01;
      const certCount=2+(h%3);
      const certs=[]; for(let c=0;c<certCount;c++) certs.push(CERTS[(h+c+idx)%CERTS.length]);
      const ontime= 0.97 - i*0.03 - (h%4)*0.01;
      out.push({
        supplierId:`SUP-${opp.opportunityId.slice(4)}-${i+1}`, opportunityId:opp.opportunityId,
        factoryName:`${factoryNames[(h+i)%factoryNames.length]} ${opp.category.split(" ")[0]} Mfg.`,
        factoryRegion:region, mainCategories:[opp.category, "OEM/ODM"], MOQ:[100,200,300,500,1000][(h+i)%5],
        priceRange:opp.priceBand, sampleLeadTime:`${3+(h%5)} days`, productionLeadTime:`${15+(h%15)} days`,
        certifications:Array.from(new Set(certs)), exportMarkets:["US","EU","JP","SEA"].slice(0,2+(h%3)),
        onTimeFulfillmentRate:+ontime.toFixed(2), returnDisputeRate:+(0.01+(i*0.012)).toFixed(3),
        platformRating:+(4.9-i*0.18).toFixed(1), yearsInBusiness:3+(h%18),
        recommendedReason:i===0?"Best trust score, fast sampling, strong export track record."
          :i===1?"Lower MOQ flexibility, good for first small-batch test."
          :i===2?"Lowest quote, but verify quality and dispute history first."
          :i===3?"Strong certifications, fits compliance-sensitive markets."
          :"Fast responder, suitable for iterative sampling.",
        riskFlags:i>=3?["Verify certifications before bulk order"]:i===2?["Higher dispute rate — request inspection"]:[],
        bestFor:i===0?"First serious order":i===1?"Low-MOQ testing":i===2?"Price negotiation":i===3?"Compliance-heavy markets":"Rapid iteration",
        paymentTermsMock:["30% deposit / 70% before shipment","TT 50/50","LC at sight (large orders)"][(h+i)%3],
        responseSpeedMock:`${1+(h%6)}h avg`, sampleAccuracyScore:+(0.95-i*0.05).toFixed(2),
        MOQFlexibilityScore:+(0.6+ (i===1?0.3:0) + (h%3)*0.05).toFixed(2),
        communicationQuality:+(0.9-i*0.06).toFixed(2), verificationStatus:i===0?"Verified (mock)":i<=2?"Partially verified (mock)":"Unverified (mock)",
        trustScore:+Math.max(0.4, trust).toFixed(2),
        trustScoreExplanation:"Weighted from on-time rate, dispute rate, sample accuracy, communication, certifications and (future) real trade signals.",
        lastTradeSignal:i===0?"Completed 2 mock sample orders, 0 disputes":i===1?"1 mock sample order, minor delay":"No recent mock signal",
        dataConsentStatus:i===0?"Consented to anonymized trade-signal sharing (mock)":"Not yet onboarded to Atlaz Supplier Portal (mock)",
      });
    }
    return out.sort((a,b)=>b.trustScore-a.trustScore);
  }
  const suppliersByOpp={}; opportunities.forEach((o,idx)=>{ suppliersByOpp[o.opportunityId]=buildSuppliers(o,idx); });
  const allSuppliers=Object.values(suppliersByOpp).flat();

  // 18. SupplierTrustSignal (20)
  const supplierTrustSignals=[];
  allSuppliers.slice(0,20).forEach((s,i)=>{
    supplierTrustSignals.push({
      signalId:`STS-${1000+i}`, supplierId:s.supplierId, signalType:["sample_order_completed","on_time_delivery","dispute_resolved","certification_uploaded","fast_response"][i%5],
      timestamp:`2026-0${1+(i%5)}-1${i%9}T0${i%6}:30:00Z`, weight:+(0.1+(i%5)*0.12).toFixed(2),
      direction:i%7===0?"negative":"positive", evidence:"Mock trade signal recorded by Atlaz ledger.",
      effectOnTrustScore:i%7===0?-0.03:+0.02,
    });
  });

  // 9. SupplierRating (20)
  const supplierRatings=[];
  allSuppliers.slice(0,20).forEach((s,i)=>{
    supplierRatings.push({
      ratingId:`SR-${2000+i}`, supplierId:s.supplierId, raterType:"merchant(mock)",
      quality:+(4.8-(i%5)*0.2).toFixed(1), communication:+(4.7-(i%4)*0.2).toFixed(1),
      sampleAccuracy:+(4.6-(i%6)*0.15).toFixed(1), onTime:+(4.7-(i%5)*0.2).toFixed(1),
      wouldReorder:i%4!==3, comment:["Smooth sampling, accurate to spec.","Good price, communication a bit slow.","Reliable for repeat orders.","Verify QC before scaling."][i%4],
      createdAt:`2026-0${1+(i%6)}-0${1+(i%8)}`,
    });
  });

  /* ---------- 26. MaterialProfile (per category, attached to passports) ---------- */
  function materialFor(opp){
    const map={
      "Pet Care Tools":{primaryMaterial:"ABS + low-noise BLDC motor",foodContact:false,electrical:true,battery:true,recyclable:"Partial"},
      "Kitchen & Lifestyle":{primaryMaterial:"Food-grade SS304 + PP",foodContact:true,electrical:true,battery:false,recyclable:"Partial"},
      "Home Wellness":{primaryMaterial:"Neoprene + nylon straps",foodContact:false,electrical:false,battery:false,recyclable:"Low"},
      "Outdoor & Solar":{primaryMaterial:"ABS housing + Li-ion + solar panel",foodContact:false,electrical:true,battery:true,recyclable:"Partial"},
      "Kitchen & Eco":{primaryMaterial:"Food-grade silicone",foodContact:true,electrical:false,battery:false,recyclable:"High"},
      "Beauty Tech":{primaryMaterial:"ABS + thermoelectric cooler",foodContact:false,electrical:true,battery:false,recyclable:"Low"},
      "Home Organization":{primaryMaterial:"PP + non-woven fabric",foodContact:false,electrical:false,battery:false,recyclable:"Partial"},
      "Kids & Lunch":{primaryMaterial:"Food-grade silicone + PP",foodContact:true,electrical:false,battery:false,recyclable:"High"},
      "Recovery & Fitness":{primaryMaterial:"ABS + Li-ion + percussion motor",foodContact:false,electrical:true,battery:true,recyclable:"Low"},
      "Seasonal Decor":{primaryMaterial:"PVC-free housing + LED + adapter",foodContact:false,electrical:true,battery:false,recyclable:"Partial"},
      "Creator Merch":{primaryMaterial:"Cotton/poly blend + print",foodContact:false,electrical:false,battery:false,recyclable:"Partial"},
      "Home Improvement":{primaryMaterial:"Carbon steel + powder coat",foodContact:false,electrical:false,battery:false,recyclable:"High"},
    };
    const base=map[opp.category]||{primaryMaterial:"Mixed",foodContact:false,electrical:false,battery:false,recyclable:"Partial"};
    return Object.assign({materialProfileId:`MAT-${opp.opportunityId.slice(4)}`, opportunityId:opp.opportunityId, restrictedSubstancesNote:"REACH/RoHS-style screening recommended (mock)."}, base);
  }

  /* ---------- 25. CertificationClaim (per passport) ---------- */
  function certClaimsFor(opp){
    const s=suppliersByOpp[opp.opportunityId][0];
    return s.certifications.map((c,i)=>({
      certificationClaimId:`CC-${opp.opportunityId.slice(4)}-${i}`, opportunityId:opp.opportunityId,
      certification:c, claimedBy:s.factoryName, status:i===0?"Document provided (unverified mock)":"Claimed (unverified mock)",
      verificationRequired:true, note:"Verify authenticity via accredited lab/issuer before real sales.",
    }));
  }

  /* ---------- 5 & 19. ComplianceCheck / ComplianceRoute (12) ---------- */
  function complianceFor(opp){
    const mat=materialFor(opp);
    const high= opp.complianceRisk==="High";
    const med= opp.complianceRisk==="Medium";
    const level= opp.complianceRisk;
    return {
      complianceCheckId:`CMP-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
      opportunityId:opp.opportunityId, targetCountry:opp.targetRegion, category:opp.category,
      materialProfile:mat.primaryMaterial, platform:opp.platform,
      certifications:suppliersByOpp[opp.opportunityId][0].certifications,
      certificationGaps: high?["Independent lab test report","Market-specific declaration of conformity"]:med?["Declaration of conformity"]:[],
      labelingRequirements:[ opp.targetRegion+" required markings (mock)", mat.electrical?"Voltage/plug & safety markings":"Material & care labeling" ],
      materialRisks: mat.foodContact?["Food-contact migration testing recommended"]:mat.battery?["Battery transport & safety compliance"]:["Standard material screening"],
      ageRestrictions: opp.category==="Kids & Lunch"?["Children's product safety rules apply (mock)"]:[],
      intellectualPropertyRisks: opp.category==="Creator Merch"?["Likeness/IP/trademark clearance required"]:["Avoid copying protected designs/trademarks"],
      advertisingBannedWords: high?["cure","treat","medical-grade","guaranteed results"]:med?["best","#1","guaranteed"]:["miracle","guaranteed"],
      platformRuleRisks:[ opp.platform+" category & claim policies (mock)" ],
      dataPrivacyRisks:["Collect only necessary customer data; honor regional privacy rules (mock)"],
      importRestrictionRisks: mat.battery?["Lithium battery import/shipping restrictions"]:[],
      customsRisk: med||high?"Medium — verify HS code & duties":"Low",
      claimRisk: high?"High — health/therapeutic claims restricted":med?"Medium — avoid superlatives":"Low",
      riskLevel:level,
      blockedReasons: level==="Blocked"?["Restricted/high-risk category for this MVP"]:[],
      recommendedRoute: high?"Reposition claims, obtain lab testing, consult compliance professionals before sale."
        :med?"Confirm material/declaration docs, fix labeling, avoid superlative claims."
        :"Standard route — confirm labeling and avoid banned words.",
      recommendedAction: high?"Rewrite high-risk claims & request certification verification":"Proceed with labeling & claim review",
      safeAlternativePositioning: high?"Describe comfort/support & lifestyle benefit, not medical outcomes."
        :"Focus on practical use, materials and design — avoid superlatives.",
      disclaimer:"This result is a general operational risk signal only and does not constitute legal advice. Before real sales, consult qualified compliance professionals, testing labs, platform rules, customs brokers, or local legal counsel.",
      lastUpdatedMock:"2026-05-20", requiresProfessionalReview: high,
      // route-engine specific
      forbiddenClaims: high?["medical/therapeutic cure claims","guaranteed health outcomes"]:["guaranteed results","#1 / best (unsubstantiated)"],
      professionalReviewRequired: high,
      requiredChecks: high?["Lab test","Declaration of conformity","Claim review"]:med?["Declaration of conformity","Labeling check"]:["Labeling check"],
    };
  }

  /* ---------- 6. ListingDraft (8) ---------- */
  function listingFor(opp){
    const aiLang= I18N.aiOutputLangFor(opp.targetRegion);
    return {
      schemaVersion:"1.0", listingId:`LST-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
      opportunityId:opp.opportunityId, targetRegion:opp.targetRegion, platform:opp.platform, language:aiLang,
      title:`${opp.productConcept} — compact, reliable, ${opp.targetRegion} ready`,
      bullets:[`Designed for ${opp.targetPersona}`,`Practical ${opp.category.toLowerCase()} solution`,"Tested mock spec & honest claims","Easy setup, everyday use"],
      description:`A ${opp.productConcept.toLowerCase()} built for ${opp.targetPersona}. Focused on practical value and honest, compliant messaging for ${opp.targetRegion}.`,
      seoKeywords:[opp.productConcept, opp.category, opp.targetRegion, opp.platform],
      tiktokScript:`Hook: the everyday problem → quick demo of the ${opp.productConcept.toLowerCase()} → result → soft CTA. No exaggerated claims.`,
      shopifySections:["Hero","Problem/solution","Spec table","Honest FAQ","Reviews(mock)","After-sales policy"],
      amazonSections:["Title","5 bullets","A+ description","Q&A","Backend keywords"],
      imagePrompts:[`Studio shot of ${opp.productConcept} on clean background`,`Lifestyle shot with ${opp.targetPersona}`,"Feature callout diagram"],
      faq:[{q:"What's in the box?",a:"Product, manual, accessories (mock)."},{q:"Return policy?",a:"See after-sales policy; returns within stated window."}],
      afterSalesPolicy:"Honest returns within the stated window; respond to customers within 24h (mock).",
      bannedWordRisks: complianceFor(opp).advertisingBannedWords,
      claimsToAvoid: complianceFor(opp).forbiddenClaims,
      complianceSafeAlternatives:["Describe practical benefit","Use measured, honest language"],
      aiShoppingAgentFacts:[`Category: ${opp.category}`,`Region: ${opp.targetRegion}`,`Price band: ${opp.priceBand}`,"Claims: conservative & compliant"],
      creatorBrief:`Show the ${opp.productConcept.toLowerCase()} solving a real problem in 15–30s; avoid medical/therapeutic claims; disclose partnership.`,
      abTestTitles:[`${opp.productConcept} that just works`,`The ${opp.productConcept.toLowerCase()} for ${opp.targetPersona.split(" ")[0]}s`],
      confidenceScore:opp.confidenceScore, riskLevel:opp.riskLevel,
      userActionRequired:["Review claims for compliance","Localize copy for target market"],
      nextStep:"Run Compliance Route Check before publishing.",
    };
  }
  const listingDrafts=opportunities.slice(0,8).map(listingFor);

  /* ---------- 19/trade. TradeOrder (8) + status flow ---------- */
  const TRADE_STEPS_FULL=["Opportunity Confirmed","SKU Passport Created","Supplier Inquiry","Quotation Received","Supplier Selected","Sample Requested","Sample Inspection","Sample Feedback","Small Batch Purchase","Production","Quality Inspection","Shipment","Customs Clearance","Delivered","After-sales","Growth Review","Reorder Decision"];
  const TRADE_STEPS_KEY=["Opportunity Confirmed","Supplier Inquiry","Quotation Received","Sample Requested","Sample Feedback","Small Batch Purchase","Shipment","Reorder Decision"];
  function buildOrder(opp, stepIdx){
    const sup=suppliersByOpp[opp.opportunityId][0];
    return {
      tradeOrderId:`ORD-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
      opportunityId:opp.opportunityId, supplierId:sup.supplierId, supplierName:sup.factoryName,
      product:opp.productConcept, currentStatus:TRADE_STEPS_KEY[stepIdx % TRADE_STEPS_KEY.length],
      quantity:opp.recommendedFirstOrderQty, unitCostUsd:+(opp.testBudget/opp.recommendedFirstOrderQty*0.5).toFixed(2),
      steps:TRADE_STEPS_KEY.map((s,i)=>({ name:s, done:i<=(stepIdx%TRADE_STEPS_KEY.length),
        aiGuidance:`Recommended next action for "${s}": confirm details and generate the required template.`,
        requiredDocs: s==="Supplier Inquiry"?["RFQ"]:s==="Quotation Received"?["Quote comparison"]:s==="Sample Requested"?["Sample Brief","PO (sample)"]:s==="Small Batch Purchase"?["Purchase Order","Commercial Invoice","Packing List"]:s==="Shipment"?["Logistics RFQ","Packing List"]:[],
        risk: s==="Small Batch Purchase"?"Cash locked until delivery":s==="Shipment"?"Customs/logistics delay":"Low",
        approvalRequired: s==="Sample Requested"||s==="Small Batch Purchase" })),
      createdAt:"2026-05-12", disclaimer:"Mock order — no real payment, logistics, or supplier contact is initiated.",
    };
  }
  const tradeOrders=opportunities.slice(0,8).map((o,i)=>buildOrder(o,i));

  /* ---------- 24. SampleInspectionResult (8) ---------- */
  const sampleInspections=opportunities.slice(0,8).map((opp,i)=>({
    inspectionId:`INS-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
    supplierId:suppliersByOpp[opp.opportunityId][0].supplierId,
    dimensionAccuracy:["Pass","Pass","Minor deviation","Pass"][i%4], functionTest:["Pass","Pass","Pass","Fail-retest"][i%4],
    appearance:["Good","Good","Acceptable","Good"][i%4], packaging:["OK","OK","Improve","OK"][i%4],
    overall:["Pass","Pass","Conditional","Pass"][i%4],
    defects: i%4===2?["Slight color mismatch vs spec"]:[], photosMock:["sample_front.jpg","sample_detail.jpg"],
    recommendation: i%4===2?"Request rework before bulk order":"Proceed to small-batch purchase",
    inspectedAt:"2026-05-18",
  }));

  /* ---------- 7 & 20. CashflowEvent / CashConversionScore (8) ---------- */
  function calcCash(inp){
    const intlPerUnit=inp.internationalFreight/Math.max(1,inp.qty);
    const domPerUnit=inp.domesticFreight/Math.max(1,inp.qty);
    const duty=inp.unitCost*inp.dutyRate;
    const landed=+(inp.unitCost+intlPerUnit+domPerUnit+duty+inp.sampleCost/Math.max(1,inp.qty)+inp.packagingCost+inp.complianceReserveCost/Math.max(1,inp.qty)).toFixed(2);
    const platFee=inp.targetPrice*inp.platformFee, payFee=inp.targetPrice*inp.paymentFee;
    const gross=+(inp.targetPrice-landed).toFixed(2);
    const net=+(gross-platFee-payFee-inp.adBudgetPerUnit-(inp.targetPrice*inp.refundRate)-inp.returnHandlingCost*inp.refundRate).toFixed(2);
    const grossR=+(gross/inp.targetPrice).toFixed(3), netR=+(net/inp.targetPrice).toFixed(3);
    const breakeven= net>0?Math.ceil((inp.unitCost*inp.qty)/net):Infinity;
    const cashLocked=+(landed*inp.qty).toFixed(0);
    const recoveryDays= inp.inventoryDays+inp.paymentTerms;
    let score= 50 + netR*120 - inp.refundRate*60 - (recoveryDays/120)*20 - (inp.dutyRate*40) - (inp.adBudgetPerUnit/Math.max(1,inp.targetPrice))*30;
    score=Math.max(0,Math.min(100,Math.round(score)));
    let decision = net<=0?"stop": score>=70?"buy": score>=50?"negotiate":"test_smaller";
    return {
      landedUnitCost:landed, grossMargin:gross, grossMarginRate:grossR, netMargin:net, netMarginRate:netR,
      breakEvenUnits: breakeven===Infinity?"n/a":breakeven, cashLocked, cashRecoveryDays:recoveryDays,
      inventoryPressure: inp.inventoryDays>45?"High":inp.inventoryDays>25?"Medium":"Low",
      adRisk: inp.adBudgetPerUnit/inp.targetPrice>0.25?"High":"Medium",
      fxRisk: inp.fxRate!==1?"Medium (FX exposure)":"Low", dutyRisk: inp.dutyRate>0.08?"High":inp.dutyRate>0?"Medium":"Low",
      returnRisk: inp.refundRate>0.08?"High":inp.refundRate>0.04?"Medium":"Low",
      paymentTermRisk: inp.paymentTerms>45?"High":inp.paymentTerms>20?"Medium":"Low",
      cashConversionScore:score, recommendedFirstOrderQty: Math.max(50,Math.round(inp.qty*(score>=70?1:score>=50?0.7:0.4))),
      decision, explanation: decision==="buy"?"Healthy net margin and acceptable cash recovery — first order is reasonable."
        :decision==="negotiate"?"Margin is workable but tight — negotiate unit cost / MOQ before committing."
        :decision==="test_smaller"?"Cash conversion is weak — test with a smaller quantity first."
        :"Net margin is non-positive — do not buy under these assumptions.",
      recommendedNextStep: decision==="buy"?"Create a sample order, then place the first test order."
        :decision==="negotiate"?"Request a supplier counter-quote targeting a lower unit cost."
        :decision==="test_smaller"?"Reduce first-order quantity and re-run the Cash Conversion Score."
        :"Stop and re-evaluate the opportunity or switch supplier/market.",
      disclaimer:"Estimates only. Atlaz provides no loan commitment and this is not investment, tax, lending, accounting, or financing advice.",
    };
  }
  function cashInputsFor(opp){
    // Unit cost is derived from target price and the product's gross margin. A small competition
    // factor nudges cost up for crowded categories so the 12 curated opportunities realistically
    // span the FULL decision space (buy / negotiate / test_smaller / stop).
    const price=parsePrice(opp.priceBand);
    const compBump=opp.competitionIntensity==="High"?0.06:opp.competitionIntensity==="Medium"?0.025:0;
    const unitCost=+Math.max(2,(price*(1-opp.estimatedMargin)+compBump*price)).toFixed(2);
    // Test-stage ad spend ~9–13% of price (higher for crowded categories), not a full CAC.
    const adShare=opp.competitionIntensity==="High"?0.13:opp.competitionIntensity==="Medium"?0.11:0.09;
    return { unitCost, MOQ:suppliersByOpp[opp.opportunityId][0].MOQ,
      qty:opp.recommendedFirstOrderQty, domesticFreight:120, internationalFreight:opp.recommendedFirstOrderQty*1.1,
      dutyRate:opp.targetRegion==="Germany"||opp.targetRegion==="France"?0.05:opp.targetRegion==="Japan"?0.03:0.02,
      platformFee:opp.platform==="Amazon"?0.15:opp.platform.includes("TikTok")?0.08:0.029,
      paymentFee:0.03, adBudgetPerUnit:+(price*adShare).toFixed(2),
      targetPrice:price, refundRate:opp.complianceRisk==="High"?0.07:0.035,
      returnHandlingCost:3.5, fxRate:1, paymentTerms:30, inventoryDays:opp.demandSignal.includes("Sharp")?20:35,
      sampleCost:60, packagingCost:0.6, complianceReserveCost:opp.complianceRisk==="High"?300:90 };
  }
  // Price bands may be quoted in local currency (e.g. "¥4,500–6,800", "€24–39", "£18–34").
  // parsePrice ALWAYS returns a USD value so the Cash Conversion engine is currency-consistent.
  function parsePrice(band){
    const s=String(band);
    const m=s.match(/[\d,]+(\.\d+)?/g); if(!m) return 29;
    const nums=m.map(x=>parseFloat(x.replace(/,/g,"")));
    const avgLocal=(nums[0]+(nums[1]||nums[0]))/2;
    // detect quote currency from symbol; ¥ is JPY here (CNY bands are not used in opps)
    const toUsd = s.indexOf("¥")>=0 ? (1/152) : s.indexOf("€")>=0 ? (1/0.92) : s.indexOf("£")>=0 ? (1/0.79) : 1;
    return +(avgLocal*toUsd).toFixed(2);
  }
  const cashflowEvents=opportunities.slice(0,8).map((opp,i)=>{
    const inputs=cashInputsFor(opp); const out=calcCash(inputs);
    return { cashflowEventId:`CF-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
      opportunityId:opp.opportunityId, inputs, output:out, createdAt:"2026-05-15" };
  });
  const cashConversionScores=cashflowEvents.map(cf=>({ scoreId:`CCS-${cf.opportunityId.slice(4)}`, skuPassportId:cf.skuPassportId,
    score:cf.output.cashConversionScore, decision:cf.output.decision, explanation:cf.output.explanation }));

  /* ---------- 8. GrowthExperiment (8) ---------- */
  const growthExperiments=opportunities.slice(0,8).map((opp,i)=>({
    growthExperimentId:`GRW-${opp.opportunityId.slice(4)}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`,
    opportunityId:opp.opportunityId, plan7:["Post 2 short videos/day","$30/day ads test","Collect first comments"],
    plan14:["Double down on best hook","Add 1 creator collab","A/B 2 titles"], plan30:["Scale winning creative","Prep reorder","Expand to 2nd platform"],
    metrics:{ views:[18000,42000,9000,60000][i%4], clicks:[900,2100,300,3600][i%4],
      CTR:[0.05,0.05,0.033,0.06][i%4], conversionRate:[0.022,0.031,0.012,0.04][i%4],
      orders:[20,65,4,144][i%4], refundRate:[0.04,0.03,0.12,0.05][i%4], CAC:[9.5,7.2,22,6.1][i%4], ROAS:[2.4,3.1,0.8,3.6][i%4],
      commentsSummary:["Positive on utility","Loves the design","Confused about claims","High intent to buy"][i%4],
      creatorFeedback:["Easy to demo","Great visual hook","Hard to explain benefit","Converts well"][i%4],
      customerPainPoints:["Price","Shipping time","Unclear use","None major"][i%4],
      positiveSignals:["Saves repeat","Aesthetic","—","Strong ROAS"][i%4], negativeSignals:["—","—","High refund","—"][i%4],
      inventoryRemaining:[120,30,260,8][i%4] },
    recommendedDecision:["reorder","reorder","stop","reorder"][i%4], humanFinalDecision:"pending", nextExperiment:"Test new creative angle / price point",
    createdAt:"2026-05-22",
  }));

  /* ---------- 16. SkuPassport (12) ---------- */
  function buildPassport(opp){
    const sup=suppliersByOpp[opp.opportunityId];
    return {
      schemaVersion:"1.0", skuPassportId:`SKU-${opp.opportunityId.slice(4)}`, opportunityId:opp.opportunityId,
      productConcept:opp.productConcept, category:opp.category, targetMarket:opp.targetRegion, targetPlatform:opp.platform,
      targetPersona:opp.targetPersona, priceBand:opp.priceBand, selectedOpportunity:opp.opportunityId,
      supplierCandidates:sup.map(s=>s.supplierId), selectedSupplier:sup[0].supplierId,
      materialProfile:materialFor(opp), certificationClaims:certClaimsFor(opp), complianceRoute:`CMP-${opp.opportunityId.slice(4)}`,
      listingAssets:`LST-${opp.opportunityId.slice(4)}`, landedCostModel:`CF-${opp.opportunityId.slice(4)}`,
      cashConversionScore:`CCS-${opp.opportunityId.slice(4)}`, tradeOrderTimeline:`ORD-${opp.opportunityId.slice(4)}`,
      growthExperiments:[`GRW-${opp.opportunityId.slice(4)}`], supplierTrustSnapshot:{ supplierId:sup[0].supplierId, trustScore:sup[0].trustScore },
      aiDecisionHistory:[], riskSummary:{ complianceRisk:opp.complianceRisk, cashRisk:opp.cashConversionPotential==="High"?"Low":"Medium" },
      tradeLoopLedger:`LEDGER-${opp.opportunityId.slice(4)}`, pendingAgentActions:[],
      createdAt:"2026-05-10", status:"active",
    };
  }
  const skuPassports=opportunities.map(buildPassport);

  /* ---------- 17. TradeLoopLedgerEvent (50) ---------- */
  const LE_TYPES=["opportunity_discovered","opportunity_analyzed","sku_passport_created","suppliers_matched","supplier_selected","rfq_generated","sample_brief_generated","compliance_route_checked","listing_generated","sample_order_created","cash_conversion_calculated","growth_playbook_created","experiment_result_recorded","ai_decision_generated","human_decision_confirmed"];
  const ledgerEvents=[];
  let leCount=0;
  opportunities.slice(0,5).forEach((opp,oi)=>{
    LE_TYPES.forEach((type,ti)=>{
      if(leCount>=50) return;
      const actor= type.startsWith("human")?"user": type.startsWith("ai")||type.includes("generated")||type.includes("analyzed")||type.includes("matched")||type.includes("calculated")||type.includes("checked")?"ai": type.includes("supplier")?"supplier":"system";
      ledgerEvents.push({
        eventId:`LE-${3000+leCount}`, skuPassportId:`SKU-${opp.opportunityId.slice(4)}`, eventType:type,
        timestamp:`2026-05-${(10+oi)}T${String(8+ti%12).padStart(2,"0")}:0${ti%6}:00Z`,
        actorType:actor, source:actor==="ai"?"TradeAiService":actor==="supplier"?"SupplierTrustGraph(mock)":actor==="user"?"User action":"System",
        confidenceScore: actor==="ai"?+(0.6+(ti%4)*0.1).toFixed(2):1,
        riskLevel: type.includes("compliance")?opp.complianceRisk:"Low",
        userApprovalRequired: ["rfq_generated","sample_order_created","ai_decision_generated"].includes(type),
        evidence:`Auto-recorded event for ${opp.productConcept}.`,
        nextAction: ti<LE_TYPES.length-1?LE_TYPES[ti+1]:"monitor",
        auditNote:`Ledger entry ${leCount+1} (mock).`,
      });
      leCount++;
    });
  });

  /* ---------- 21 & 22. AgentAction (12) + HumanApprovalRecord ---------- */
  const AGENT_TYPES=[
    {type:"CREATE_RFQ",risk:"Medium",approval:true,irrev:false,api:"supplierApi"},
    {type:"REQUEST_SUPPLIER_COUNTERQUOTE",risk:"Low",approval:false,irrev:false,api:"supplierApi"},
    {type:"GENERATE_SAMPLE_BRIEF",risk:"Low",approval:false,irrev:false,api:null},
    {type:"REQUEST_CERTIFICATE_VERIFICATION",risk:"Medium",approval:true,irrev:false,api:"certificationApi"},
    {type:"BLOCK_HIGH_RISK_CLAIM",risk:"Low",approval:false,irrev:false,api:null},
    {type:"GENERATE_LISTING",risk:"Medium",approval:true,irrev:false,api:"marketplaceListingApi"},
    {type:"CALCULATE_LANDED_COST",risk:"Low",approval:false,irrev:false,api:"currencyRateTool"},
    {type:"CREATE_SAMPLE_ORDER",risk:"High",approval:true,irrev:true,api:"paymentApi"},
    {type:"GENERATE_QC_CHECKLIST",risk:"Low",approval:false,irrev:false,api:"inspectionApi"},
    {type:"CREATE_GROWTH_EXPERIMENT",risk:"Low",approval:false,irrev:false,api:"adPlatformApi"},
    {type:"EVALUATE_REORDER",risk:"Medium",approval:true,irrev:false,api:null},
    {type:"FINANCE_ELIGIBILITY_PRECHECK",risk:"High",approval:true,irrev:false,api:"financeApi"},
  ];
  const agentActions=AGENT_TYPES.map((a,i)=>({
    actionId:`ACT-${4000+i}`, actionType:a.type, skuPassportId:`SKU-200${(i%9)+1}`,
    title:a.type.replace(/_/g," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),
    description:`Proposed agent action: ${a.type}. Atlaz prepares the action but does not execute it without your approval where required.`,
    payload:{ note:"Mock payload — no real external call is made." }, riskLevel:a.risk, confidenceScore:+(0.6+(i%4)*0.1).toFixed(2),
    requiresUserApproval:a.approval, irreversible:a.irrev, externalApiRequired:!!a.api, mockMode:true,
    nextStep:"Review the payload, then approve or reject.", rollbackOption:a.irrev?"Not reversible after execution":"Can be reverted",
    auditLogPreview:`[mock] ${a.type} prepared at 2026-05-23; pending ${a.approval?"approval":"auto-run"}.`,
    disclaimer:"High-risk actions require human review and approval. No real external action is performed in this MVP.",
  }));
  const humanApprovalRecords=agentActions.filter(a=>a.requiresUserApproval).slice(0,6).map((a,i)=>({
    approvalId:`APR-${5000+i}`, actionId:a.actionId, decision:i%3===0?"approved":i%3===1?"pending":"rejected",
    decidedBy:"merchant(mock)", decidedAt:i%3===1?null:"2026-05-24", note:"Mock human approval record.",
  }));

  /* ---------- 27 & 28. MarketDemandSignal (12) + CreatorSignal ---------- */
  const marketDemandSignals=opportunities.map((opp,i)=>({
    signalId:`MDS-${6000+i}`, opportunityId:opp.opportunityId, market:opp.targetRegion,
    trendVelocity:opp.trendVelocity, searchGrowthMock:`${10+(i*3)%40}% QoQ`, socialMentionsMock:`${5+(i*7)%50}k`,
    seasonalityNote:opp.demandSignal, confidence:opp.confidenceScore,
  }));
  const creatorSignals=opportunities.slice(0,6).map((opp,i)=>({
    signalId:`CRS-${7000+i}`, opportunityId:opp.opportunityId, platform:opp.platform,
    creatorTier:["micro","mid","mid","macro","micro","mid"][i], engagementRateMock:+(0.04+(i%4)*0.01).toFixed(3),
    contentAngle:["before/after","unboxing","day-in-life","problem/solution","tutorial","review"][i%6],
    fitScore:+(0.6+(i%4)*0.1).toFixed(2),
  }));

  /* ---------- 23. QuoteComparison (per opp on demand) ---------- */
  function quoteComparisonFor(opp){
    return suppliersByOpp[opp.opportunityId].map(s=>({
      supplierId:s.supplierId, factory:s.factoryName, unitPrice:+(parsePrice(opp.priceBand)*(0.28+ (s.trustScore<0.7?0.05:0))).toFixed(2),
      MOQ:s.MOQ, sampleLeadTime:s.sampleLeadTime, productionLeadTime:s.productionLeadTime,
      trustScore:s.trustScore, paymentTerms:s.paymentTermsMock, recommendation:s.trustScore>0.8?"Preferred":s.trustScore>0.65?"Consider":"Verify first",
    }));
  }

  /* ---------- 29. ReorderDecision (derived) ---------- */
  const reorderDecisions=growthExperiments.map((g,i)=>({
    decisionId:`RD-${8000+i}`, skuPassportId:g.skuPassportId, aiRecommendation:g.recommendedDecision,
    reasoning:g.recommendedDecision==="reorder"?"ROAS and conversion support scaling; prep supplier restock."
      :g.recommendedDecision==="stop"?"High refund rate and weak ROAS — stop and reallocate budget.":"Iterate creative before scaling.",
    humanDecision:"pending", confidence:+(0.6+(i%4)*0.1).toFixed(2),
  }));

  /* ---------- 30. DataRightConsent ---------- */
  const dataRightConsents=[
    { consentId:"DRC-1", scope:"merchant_preferences", granted:true, purpose:"Personalize opportunities & settings", revocable:true },
    { consentId:"DRC-2", scope:"trade_loop_events", granted:true, purpose:"Build SKU Passport & ledger", revocable:true },
    { consentId:"DRC-3", scope:"aggregate_trade_graph", granted:false, purpose:"Improve network trust signals (opt-in)", revocable:true },
  ];

  /* ---------- 3 & 4. Inquiry / TradeDocument templates ---------- */
  const documentTemplates=[
    { templateId:"DOC-PO", name:"Purchase Order", fields:["PO#","Supplier","Product","Qty","Unit price","Terms","Delivery date"] },
    { templateId:"DOC-CI", name:"Commercial Invoice", fields:["Invoice#","Seller","Buyer","HS code","Value","Incoterms"] },
    { templateId:"DOC-PL", name:"Packing List", fields:["Cartons","Net/Gross weight","Dimensions","Marks"] },
    { templateId:"DOC-QC", name:"Quality Inspection Checklist", fields:["Dimension","Function","Appearance","Packaging","AQL(mock)"] },
    { templateId:"DOC-LRFQ", name:"Logistics RFQ", fields:["Origin","Destination","Weight","Volume","Incoterms","Mode"] },
    { templateId:"DOC-SB", name:"Sample Brief", fields:["Spec","Material","Color","Tolerances","Deadline"] },
    { templateId:"DOC-FU", name:"Supplier Follow-up Message", fields:["Context","Ask","Deadline","Tone"] },
    { templateId:"DOC-AS", name:"After-sales Handling Template", fields:["Issue","Resolution","Refund/Replace","Timeline"] },
    { templateId:"DOC-CV", name:"Certificate Verification Request", fields:["Cert type","Issuer","Cert#","Verification method"] },
    { templateId:"DOC-RN", name:"Reorder Negotiation Message", fields:["Volume","Target price","Terms","Timeline"] },
  ];

  /* ---------- 13. CurrencyRateMock ---------- */
  const currencyRates=I18N.CURRENCIES.map(c=>({ base:"USD", quote:c.code, rate:c.rate, asOf:"2026-05-25(mock)" }));

  /* ---------- 14. MarketPersona (6) ---------- */
  const marketPersonas=[
    { personaId:"PER-1", name:"US TikTok impulse buyer", region:"United States", channel:"TikTok Shop", priceSensitivity:"Medium", trigger:"Short-video demo" },
    { personaId:"PER-2", name:"Japan careful Amazon shopper", region:"Japan", channel:"Amazon", priceSensitivity:"Medium-High", trigger:"Specs, reviews, safety" },
    { personaId:"PER-3", name:"Germany value & compliance buyer", region:"Germany", channel:"Shopify", priceSensitivity:"High", trigger:"Quality & honest claims" },
    { personaId:"PER-4", name:"SEA mobile-first deal seeker", region:"Southeast Asia", channel:"TikTok Shop", priceSensitivity:"High", trigger:"Price & utility" },
    { personaId:"PER-5", name:"France eco-conscious household", region:"France", channel:"Shopify", priceSensitivity:"Medium", trigger:"Sustainability & design" },
    { personaId:"PER-6", name:"US beauty creator audience", region:"United States", channel:"Creator commerce", priceSensitivity:"Low-Medium", trigger:"Aesthetics & creator trust" },
  ];

  /* ---------- 15. PlatformRuleMock (4) ---------- */
  const platformRules=[
    { platform:"TikTok Shop", rule:"No exaggerated health/medical claims; disclose paid partnerships; category restrictions apply (mock)." },
    { platform:"Amazon", rule:"Accurate titles; restricted-product policies; required compliance docs per category (mock)." },
    { platform:"Shopify", rule:"Merchant-owned compliance; payment & ad-platform policies apply (mock)." },
    { platform:"Instagram / creator commerce", rule:"Disclose partnerships; claim & IP rules apply (mock)." },
  ];

  /* ---------- Plans (4) + revenue streams (12) ---------- */
  const plans=[
    { id:"free", name:"Free", priceUsd:0, features:["5 opportunity analyses","2 supplier matches","3 listing drafts","Basic compliance risk","Basic margin calc","1 SKU Passport","Basic Trade Loop Ledger"] },
    { id:"pro", name:"Pro", priceUsd:49, features:["More market data","Bulk listings","Supplier library","Supplier Trust Graph","Compliance templates","SKU Passport export","Team collaboration","More growth experiments","File export","Multilingual workspace","Cash Conversion Score","AI action approvals"] },
    { id:"enterprise", name:"Enterprise", priceUsd:0, priceNote:"Custom", features:["Factory CRM","Order management","QC collaboration","API access","Finance service interface","Multi-member roles","Custom compliance rules","Dedicated supply-chain service","Supplier portal","Compliance rule workspace","Risk dashboard","Data warehouse export","Custom trade graph"] },
  ];
  const revenueStreams=["RaaS subscription","Transaction take-rate","Supply-chain service fee","Compliance service fee","Logistics service fee","Finance referral","Ad tools","Data analytics service","Supplier verification fee","Trade intelligence API","Factory SaaS","SKU Passport export / certification workflow fee"];

  /* ---------- Mock API registry metadata (15 tools mirror) ---------- */
  const userPreferenceDefault={ identity:"TikTok Shop seller", market:"United States", platform:"TikTok Shop", language:"en", currency:"USD", plan:"free", theme:"light", onboarded:false };

  return {
    REGIONS, CERTS, opportunities, suppliersByOpp, allSuppliers, supplierTrustSignals, supplierRatings,
    skuPassports, listingDrafts, tradeOrders, sampleInspections, cashflowEvents, cashConversionScores,
    growthExperiments, ledgerEvents, agentActions, humanApprovalRecords, marketDemandSignals, creatorSignals,
    reorderDecisions, dataRightConsents, documentTemplates, currencyRates, marketPersonas, platformRules,
    plans, revenueStreams, userPreferenceDefault, TRADE_STEPS_FULL, TRADE_STEPS_KEY,
    // helpers
    getOpportunity:(id)=>opportunities.find(o=>o.opportunityId===id),
    getSuppliers:(id)=>suppliersByOpp[id]||[],
    getSupplier:(sid)=>allSuppliers.find(s=>s.supplierId===sid),
    getPassport:(id)=>skuPassports.find(p=>p.opportunityId===id||p.skuPassportId===id),
    getCompliance:(opp)=>complianceFor(opp), getListing:(opp)=>listingFor(opp),
    getCashInputs:(opp)=>cashInputsFor(opp), calcCash, materialFor, certClaimsFor,
    quoteComparisonFor, getOrder:(id)=>tradeOrders.find(o=>o.opportunityId===id||o.tradeOrderId===id),
    getGrowth:(id)=>growthExperiments.find(g=>g.opportunityId===id||g.skuPassportId===id),
    getLedgerFor:(skuId)=>ledgerEvents.filter(e=>e.skuPassportId===skuId), parsePrice,
  };
})();
if (typeof window !== "undefined") window.DB = DB;
