/* ============================================================================
 * Atlaz v4 · i18n + currency  (I18N)
 *
 * - 7 UI languages with REAL-TIME switching (no reload): en, zh, es, fr, de, ja, ar
 * - Arabic (ar) drives RTL (document dir + .rtl class)
 * - 10 currencies: USD CNY EUR GBP JPY CAD AUD AED MXN BRL (mock FX)
 * - UI language and AI OUTPUT language are SEPARATE (aiOutputLangFor / setAiLang)
 *
 * Global: I18N  (also window.I18N)
 * ==========================================================================*/
const I18N = (() => {
  const LANGS = ["en","zh","es","fr","de","ja","ar"];
  const RTL = ["ar"];
  const LANG_LABEL = {en:"English",zh:"中文",es:"Español",fr:"Français",de:"Deutsch",ja:"日本語",ar:"العربية"};

  /* ---- currency formatting (uses FxService from data.js when present) ---- */
  const CCY = {
    USD:{sym:"$",dp:2}, CNY:{sym:"¥",dp:2}, EUR:{sym:"€",dp:2}, GBP:{sym:"£",dp:2},
    JPY:{sym:"¥",dp:0}, CAD:{sym:"C$",dp:2}, AUD:{sym:"A$",dp:2}, AED:{sym:"د.إ",dp:2},
    MXN:{sym:"MX$",dp:2}, BRL:{sym:"R$",dp:2}
  };
  const CCY_LIST = Object.keys(CCY);

  /* ---- translation dictionary (keys grouped; every screen covered) ---- */
  const T = {
    en:{
      app_name:"Atlaz", tagline:"The AI trade execution network for small global merchants",
      nav_command:"Command Center", nav_radar:"Opportunity Radar", nav_dealrooms:"Deal Rooms",
      nav_suppliers:"Supplier Match", nav_compliance:"Compliance", nav_listing:"Listing Studio",
      nav_flow:"Trade Flow", nav_cash:"Cash & Margin", nav_growth:"Growth", nav_factory:"Factory Portal",
      // command center
      cc_title:"Trade Command Center", cc_q1:"Which product should I work on today?",
      cc_q2:"Why is it worth testing now?", cc_q3:"Which suppliers are safest?",
      cc_q4:"Will it break rules or lose money?", cc_q5:"What is my next action?",
      cc_today_action:"Today's recommended action", cc_funnel:"Opportunity funnel",
      cc_risk_radar:"Risk radar", cc_active_rooms:"Active Deal Rooms", cc_pending_actions:"Agent actions needing your approval",
      cc_quickstart:"One-click starts", cc_identity:"Your trader profile",
      // funnel stages
      f_discover:"Discover", f_supplier:"Suppliers", f_compliance:"Compliance", f_sample:"Sample",
      f_smallbatch:"Small batch", f_content:"Content test", f_decision:"Reorder / Stop",
      // risks
      risk_cash:"Cashflow risk", risk_compliance:"Compliance risk", risk_supplier:"Supplier risk",
      risk_platform:"Platform risk", risk_ad:"Ad risk",
      // generic
      next_best_action:"Next best action", why:"Why", evidence:"Evidence", risks:"Risks",
      next_steps:"Next steps", copyable:"Copyable file", confidence:"Confidence",
      open_dealroom:"Open Deal Room", create_passport:"Create SKU Passport", find_suppliers:"Find suppliers",
      run_compliance:"Run compliance route", estimate_cash:"Estimate cash conversion", generate_content:"Generate content kit",
      // states
      loading:"Loading…", empty:"Nothing here yet", error:"Something went wrong",
      blocked_risk:"Blocked — high risk", permission_denied:"Permission denied",
      approval_required:"Human approval required", approve:"Approve", reject:"Reject",
      retry:"Retry", upgrade:"Upgrade plan",
      // deal room
      dr_thesis:"Thesis", dr_supplier:"Supplier Match", dr_compliance:"Compliance",
      dr_econ:"Unit Economics", dr_sample:"Sample & RFQ", dr_listing:"Listing Studio",
      dr_growth:"Content Growth", dr_order:"Trade Order", dr_ledger:"Ledger", dr_memo:"Decision Memo",
      dr_stage:"Current stage", dr_overall_risk:"Overall risk", dr_cash_score:"Cash conversion",
      dr_trust:"Supplier trust", dr_ai_conf:"AI confidence",
      // compliance
      comp_go:"GO", comp_go_cond:"GO with conditions", comp_nogo:"NO-GO until certified",
      comp_disclaimer:"This result is a general operational risk signal only and does not constitute legal advice. Before real sales, consult qualified compliance professionals, testing labs, platform rules, customs brokers, or local legal counsel.",
      // cash
      cash_buy:"Buy", cash_negotiate:"Negotiate", cash_test_smaller:"Test smaller", cash_stop:"Stop",
      cash_recommendation:"Recommendation",
      // growth decisions
      g_scale:"Scale order", g_modify:"Modify product", g_lower:"Lower price",
      g_change_market:"Change market", g_change_angle:"Change angle", g_stop:"Stop product",
      // misc labels
      ui_language:"UI language", ai_language:"AI output language", currency:"Currency",
      mock_notice:"All data is mock. Production APIs are reserved, not connected.",
      copy:"Copy", copied:"Copied!", json_workorder:"AI work-order (JSON)"
    }
  };

  /* For brevity & reliability, non-English languages map labels via a compact
     overlay; any missing key falls back to English so the UI never breaks. */
  const OVERLAY = {
    zh:{tagline:"面向全球小商家的 AI 贸易执行网络",nav_command:"指挥中心",nav_radar:"机会雷达",nav_dealrooms:"交易室",nav_suppliers:"供应商匹配",nav_compliance:"合规",nav_listing:"Listing 工坊",nav_flow:"贸易流程",nav_cash:"现金与毛利",nav_growth:"增长",nav_factory:"工厂端",cc_title:"贸易指挥中心",cc_q1:"今天我该做哪个商品？",cc_q2:"为什么现在值得测？",cc_q3:"找哪几个供应商最稳？",cc_q4:"会不会违规或亏钱？",cc_q5:"我的下一步是什么？",cc_today_action:"今日推荐动作",cc_funnel:"机会漏斗",cc_risk_radar:"风险雷达",cc_active_rooms:"进行中的交易室",cc_pending_actions:"需要你审批的 Agent 动作",cc_quickstart:"一键开始",cc_identity:"你的贸易身份",f_discover:"发现",f_supplier:"供应商",f_compliance:"合规",f_sample:"样品",f_smallbatch:"小单",f_content:"内容测试",f_decision:"加单/停止",risk_cash:"现金流风险",risk_compliance:"合规风险",risk_supplier:"供应商风险",risk_platform:"平台风险",risk_ad:"广告风险",next_best_action:"下一步最佳动作",why:"为什么",evidence:"证据",risks:"风险",next_steps:"下一步",copyable:"可复制文件",confidence:"置信度",open_dealroom:"打开交易室",create_passport:"创建 SKU Passport",find_suppliers:"匹配供应商",run_compliance:"运行合规路线",estimate_cash:"估算现金转换",generate_content:"生成内容包",loading:"加载中…",empty:"暂无内容",error:"出错了",blocked_risk:"已拦截 — 高风险",permission_denied:"权限不足",approval_required:"需要人工审批",approve:"批准",reject:"拒绝",retry:"重试",upgrade:"升级套餐",dr_thesis:"论点",dr_supplier:"供应商匹配",dr_compliance:"合规",dr_econ:"单位经济",dr_sample:"样品与询价",dr_listing:"Listing 工坊",dr_growth:"内容增长",dr_order:"贸易订单",dr_ledger:"账本",dr_memo:"决策备忘",dr_stage:"当前阶段",dr_overall_risk:"总风险",dr_cash_score:"现金转换",dr_trust:"供应商信任",dr_ai_conf:"AI 置信度",comp_go:"放行",comp_go_cond:"有条件放行",comp_nogo:"未认证前停止",comp_disclaimer:"此结果仅为风险提示，不构成法律建议。正式销售前应咨询目标市场的专业合规机构、检测机构、平台规则、清关行或当地律师。",cash_buy:"采购",cash_negotiate:"砍价",cash_test_smaller:"小批量测试",cash_stop:"停止",cash_recommendation:"建议",g_scale:"加单",g_modify:"改款",g_lower:"降价",g_change_market:"换市场",g_change_angle:"换卖点",g_stop:"停止商品",ui_language:"界面语言",ai_language:"AI 输出语言",currency:"币种",mock_notice:"全部为 mock 数据，生产 API 已预留但未接入。",copy:"复制",copied:"已复制！",json_workorder:"AI 工作单 (JSON)"},
    es:{tagline:"La red de ejecución comercial con IA para pequeños comerciantes globales",nav_command:"Centro de mando",nav_radar:"Radar de oportunidades",nav_dealrooms:"Salas de trato",nav_suppliers:"Proveedores",nav_compliance:"Cumplimiento",nav_listing:"Estudio de listados",nav_flow:"Flujo comercial",nav_cash:"Caja y margen",nav_growth:"Crecimiento",nav_factory:"Portal de fábrica",cc_title:"Centro de mando comercial",cc_q1:"¿En qué producto trabajar hoy?",cc_q2:"¿Por qué probarlo ahora?",cc_q3:"¿Qué proveedores son más seguros?",cc_q4:"¿Infringe reglas o pierde dinero?",cc_q5:"¿Cuál es mi próxima acción?",cc_today_action:"Acción recomendada de hoy",cc_funnel:"Embudo de oportunidades",cc_risk_radar:"Radar de riesgos",cc_active_rooms:"Salas activas",cc_pending_actions:"Acciones que requieren tu aprobación",cc_quickstart:"Inicios rápidos",cc_identity:"Tu perfil comercial",f_discover:"Descubrir",f_supplier:"Proveedores",f_compliance:"Cumplimiento",f_sample:"Muestra",f_smallbatch:"Lote pequeño",f_content:"Prueba de contenido",f_decision:"Reordenar/Parar",risk_cash:"Riesgo de caja",risk_compliance:"Riesgo de cumplimiento",risk_supplier:"Riesgo de proveedor",risk_platform:"Riesgo de plataforma",risk_ad:"Riesgo de anuncios",next_best_action:"Próxima mejor acción",why:"Por qué",evidence:"Evidencia",risks:"Riesgos",next_steps:"Próximos pasos",copyable:"Archivo copiable",confidence:"Confianza",open_dealroom:"Abrir sala",create_passport:"Crear SKU Passport",find_suppliers:"Buscar proveedores",run_compliance:"Ejecutar ruta de cumplimiento",estimate_cash:"Estimar conversión de caja",generate_content:"Generar kit de contenido",loading:"Cargando…",empty:"Nada aún",error:"Algo salió mal",blocked_risk:"Bloqueado — alto riesgo",permission_denied:"Permiso denegado",approval_required:"Requiere aprobación humana",approve:"Aprobar",reject:"Rechazar",retry:"Reintentar",upgrade:"Mejorar plan",dr_thesis:"Tesis",dr_supplier:"Proveedores",dr_compliance:"Cumplimiento",dr_econ:"Economía unitaria",dr_sample:"Muestra y RFQ",dr_listing:"Estudio de listados",dr_growth:"Crecimiento",dr_order:"Pedido comercial",dr_ledger:"Libro mayor",dr_memo:"Memo de decisión",dr_stage:"Etapa actual",dr_overall_risk:"Riesgo total",dr_cash_score:"Conversión de caja",dr_trust:"Confianza del proveedor",dr_ai_conf:"Confianza de IA",comp_go:"ADELANTE",comp_go_cond:"ADELANTE con condiciones",comp_nogo:"NO hasta certificar",comp_disclaimer:"Este resultado es solo una señal operativa de riesgo y no constituye asesoría legal. Antes de vender, consulta a profesionales de cumplimiento, laboratorios, reglas de plataforma o abogados locales.",cash_buy:"Comprar",cash_negotiate:"Negociar",cash_test_smaller:"Probar menos",cash_stop:"Parar",cash_recommendation:"Recomendación",g_scale:"Escalar pedido",g_modify:"Modificar producto",g_lower:"Bajar precio",g_change_market:"Cambiar mercado",g_change_angle:"Cambiar enfoque",g_stop:"Parar producto",ui_language:"Idioma de interfaz",ai_language:"Idioma de salida de IA",currency:"Moneda",mock_notice:"Todos los datos son simulados. Las API de producción están reservadas, no conectadas.",copy:"Copiar",copied:"¡Copiado!",json_workorder:"Orden de trabajo IA (JSON)"},
    fr:{tagline:"Le réseau d'exécution commerciale par IA pour petits marchands mondiaux",nav_command:"Centre de commande",nav_radar:"Radar d'opportunités",nav_dealrooms:"Salles de deal",nav_suppliers:"Fournisseurs",nav_compliance:"Conformité",nav_listing:"Studio d'annonces",nav_flow:"Flux commercial",nav_cash:"Trésorerie & marge",nav_growth:"Croissance",nav_factory:"Portail usine",cc_title:"Centre de commande commercial",cc_q1:"Sur quel produit travailler aujourd'hui ?",cc_q2:"Pourquoi le tester maintenant ?",cc_q3:"Quels fournisseurs sont les plus sûrs ?",cc_q4:"Risque d'enfreindre les règles ou de perdre de l'argent ?",cc_q5:"Quelle est ma prochaine action ?",cc_today_action:"Action recommandée du jour",cc_funnel:"Entonnoir d'opportunités",cc_risk_radar:"Radar de risques",cc_active_rooms:"Salles actives",cc_pending_actions:"Actions nécessitant votre approbation",cc_quickstart:"Démarrages rapides",cc_identity:"Votre profil de commerçant",f_discover:"Découvrir",f_supplier:"Fournisseurs",f_compliance:"Conformité",f_sample:"Échantillon",f_smallbatch:"Petit lot",f_content:"Test de contenu",f_decision:"Recommander/Arrêter",risk_cash:"Risque de trésorerie",risk_compliance:"Risque de conformité",risk_supplier:"Risque fournisseur",risk_platform:"Risque plateforme",risk_ad:"Risque publicitaire",next_best_action:"Prochaine meilleure action",why:"Pourquoi",evidence:"Preuves",risks:"Risques",next_steps:"Prochaines étapes",copyable:"Fichier copiable",confidence:"Confiance",open_dealroom:"Ouvrir la salle",create_passport:"Créer SKU Passport",find_suppliers:"Trouver des fournisseurs",run_compliance:"Lancer la route de conformité",estimate_cash:"Estimer la conversion de trésorerie",generate_content:"Générer le kit de contenu",loading:"Chargement…",empty:"Rien pour l'instant",error:"Une erreur est survenue",blocked_risk:"Bloqué — risque élevé",permission_denied:"Permission refusée",approval_required:"Approbation humaine requise",approve:"Approuver",reject:"Rejeter",retry:"Réessayer",upgrade:"Améliorer le forfait",dr_thesis:"Thèse",dr_supplier:"Fournisseurs",dr_compliance:"Conformité",dr_econ:"Économie unitaire",dr_sample:"Échantillon & RFQ",dr_listing:"Studio d'annonces",dr_growth:"Croissance",dr_order:"Commande",dr_ledger:"Registre",dr_memo:"Mémo de décision",dr_stage:"Étape actuelle",dr_overall_risk:"Risque global",dr_cash_score:"Conversion de trésorerie",dr_trust:"Confiance fournisseur",dr_ai_conf:"Confiance IA",comp_go:"FEU VERT",comp_go_cond:"FEU VERT sous conditions",comp_nogo:"STOP avant certification",comp_disclaimer:"Ce résultat n'est qu'un signal opérationnel de risque et ne constitue pas un avis juridique. Avant toute vente, consultez des professionnels de la conformité, des laboratoires, les règles de la plateforme ou un avocat local.",cash_buy:"Acheter",cash_negotiate:"Négocier",cash_test_smaller:"Tester moins",cash_stop:"Arrêter",cash_recommendation:"Recommandation",g_scale:"Augmenter la commande",g_modify:"Modifier le produit",g_lower:"Baisser le prix",g_change_market:"Changer de marché",g_change_angle:"Changer d'angle",g_stop:"Arrêter le produit",ui_language:"Langue de l'interface",ai_language:"Langue de sortie IA",currency:"Devise",mock_notice:"Toutes les données sont simulées. Les API de production sont réservées, non connectées.",copy:"Copier",copied:"Copié !",json_workorder:"Ordre de travail IA (JSON)"},
    de:{tagline:"Das KI-Handelsausführungsnetzwerk für kleine globale Händler",nav_command:"Kommandozentrale",nav_radar:"Chancen-Radar",nav_dealrooms:"Deal-Räume",nav_suppliers:"Lieferanten",nav_compliance:"Compliance",nav_listing:"Listing-Studio",nav_flow:"Handelsfluss",nav_cash:"Cash & Marge",nav_growth:"Wachstum",nav_factory:"Fabrik-Portal",cc_title:"Handels-Kommandozentrale",cc_q1:"An welchem Produkt heute arbeiten?",cc_q2:"Warum jetzt testen?",cc_q3:"Welche Lieferanten sind am sichersten?",cc_q4:"Regelverstoß oder Geldverlust?",cc_q5:"Was ist meine nächste Aktion?",cc_today_action:"Heute empfohlene Aktion",cc_funnel:"Chancen-Trichter",cc_risk_radar:"Risiko-Radar",cc_active_rooms:"Aktive Deal-Räume",cc_pending_actions:"Aktionen, die Ihre Freigabe brauchen",cc_quickstart:"Schnellstarts",cc_identity:"Ihr Händlerprofil",f_discover:"Entdecken",f_supplier:"Lieferanten",f_compliance:"Compliance",f_sample:"Muster",f_smallbatch:"Kleinserie",f_content:"Content-Test",f_decision:"Nachbestellen/Stopp",risk_cash:"Cashflow-Risiko",risk_compliance:"Compliance-Risiko",risk_supplier:"Lieferantenrisiko",risk_platform:"Plattformrisiko",risk_ad:"Werberisiko",next_best_action:"Nächste beste Aktion",why:"Warum",evidence:"Belege",risks:"Risiken",next_steps:"Nächste Schritte",copyable:"Kopierbare Datei",confidence:"Konfidenz",open_dealroom:"Deal-Raum öffnen",create_passport:"SKU Passport erstellen",find_suppliers:"Lieferanten finden",run_compliance:"Compliance-Route ausführen",estimate_cash:"Cash-Konversion schätzen",generate_content:"Content-Kit erzeugen",loading:"Lädt…",empty:"Noch nichts",error:"Etwas ist schiefgelaufen",blocked_risk:"Blockiert — hohes Risiko",permission_denied:"Zugriff verweigert",approval_required:"Menschliche Freigabe nötig",approve:"Freigeben",reject:"Ablehnen",retry:"Wiederholen",upgrade:"Plan upgraden",dr_thesis:"These",dr_supplier:"Lieferanten",dr_compliance:"Compliance",dr_econ:"Stückkosten",dr_sample:"Muster & RFQ",dr_listing:"Listing-Studio",dr_growth:"Wachstum",dr_order:"Handelsauftrag",dr_ledger:"Hauptbuch",dr_memo:"Entscheidungs-Memo",dr_stage:"Aktuelle Phase",dr_overall_risk:"Gesamtrisiko",dr_cash_score:"Cash-Konversion",dr_trust:"Lieferantenvertrauen",dr_ai_conf:"KI-Konfidenz",comp_go:"GO",comp_go_cond:"GO mit Auflagen",comp_nogo:"NO-GO bis zertifiziert",comp_disclaimer:"Dieses Ergebnis ist nur ein allgemeines operatives Risikosignal und stellt keine Rechtsberatung dar. Konsultieren Sie vor dem Verkauf qualifizierte Compliance-Fachleute, Prüflabore, Plattformregeln oder lokale Anwälte.",cash_buy:"Kaufen",cash_negotiate:"Verhandeln",cash_test_smaller:"Kleiner testen",cash_stop:"Stopp",cash_recommendation:"Empfehlung",g_scale:"Bestellung skalieren",g_modify:"Produkt ändern",g_lower:"Preis senken",g_change_market:"Markt wechseln",g_change_angle:"Angle wechseln",g_stop:"Produkt stoppen",ui_language:"UI-Sprache",ai_language:"KI-Ausgabesprache",currency:"Währung",mock_notice:"Alle Daten sind Mock. Produktions-APIs sind reserviert, nicht verbunden.",copy:"Kopieren",copied:"Kopiert!",json_workorder:"KI-Arbeitsauftrag (JSON)"},
    ja:{tagline:"世界の小規模事業者のためのAI貿易実行ネットワーク",nav_command:"コマンドセンター",nav_radar:"機会レーダー",nav_dealrooms:"ディールルーム",nav_suppliers:"サプライヤー",nav_compliance:"コンプライアンス",nav_listing:"リスティング工房",nav_flow:"貿易フロー",nav_cash:"資金と粗利",nav_growth:"グロース",nav_factory:"工場ポータル",cc_title:"貿易コマンドセンター",cc_q1:"今日どの商品に取り組むべき？",cc_q2:"なぜ今テストする価値がある？",cc_q3:"どのサプライヤーが最も安全？",cc_q4:"規約違反や赤字にならない？",cc_q5:"次のアクションは？",cc_today_action:"本日の推奨アクション",cc_funnel:"機会ファネル",cc_risk_radar:"リスクレーダー",cc_active_rooms:"進行中のディールルーム",cc_pending_actions:"承認が必要なエージェント操作",cc_quickstart:"ワンクリック開始",cc_identity:"あなたの取引プロフィール",f_discover:"発見",f_supplier:"サプライヤー",f_compliance:"コンプラ",f_sample:"サンプル",f_smallbatch:"小ロット",f_content:"コンテンツ検証",f_decision:"再注文/停止",risk_cash:"資金リスク",risk_compliance:"コンプラリスク",risk_supplier:"サプライヤーリスク",risk_platform:"プラットフォームリスク",risk_ad:"広告リスク",next_best_action:"次の最適アクション",why:"理由",evidence:"根拠",risks:"リスク",next_steps:"次のステップ",copyable:"コピー可能なファイル",confidence:"信頼度",open_dealroom:"ディールルームを開く",create_passport:"SKU Passportを作成",find_suppliers:"サプライヤーを探す",run_compliance:"コンプラ経路を実行",estimate_cash:"資金転換を試算",generate_content:"コンテンツキット生成",loading:"読み込み中…",empty:"まだありません",error:"エラーが発生しました",blocked_risk:"ブロック — 高リスク",permission_denied:"権限がありません",approval_required:"人による承認が必要",approve:"承認",reject:"却下",retry:"再試行",upgrade:"プランを上げる",dr_thesis:"論点",dr_supplier:"サプライヤー",dr_compliance:"コンプラ",dr_econ:"単位経済",dr_sample:"サンプルとRFQ",dr_listing:"リスティング工房",dr_growth:"グロース",dr_order:"貿易注文",dr_ledger:"台帳",dr_memo:"意思決定メモ",dr_stage:"現在の段階",dr_overall_risk:"総合リスク",dr_cash_score:"資金転換",dr_trust:"サプライヤー信頼",dr_ai_conf:"AI信頼度",comp_go:"GO",comp_go_cond:"条件付きGO",comp_nogo:"認証まで停止",comp_disclaimer:"本結果は一般的な運用上のリスク提示であり、法的助言ではありません。販売前に、コンプライアンス専門家、検査機関、プラットフォーム規約、現地弁護士にご相談ください。",cash_buy:"購入",cash_negotiate:"交渉",cash_test_smaller:"小さくテスト",cash_stop:"停止",cash_recommendation:"推奨",g_scale:"増注",g_modify:"製品改良",g_lower:"値下げ",g_change_market:"市場変更",g_change_angle:"訴求変更",g_stop:"商品停止",ui_language:"UI言語",ai_language:"AI出力言語",currency:"通貨",mock_notice:"全データはモックです。本番APIは予約済みで未接続です。",copy:"コピー",copied:"コピーしました！",json_workorder:"AIワークオーダー (JSON)"},
    ar:{tagline:"شبكة تنفيذ التجارة بالذكاء الاصطناعي للتجار الصغار حول العالم",nav_command:"مركز القيادة",nav_radar:"رادار الفرص",nav_dealrooms:"غرف الصفقات",nav_suppliers:"مطابقة الموردين",nav_compliance:"الامتثال",nav_listing:"استوديو القوائم",nav_flow:"تدفق التجارة",nav_cash:"النقد والهامش",nav_growth:"النمو",nav_factory:"بوابة المصنع",cc_title:"مركز قيادة التجارة",cc_q1:"أي منتج أعمل عليه اليوم؟",cc_q2:"لماذا يستحق الاختبار الآن؟",cc_q3:"أي الموردين أكثر أمانًا؟",cc_q4:"هل سيخالف القواعد أو يخسر المال؟",cc_q5:"ما خطوتي التالية؟",cc_today_action:"إجراء اليوم الموصى به",cc_funnel:"قمع الفرص",cc_risk_radar:"رادار المخاطر",cc_active_rooms:"غرف الصفقات النشطة",cc_pending_actions:"إجراءات تحتاج موافقتك",cc_quickstart:"بدايات بنقرة",cc_identity:"ملفك التجاري",f_discover:"اكتشاف",f_supplier:"الموردون",f_compliance:"الامتثال",f_sample:"عينة",f_smallbatch:"دفعة صغيرة",f_content:"اختبار المحتوى",f_decision:"إعادة الطلب/إيقاف",risk_cash:"مخاطر النقد",risk_compliance:"مخاطر الامتثال",risk_supplier:"مخاطر المورد",risk_platform:"مخاطر المنصة",risk_ad:"مخاطر الإعلان",next_best_action:"أفضل إجراء تالٍ",why:"لماذا",evidence:"الأدلة",risks:"المخاطر",next_steps:"الخطوات التالية",copyable:"ملف قابل للنسخ",confidence:"الثقة",open_dealroom:"فتح غرفة الصفقة",create_passport:"إنشاء SKU Passport",find_suppliers:"البحث عن موردين",run_compliance:"تشغيل مسار الامتثال",estimate_cash:"تقدير تحويل النقد",generate_content:"إنشاء حزمة المحتوى",loading:"جارٍ التحميل…",empty:"لا شيء بعد",error:"حدث خطأ ما",blocked_risk:"محظور — خطر مرتفع",permission_denied:"تم رفض الإذن",approval_required:"يتطلب موافقة بشرية",approve:"موافقة",reject:"رفض",retry:"إعادة المحاولة",upgrade:"ترقية الخطة",dr_thesis:"الأطروحة",dr_supplier:"مطابقة الموردين",dr_compliance:"الامتثال",dr_econ:"اقتصاد الوحدة",dr_sample:"العينة وطلب التسعير",dr_listing:"استوديو القوائم",dr_growth:"النمو",dr_order:"طلب التجارة",dr_ledger:"دفتر الأستاذ",dr_memo:"مذكرة القرار",dr_stage:"المرحلة الحالية",dr_overall_risk:"الخطر الإجمالي",dr_cash_score:"تحويل النقد",dr_trust:"ثقة المورد",dr_ai_conf:"ثقة الذكاء الاصطناعي",comp_go:"تقدّم",comp_go_cond:"تقدّم بشروط",comp_nogo:"توقف حتى الاعتماد",comp_disclaimer:"هذه النتيجة مجرد إشارة تشغيلية عامة للمخاطر ولا تشكل استشارة قانونية. قبل البيع الفعلي، استشر متخصصي الامتثال والمختبرات وقواعد المنصات أو محاميًا محليًا.",cash_buy:"شراء",cash_negotiate:"تفاوض",cash_test_smaller:"اختبر أصغر",cash_stop:"إيقاف",cash_recommendation:"التوصية",g_scale:"توسيع الطلب",g_modify:"تعديل المنتج",g_lower:"خفض السعر",g_change_market:"تغيير السوق",g_change_angle:"تغيير الزاوية",g_stop:"إيقاف المنتج",ui_language:"لغة الواجهة",ai_language:"لغة مخرجات الذكاء الاصطناعي",currency:"العملة",mock_notice:"كل البيانات تجريبية. واجهات الإنتاج محجوزة وغير متصلة.",copy:"نسخ",copied:"تم النسخ!",json_workorder:"أمر عمل الذكاء الاصطناعي (JSON)"}
  };
  LANGS.forEach(l=>{ if(l!=="en") T[l]=Object.assign({}, T.en, OVERLAY[l]||{}); });

  /* ---- state ---- */
  let lang = "en";
  let aiLang = "auto";            // "auto" => derive from target region/platform
  let currency = "USD";
  const listeners = [];

  function t(key){ return (T[lang] && T[lang][key]) || T.en[key] || key; }
  function isRTL(){ return RTL.indexOf(lang)>=0; }
  function getLang(){ return lang; }
  function langs(){ return LANGS.map(l=>({code:l,label:LANG_LABEL[l]})); }

  function setLang(l){
    if(LANGS.indexOf(l)<0) return;
    lang=l;
    if(typeof document!=="undefined"){
      document.documentElement.setAttribute("lang",l);
      document.documentElement.setAttribute("dir", isRTL()?"rtl":"ltr");
      if(document.body){ document.body.classList.toggle("rtl", isRTL()); }
    }
    emit();
  }
  function setAiLang(l){ aiLang=l; emit(); }
  function getAiLang(){ return aiLang; }
  // UI language and AI output language are SEPARATE.
  function aiOutputLangFor(targetRegion){
    if(aiLang && aiLang!=="auto") return aiLang;
    const r=(targetRegion||"").toUpperCase();
    if(r.indexOf("FR")>=0) return "fr";
    if(r.indexOf("DE")>=0) return "de";
    if(r.indexOf("MX")>=0||r.indexOf("LATAM")>=0||r.indexOf("BR")>=0) return "es";
    if(r.indexOf("UAE")>=0||r.indexOf("KSA")>=0||r.indexOf("ME")>=0) return "ar";
    if(r.indexOf("JP")>=0) return "ja";
    return "en"; // US/UK/SEA default to English market copy
  }

  /* ---- currency ---- */
  function setCurrency(c){ if(CCY[c]){ currency=c; emit(); } }
  function getCurrency(){ return currency; }
  function currencies(){ return CCY_LIST.slice(); }
  function fmtMoney(usd, code){
    code = code || currency;
    const spec = CCY[code] || CCY.USD;
    let val = usd;
    if(typeof DB!=="undefined" && DB.FxService) val = DB.FxService.convert(usd, code);
    else if(typeof window!=="undefined" && window.DB && window.DB.FxService) val = window.DB.FxService.convert(usd, code);
    const n = val.toFixed(spec.dp).replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return isRTL() ? `${n} ${spec.sym}` : `${spec.sym}${n}`;
  }

  /* ---- reactivity ---- */
  function onChange(fn){ if(typeof fn==="function") listeners.push(fn); }
  function emit(){ listeners.forEach(fn=>{try{fn(lang,currency,aiLang);}catch(e){}}); }
  function apply(root){
    root = root || (typeof document!=="undefined"?document:null);
    if(!root||!root.querySelectorAll) return;
    root.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent=t(el.getAttribute("data-i18n")); });
  }

  return { LANGS, RTL, t, isRTL, getLang, setLang, langs, LANG_LABEL,
           setAiLang, getAiLang, aiOutputLangFor,
           setCurrency, getCurrency, currencies, fmtMoney,
           onChange, apply };
})();
if (typeof window !== "undefined") window.I18N = I18N;
if (typeof module !== "undefined" && module.exports) module.exports = I18N;
if (typeof global !== "undefined") global.I18N = I18N;
