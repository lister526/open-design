/* ============================================================================
 * Atlaz · i18n engine
 * - 6 UI languages: en / zh / ja / es / fr / de  (English fallback, never throws)
 * - Real-time whole-UI switching (no reload)
 * - UI language is SEPARATE from AI output language:
 *      I18N.uiLang            -> drives interface chrome
 *      I18N.aiOutputLangFor() -> drives generated content language by target market
 * Public global: I18N  { t, setLang, getLang, onChange, apply, aiOutputLangFor,
 *                        LANGS, CURRENCIES, fmtMoney }
 * ==========================================================================*/
const I18N = (() => {
  const T = {
    en: {
      app_name: "Atlaz",
      brand_tagline: "AI Trade Operating Network",
      positioning: "The AI trade operating network for small global merchants — turning product opportunities into supplier matches, compliant listings, sample orders, margin plans, and growth decisions.",
      // tabs
      tab_radar: "Radar", tab_suppliers: "Suppliers", tab_orders: "Orders",
      tab_cashflow: "Cashflow", tab_growth: "Growth",
      // command center
      cmd_title: "AI Trade Command Center",
      cc_identity: "Identity", cc_market: "Market", cc_platform: "Platform",
      cc_language: "Language", cc_currency: "Currency",
      cc_week_opps: "Opportunities this week", cc_risk_alerts: "Risk alerts",
      cc_orders_active: "Active orders", cc_loop_completion: "Trade-loop completion",
      cc_ccs_avg: "Avg Cash Conversion Score",
      cc_recommended: "Recommended opportunities", cc_active_orders: "Trade orders in progress",
      cc_cash_alerts: "Cashflow alerts", cc_compliance_alerts: "High-risk compliance alerts",
      cc_growth_due: "Growth experiments to review", cc_ai_next: "AI next-step suggestions",
      cc_recent_ledger: "Recent Trade Loop Ledger", cc_passport_drafts: "SKU Passport drafts",
      cc_supplier_updates: "Supplier Trust updates", cc_actions_pending: "Action approvals pending",
      cc_start_loop: "Start a Trade Loop",
      // generic actions
      analyze: "Analyze Opportunity", create_passport: "Create SKU Passport",
      match_suppliers: "Match Suppliers", generate_listing: "Generate Listing",
      run_compliance: "Run Compliance Route", create_order: "Create Sample Order",
      calc_cash: "Calculate Cash Conversion", build_growth: "Build Growth Plan",
      export_json: "Export JSON", view_json: "View JSON", hide_json: "Hide JSON",
      generate: "Generate", recalculate: "Recalculate", select: "Select",
      compare_quotes: "Compare Quotes", generate_rfq: "Generate RFQ",
      record_result: "Record Result", confirm_decision: "Confirm Decision",
      approve: "Approve", reject: "Reject", back: "Back", open: "Open", continue_: "Continue",
      // radar
      radar_title: "Opportunity Radar",
      radar_sub: "AI-scored product opportunities by market, platform and cash-conversion potential.",
      f_category: "Category", f_market: "Market", f_persona: "Persona", f_platform: "Platform",
      f_price_band: "Price band", f_trend: "Trend velocity", f_competition: "Competition",
      f_margin: "Est. margin", f_risk: "Compliance risk", f_supplier_region: "Supplier region",
      f_first_qty: "First order qty", f_test_budget: "Test budget",
      f_confidence: "Confidence", f_demand: "Demand signal", f_virality: "Content virality",
      f_ccp: "Cash conversion potential", f_supplier_avail: "Supplier availability",
      f_evidence: "Evidence", f_moat: "Moat note",
      // opportunity detail
      opp_report: "AI Opportunity Report",
      r_painpoint: "User pain point", r_why_now: "Why now", r_persona: "Target persona",
      r_content_logic: "Content-driven logic", r_hooks: "Short-video hooks",
      r_test_budget: "First test budget", r_buy_qty: "Recommended order qty",
      r_target_price: "Target price", r_margin: "Estimated margin", r_ccp: "Cash-conversion potential",
      r_risks: "Core risks", r_alternatives: "Alternative products", r_supplier_region: "Suggested supplier region",
      r_metrics: "30-day validation metrics", r_compliance: "Compliance focus",
      r_supplier_criteria: "Supplier screening criteria", r_next: "Next step",
      r_actions: "Suggested agent actions",
      // sku passport
      passport_title: "SKU Passport",
      sp_identity: "Product Identity", sp_market: "Target Market", sp_platform: "Platform",
      sp_persona: "Target Persona", sp_candidates: "Supplier Candidates", sp_selected_supplier: "Selected Supplier",
      sp_material: "Material Profile", sp_certs: "Certification Claims", sp_route: "Compliance Route",
      sp_listing: "Listing Assets", sp_landed: "Landed Cost Model", sp_ccs: "Cash Conversion Score",
      sp_timeline: "Trade Order Timeline", sp_growth: "Growth Experiments", sp_ai_history: "AI Decision History",
      sp_trust: "Supplier Trust Snapshot", sp_risk: "Risk Summary", sp_ledger: "Trade Loop Ledger",
      sp_pending: "Pending Agent Actions", sp_export: "Export JSON Preview",
      // suppliers
      sup_title: "Suppliers", sup_match_title: "Supplier Match",
      sup_match_sub: "AI-matched China-source factories scored on the Supplier Trust Graph.",
      sup_region: "Region", sup_categories: "Main categories", sup_moq: "MOQ",
      sup_price: "Price range", sup_sample_lt: "Sample lead time", sup_prod_lt: "Production lead time",
      sup_certs: "Certifications", sup_markets: "Export markets", sup_ontime: "On-time rate",
      sup_dispute: "Return/dispute rate", sup_rating: "Platform rating", sup_trust: "Trust Score",
      sup_reason: "Why recommended", sup_riskflags: "Risk flags", sup_bestfor: "Best for",
      sup_payment: "Payment terms", sup_response: "Response speed", sup_verify: "Verification",
      sup_trust_graph: "Supplier Trust Graph",
      gen_inquiry: "Inquiry Email", gen_wechat: "WeChat Script", gen_brief: "Sample Brief",
      gen_quote: "Quote Comparison", gen_trust_summary: "Trust Summary",
      gen_cert_verify: "Certificate Verification Request", gen_inspection: "Sample Inspection Checklist",
      // listing studio
      listing_title: "AI Listing Studio",
      listing_sub: "Generate compliant, platform-specific listings. UI language and output language are separate.",
      lst_title: "Title", lst_bullets: "Bullets", lst_desc: "Description", lst_seo: "SEO keywords",
      lst_tiktok: "TikTok script", lst_shopify: "Shopify sections", lst_amazon: "Amazon sections",
      lst_images: "Image prompts", lst_faq: "FAQ", lst_aftersales: "After-sales policy",
      lst_banned: "Banned-word risks", lst_avoid: "Claims to avoid", lst_safe: "Compliance-safe alternatives",
      lst_agentfacts: "AI shopping-agent facts", lst_creator: "Creator brief", lst_abtests: "A/B test titles",
      lst_output_lang: "Output language",
      // compliance
      comp_title: "Compliance Route Check",
      comp_sub: "A general operational risk signal — not legal advice.",
      comp_country: "Target country", comp_category: "Category", comp_material: "Material profile",
      comp_required: "Required checks", comp_forbidden: "Forbidden claims", comp_labeling: "Labeling requirements",
      comp_platform_rules: "Platform rule warnings", comp_customs: "Customs risk", comp_gaps: "Certification gaps",
      comp_review: "Professional review required", comp_route: "Recommended route", comp_blocked: "Blocked reasons",
      comp_safe: "Safe alternative positioning", comp_level: "Risk level",
      // trade order
      order_title: "Trade Order Timeline", order_status: "Status", order_ai: "AI guidance",
      order_docs: "Required documents", order_risk: "Risk", order_next: "Next step",
      order_template: "Generate template", order_approval: "Approval",
      // ledger
      ledger_title: "Trade Loop Ledger",
      ledger_sub: "An immutable fact ledger of every event from opportunity to reorder.",
      le_actor: "Actor", le_source: "Source", le_evidence: "Evidence", le_next: "Next action", le_audit: "Audit note",
      // cashflow
      cash_title: "Cash Conversion Calculator",
      cash_sub: "Estimates only — not investment, tax, lending, accounting or financing advice.",
      ci_unit: "Unit cost", ci_moq: "MOQ", ci_qty: "Order quantity", ci_dfreight: "Domestic freight",
      ci_ifreight: "International freight", ci_duty: "Duty rate", ci_platfee: "Platform fee",
      ci_payfee: "Payment fee", ci_adunit: "Ad budget / unit", ci_price: "Target price",
      ci_refund: "Refund rate", ci_returncost: "Return handling cost", ci_fx: "FX rate",
      ci_terms: "Payment terms (days)", ci_invdays: "Inventory days", ci_sample: "Sample cost",
      ci_pack: "Packaging cost", ci_reserve: "Compliance reserve cost",
      co_landed: "Landed unit cost", co_gross: "Gross margin", co_grossr: "Gross margin %",
      co_net: "Net margin", co_netr: "Net margin %", co_breakeven: "Break-even units",
      co_cashlock: "Cash locked", co_recovery: "Cash recovery days", co_invpressure: "Inventory pressure",
      co_adrisk: "Ad risk", co_fxrisk: "FX risk", co_dutyrisk: "Duty risk", co_returnrisk: "Return risk",
      co_termrisk: "Payment-term risk", co_ccs: "Cash Conversion Score", co_firstqty: "Recommended first order",
      co_decision: "Decision",
      // growth
      growth_title: "Growth Playbook",
      growth_sub: "7 / 14 / 30-day experiment plans and AI reorder decisions.",
      g_7: "7-day test plan", g_14: "14-day optimization", g_30: "30-day scale plan",
      g_cadence: "Video cadence", g_adbudget: "Ad budget", g_creator: "Creator collab",
      g_comments: "Comment scripts", g_feedback: "Feedback collection", g_ab: "A/B testing",
      g_pricetest: "Price testing", g_creative: "Creative testing", g_reorder: "Reorder strategy",
      g_competitor: "Competitor watch", g_stop: "Stop conditions", g_scale: "Scale conditions",
      g_result_title: "Experiment Result Tracker", g_decision: "AI decision",
      // statuses
      st_loading: "AI is generating…", st_empty: "Nothing here yet", st_retry: "Retry",
      st_error: "Something went wrong", st_offline: "Network unavailable",
      st_perm: "Permission denied", st_blocked: "Blocked — high risk",
      st_api_reserved: "API reserved — not connected", st_approval: "Action approval required",
      st_review: "Human review required", st_verify_pending: "Supplier verification pending",
      // agent action sheet
      aa_title: "Agent Action Approval", aa_risk: "Risk", aa_confidence: "Confidence",
      aa_irreversible: "Irreversible", aa_external: "External API", aa_rollback: "Rollback option",
      aa_audit: "Audit log preview", aa_requires: "Requires your approval",
      // pricing
      price_title: "Plans", price_free: "Free", price_pro: "Pro", price_ent: "Enterprise",
      price_revenue: "Revenue streams", price_upgrade: "Upgrade",
      // privacy / about / settings
      priv_title: "Privacy & Disclaimer", about_title: "About Atlaz", settings_title: "Settings",
      set_language: "Interface language", set_currency: "Currency", set_theme: "Dark mode",
      set_market: "Target market", set_platform: "Platform", set_identity: "Identity",
      set_reset: "Reset onboarding",
      mockapi_title: "Mock API Registry",
      mockapi_sub: "Every external integration is reserved with clear production wiring.",
      api_connected: "Connected (mock)", api_reserved: "Reserved (production)",
      api_creds: "Required credentials", api_approval: "User approval", api_stored: "Data stored",
      api_providers: "Future providers",
      // onboarding
      ob_welcome: "Welcome to Atlaz", ob_step: "Step",
      ob_identity: "Who are you?", ob_market: "Where do you sell?",
      ob_platform: "Which platform?", ob_lang: "Language & currency",
      ob_start: "Enter Atlaz",
      // disclaimers (exact)
      disc_ai: "AI outputs are for operational assistance only and may contain errors.",
      disc_comp: "Compliance results are general risk signals and do not constitute legal advice.",
      disc_fin: "Financial calculations are estimates and do not constitute investment, tax, lending, accounting, or financing advice.",
      disc_mock: "Supplier data in this MVP is mock data and must be verified before real transactions.",
      disc_guarantee: "Atlaz does not guarantee sales, profit, certification approval, logistics performance, supplier performance, customs clearance, or financing approval.",
      disc_action: "High-risk actions require human review and approval.",
      ownership_notice: "Atlaz product concept, generated project files, UI design direction, business logic, documentation drafts and commercial planning materials are intended to be fully assigned to the product owner, subject to applicable third-party licenses, platform terms, open-source licenses, and any agreements with the code generation platform or service providers.",
    },

    zh: {
      app_name: "Atlaz", brand_tagline: "AI 贸易操作网络",
      positioning: "面向全球小商家的 AI 贸易操作网络 —— 把商品机会转化为供应商匹配、合规商品页、样品订单、利润测算与增长决策。",
      tab_radar: "雷达", tab_suppliers: "供应商", tab_orders: "订单", tab_cashflow: "现金流", tab_growth: "增长",
      cmd_title: "AI 贸易指挥中心",
      cc_identity: "身份", cc_market: "市场", cc_platform: "平台", cc_language: "语言", cc_currency: "币种",
      cc_week_opps: "本周机会数", cc_risk_alerts: "风险提醒", cc_orders_active: "进行中订单",
      cc_loop_completion: "贸易闭环完成度", cc_ccs_avg: "平均现金转化分",
      cc_recommended: "推荐机会", cc_active_orders: "进行中的贸易订单", cc_cash_alerts: "现金流提醒",
      cc_compliance_alerts: "高风险合规提醒", cc_growth_due: "待复盘的增长实验", cc_ai_next: "AI 下一步建议",
      cc_recent_ledger: "最近的贸易账本", cc_passport_drafts: "SKU 护照草稿", cc_supplier_updates: "供应商信任更新",
      cc_actions_pending: "待确认的动作", cc_start_loop: "开始一条贸易闭环",
      analyze: "分析机会", create_passport: "创建 SKU 护照", match_suppliers: "匹配供应商",
      generate_listing: "生成商品页", run_compliance: "运行合规路线", create_order: "创建样品订单",
      calc_cash: "测算现金转化", build_growth: "生成增长计划", export_json: "导出 JSON",
      view_json: "查看 JSON", hide_json: "收起 JSON", generate: "生成", recalculate: "重新测算",
      select: "选择", compare_quotes: "对比报价", generate_rfq: "生成询盘单", record_result: "记录结果",
      confirm_decision: "确认决策", approve: "批准", reject: "拒绝", back: "返回", open: "打开", continue_: "继续",
      radar_title: "商品机会雷达", radar_sub: "按市场、平台与现金转化潜力进行 AI 评分的商品机会。",
      f_category: "品类", f_market: "市场", f_persona: "用户画像", f_platform: "平台", f_price_band: "价格带",
      f_trend: "趋势速度", f_competition: "竞争强度", f_margin: "预计毛利", f_risk: "合规风险",
      f_supplier_region: "推荐供应地区", f_first_qty: "首单数量", f_test_budget: "测试预算",
      f_confidence: "置信度", f_demand: "需求信号", f_virality: "内容传播力", f_ccp: "现金转化潜力",
      f_supplier_avail: "供应商可得性", f_evidence: "证据摘要", f_moat: "护城河备注",
      opp_report: "AI 机会报告", r_painpoint: "用户痛点", r_why_now: "为什么是现在", r_persona: "目标用户画像",
      r_content_logic: "内容驱动逻辑", r_hooks: "短视频卖点", r_test_budget: "首批测试预算",
      r_buy_qty: "推荐采购量", r_target_price: "目标售价", r_margin: "预计毛利", r_ccp: "现金转化潜力",
      r_risks: "核心风险", r_alternatives: "替代商品", r_supplier_region: "建议供应区域",
      r_metrics: "30 天验证指标", r_compliance: "合规关注点", r_supplier_criteria: "供应商筛选标准",
      r_next: "下一步", r_actions: "建议的智能体动作",
      passport_title: "SKU 护照",
      sp_identity: "商品身份", sp_market: "目标市场", sp_platform: "平台", sp_persona: "目标用户",
      sp_candidates: "候选供应商", sp_selected_supplier: "已选供应商", sp_material: "材料档案",
      sp_certs: "认证声明", sp_route: "合规路线", sp_listing: "Listing 资产", sp_landed: "落地成本模型",
      sp_ccs: "现金转化分", sp_timeline: "贸易订单时间线", sp_growth: "增长实验", sp_ai_history: "AI 决策历史",
      sp_trust: "供应商信任快照", sp_risk: "风险摘要", sp_ledger: "贸易闭环账本", sp_pending: "待确认动作",
      sp_export: "导出 JSON 预览",
      sup_title: "供应商", sup_match_title: "供应商匹配", sup_match_sub: "在供应商信任图谱上评分的 AI 匹配中国源头工厂。",
      sup_region: "地区", sup_categories: "主营品类", sup_moq: "起订量", sup_price: "报价区间",
      sup_sample_lt: "打样周期", sup_prod_lt: "生产周期", sup_certs: "认证", sup_markets: "出口市场",
      sup_ontime: "准时履约率", sup_dispute: "退货纠纷率", sup_rating: "平台评分", sup_trust: "信任分",
      sup_reason: "推荐理由", sup_riskflags: "风险标签", sup_bestfor: "适合", sup_payment: "付款条件",
      sup_response: "响应速度", sup_verify: "核验状态", sup_trust_graph: "供应商信任图谱",
      gen_inquiry: "询盘邮件", gen_wechat: "微信话术", gen_brief: "打样 Brief", gen_quote: "报价对比表",
      gen_trust_summary: "信任摘要", gen_cert_verify: "证书核验请求", gen_inspection: "样品验收清单",
      listing_title: "AI 商品上架工作室", listing_sub: "生成合规、分平台的商品内容。界面语言与输出语言相互独立。",
      lst_title: "标题", lst_bullets: "卖点", lst_desc: "描述", lst_seo: "SEO 关键词",
      lst_tiktok: "TikTok 脚本", lst_shopify: "Shopify 版块", lst_amazon: "Amazon 版块",
      lst_images: "图片提示词", lst_faq: "FAQ", lst_aftersales: "售后政策", lst_banned: "禁用词风险",
      lst_avoid: "需避免的声明", lst_safe: "合规安全替代", lst_agentfacts: "AI 购物代理事实",
      lst_creator: "达人 Brief", lst_abtests: "A/B 测试标题", lst_output_lang: "输出语言",
      comp_title: "合规路线检查", comp_sub: "通用经营风险提示 —— 不构成法律意见。",
      comp_country: "目标国家", comp_category: "品类", comp_material: "材料档案", comp_required: "所需检查",
      comp_forbidden: "禁止声明", comp_labeling: "标签要求", comp_platform_rules: "平台规则警告",
      comp_customs: "海关风险", comp_gaps: "认证缺口", comp_review: "需专业审查", comp_route: "推荐路线",
      comp_blocked: "阻断原因", comp_safe: "安全替代定位", comp_level: "风险等级",
      order_title: "贸易订单时间线", order_status: "状态", order_ai: "AI 建议", order_docs: "所需文件",
      order_risk: "风险", order_next: "下一步", order_template: "生成模板", order_approval: "审批",
      ledger_title: "贸易闭环账本", ledger_sub: "记录从机会到复购的每一个事实事件的不可变账本。",
      le_actor: "执行方", le_source: "来源", le_evidence: "证据", le_next: "下一步动作", le_audit: "审计备注",
      cash_title: "现金转化测算器", cash_sub: "仅为估算 —— 不构成投资、税务、贷款、会计或融资建议。",
      ci_unit: "采购单价", ci_moq: "起订量", ci_qty: "采购数量", ci_dfreight: "国内运费", ci_ifreight: "国际物流费",
      ci_duty: "关税率", ci_platfee: "平台佣金", ci_payfee: "支付手续费", ci_adunit: "单件广告预算",
      ci_price: "目标售价", ci_refund: "退货率", ci_returncost: "退货处理成本", ci_fx: "汇率",
      ci_terms: "账期(天)", ci_invdays: "库存周转天数", ci_sample: "样品费", ci_pack: "包装费", ci_reserve: "合规预留成本",
      co_landed: "单件落地成本", co_gross: "毛利", co_grossr: "毛利率", co_net: "净利", co_netr: "净利率",
      co_breakeven: "盈亏平衡销量", co_cashlock: "现金占用", co_recovery: "回款周期", co_invpressure: "库存压力",
      co_adrisk: "广告风险", co_fxrisk: "汇率风险", co_dutyrisk: "关税风险", co_returnrisk: "退货风险",
      co_termrisk: "账期风险", co_ccs: "现金转化分", co_firstqty: "建议首单数量", co_decision: "决策",
      growth_title: "增长作战室", growth_sub: "7 / 14 / 30 天实验计划与 AI 复购决策。",
      g_7: "7 天测试计划", g_14: "14 天优化计划", g_30: "30 天放量计划", g_cadence: "视频发布节奏",
      g_adbudget: "广告预算", g_creator: "达人合作", g_comments: "评论区话术", g_feedback: "反馈收集",
      g_ab: "A/B 测试", g_pricetest: "价格测试", g_creative: "素材测试", g_reorder: "复购策略",
      g_competitor: "竞品观察", g_stop: "停止条件", g_scale: "放量条件",
      g_result_title: "实验结果追踪", g_decision: "AI 决策",
      st_loading: "AI 正在生成…", st_empty: "这里还没有内容", st_retry: "重试", st_error: "出现了问题",
      st_offline: "网络不可用", st_perm: "权限被拒绝", st_blocked: "已阻断 —— 高风险",
      st_api_reserved: "API 已预留 —— 未连接", st_approval: "需要动作审批", st_review: "需要人工审查",
      st_verify_pending: "供应商核验中",
      aa_title: "智能体动作审批", aa_risk: "风险", aa_confidence: "置信度", aa_irreversible: "不可逆",
      aa_external: "外部 API", aa_rollback: "回滚选项", aa_audit: "审计日志预览", aa_requires: "需要你的批准",
      price_title: "套餐", price_free: "免费版", price_pro: "Pro 版", price_ent: "企业版",
      price_revenue: "收入模式", price_upgrade: "升级",
      priv_title: "隐私与免责声明", about_title: "关于 Atlaz", settings_title: "设置",
      set_language: "界面语言", set_currency: "币种", set_theme: "深色模式", set_market: "目标市场",
      set_platform: "平台", set_identity: "身份", set_reset: "重置引导",
      mockapi_title: "Mock API 注册表", mockapi_sub: "每个外部集成都已预留并标注生产接入方式。",
      api_connected: "已连接(模拟)", api_reserved: "已预留(生产)", api_creds: "所需凭证",
      api_approval: "用户审批", api_stored: "存储数据", api_providers: "未来供应商",
      ob_welcome: "欢迎使用 Atlaz", ob_step: "步骤", ob_identity: "你是谁?", ob_market: "你在哪里销售?",
      ob_platform: "哪个平台?", ob_lang: "语言与币种", ob_start: "进入 Atlaz",
      disc_ai: "AI 输出仅用于运营辅助,可能包含错误。",
      disc_comp: "合规结果为通用风险提示,不构成法律意见。",
      disc_fin: "财务测算为估算,不构成投资、税务、贷款、会计或融资建议。",
      disc_mock: "本 MVP 中供应商数据为模拟数据,真实交易前必须核验。",
      disc_guarantee: "Atlaz 不保证销售、利润、认证通过、物流表现、供应商表现、清关或融资批准。",
      disc_action: "高风险动作需要人工审查和批准。",
      ownership_notice: "Atlaz 的产品概念、生成的项目文件、UI 设计方向、业务逻辑、文档草稿与商业规划材料,拟在遵守相关第三方许可、平台条款、开源许可及与代码生成平台或服务商之任何协议的前提下,完整归属于产品所有者。",
    },

    ja: {
      app_name: "Atlaz", brand_tagline: "AI 貿易オペレーティングネットワーク",
      positioning: "世界の小規模事業者のための AI 貿易オペレーティングネットワーク。商機をサプライヤー照合・準拠リスティング・サンプル発注・利益計画・成長判断へ。",
      tab_radar: "レーダー", tab_suppliers: "サプライヤー", tab_orders: "注文", tab_cashflow: "資金繰り", tab_growth: "成長",
      cmd_title: "AI 貿易コマンドセンター",
      cc_recommended: "おすすめの商機", cc_start_loop: "貿易ループを開始",
      analyze: "商機を分析", create_passport: "SKU パスポート作成", match_suppliers: "サプライヤー照合",
      generate_listing: "リスティング生成", run_compliance: "コンプライアンス確認", create_order: "サンプル注文作成",
      calc_cash: "資金転換を計算", build_growth: "成長計画", export_json: "JSON 出力",
      view_json: "JSON 表示", hide_json: "JSON 非表示", generate: "生成", select: "選択",
      back: "戻る", open: "開く", continue_: "続行", approve: "承認", reject: "却下",
      radar_title: "商機レーダー", passport_title: "SKU パスポート", sup_match_title: "サプライヤー照合",
      listing_title: "AI リスティングスタジオ", comp_title: "コンプライアンス経路チェック",
      order_title: "貿易注文タイムライン", ledger_title: "貿易ループ台帳", cash_title: "資金転換計算機",
      growth_title: "成長プレイブック", price_title: "プラン", priv_title: "プライバシーと免責事項",
      about_title: "Atlaz について", settings_title: "設定",
      st_loading: "AI が生成中…", st_empty: "まだ何もありません", st_retry: "再試行", st_error: "問題が発生しました",
      st_blocked: "ブロック — 高リスク", st_approval: "承認が必要です",
      ob_welcome: "Atlaz へようこそ", ob_start: "Atlaz に入る",
      disc_ai: "AI の出力は運用補助のみを目的とし、誤りを含む場合があります。",
      disc_comp: "コンプライアンス結果は一般的なリスク信号であり、法的助言ではありません。",
      disc_fin: "財務計算は概算であり、投資・税務・融資・会計・資金調達の助言ではありません。",
    },

    es: {
      app_name: "Atlaz", brand_tagline: "Red operativa de comercio con IA",
      positioning: "La red operativa de comercio con IA para pequeños comerciantes globales: convierte oportunidades de producto en proveedores, fichas conformes, pedidos de muestra, planes de margen y decisiones de crecimiento.",
      tab_radar: "Radar", tab_suppliers: "Proveedores", tab_orders: "Pedidos", tab_cashflow: "Flujo de caja", tab_growth: "Crecimiento",
      cmd_title: "Centro de Mando de Comercio IA",
      cc_recommended: "Oportunidades recomendadas", cc_start_loop: "Iniciar un ciclo de comercio",
      analyze: "Analizar oportunidad", create_passport: "Crear SKU Passport", match_suppliers: "Buscar proveedores",
      generate_listing: "Generar publicación", run_compliance: "Verificar cumplimiento", create_order: "Crear pedido de muestra",
      calc_cash: "Calcular conversión de efectivo", build_growth: "Plan de crecimiento", export_json: "Exportar JSON",
      view_json: "Ver JSON", hide_json: "Ocultar JSON", generate: "Generar", select: "Seleccionar",
      back: "Atrás", open: "Abrir", continue_: "Continuar", approve: "Aprobar", reject: "Rechazar",
      radar_title: "Radar de oportunidades", passport_title: "SKU Passport", sup_match_title: "Coincidencia de proveedores",
      listing_title: "Estudio de publicaciones IA", comp_title: "Verificación de cumplimiento",
      order_title: "Cronología del pedido", ledger_title: "Libro del ciclo de comercio", cash_title: "Calculadora de conversión de efectivo",
      growth_title: "Manual de crecimiento", price_title: "Planes", priv_title: "Privacidad y descargo",
      about_title: "Acerca de Atlaz", settings_title: "Ajustes",
      st_loading: "La IA está generando…", st_empty: "Aún no hay nada", st_retry: "Reintentar", st_error: "Algo salió mal",
      st_blocked: "Bloqueado — alto riesgo", st_approval: "Se requiere aprobación",
      ob_welcome: "Bienvenido a Atlaz", ob_start: "Entrar a Atlaz",
      disc_ai: "Las salidas de IA son solo asistencia operativa y pueden contener errores.",
      disc_comp: "Los resultados de cumplimiento son señales generales de riesgo y no constituyen asesoría legal.",
      disc_fin: "Los cálculos financieros son estimaciones y no constituyen asesoría de inversión, fiscal, crediticia, contable ni de financiación.",
    },

    fr: {
      app_name: "Atlaz", brand_tagline: "Réseau d'exploitation commerciale par IA",
      positioning: "Le réseau d'exploitation commerciale par IA pour les petits marchands mondiaux : transformer les opportunités produit en fournisseurs, fiches conformes, commandes d'échantillons, plans de marge et décisions de croissance.",
      tab_radar: "Radar", tab_suppliers: "Fournisseurs", tab_orders: "Commandes", tab_cashflow: "Trésorerie", tab_growth: "Croissance",
      cmd_title: "Centre de commande commerce IA",
      cc_recommended: "Opportunités recommandées", cc_start_loop: "Démarrer une boucle commerciale",
      analyze: "Analyser l'opportunité", create_passport: "Créer un SKU Passport", match_suppliers: "Trouver des fournisseurs",
      generate_listing: "Générer la fiche", run_compliance: "Vérifier la conformité", create_order: "Créer une commande d'échantillon",
      calc_cash: "Calculer la conversion de trésorerie", build_growth: "Plan de croissance", export_json: "Exporter JSON",
      view_json: "Voir JSON", hide_json: "Masquer JSON", generate: "Générer", select: "Sélectionner",
      back: "Retour", open: "Ouvrir", continue_: "Continuer", approve: "Approuver", reject: "Rejeter",
      radar_title: "Radar d'opportunités", passport_title: "SKU Passport", sup_match_title: "Correspondance fournisseurs",
      listing_title: "Studio de fiches IA", comp_title: "Vérification de conformité",
      order_title: "Chronologie de commande", ledger_title: "Registre de boucle commerciale", cash_title: "Calculateur de conversion de trésorerie",
      growth_title: "Manuel de croissance", price_title: "Forfaits", priv_title: "Confidentialité et avertissement",
      about_title: "À propos d'Atlaz", settings_title: "Paramètres",
      st_loading: "L'IA génère…", st_empty: "Rien pour l'instant", st_retry: "Réessayer", st_error: "Une erreur est survenue",
      st_blocked: "Bloqué — risque élevé", st_approval: "Approbation requise",
      ob_welcome: "Bienvenue sur Atlaz", ob_start: "Entrer dans Atlaz",
      disc_ai: "Les sorties IA servent uniquement d'assistance opérationnelle et peuvent contenir des erreurs.",
      disc_comp: "Les résultats de conformité sont des signaux de risque généraux et ne constituent pas un avis juridique.",
      disc_fin: "Les calculs financiers sont des estimations et ne constituent pas un conseil en investissement, fiscal, de crédit, comptable ou de financement.",
    },

    de: {
      app_name: "Atlaz", brand_tagline: "KI-Handelsbetriebsnetzwerk",
      positioning: "Das KI-Handelsbetriebsnetzwerk für kleine globale Händler: Produktchancen in Lieferanten, konforme Listings, Musterbestellungen, Margenpläne und Wachstumsentscheidungen verwandeln.",
      tab_radar: "Radar", tab_suppliers: "Lieferanten", tab_orders: "Bestellungen", tab_cashflow: "Cashflow", tab_growth: "Wachstum",
      cmd_title: "KI-Handels-Kommandozentrale",
      cc_recommended: "Empfohlene Chancen", cc_start_loop: "Handels-Loop starten",
      analyze: "Chance analysieren", create_passport: "SKU-Pass erstellen", match_suppliers: "Lieferanten finden",
      generate_listing: "Listing erstellen", run_compliance: "Compliance prüfen", create_order: "Musterbestellung erstellen",
      calc_cash: "Cash-Conversion berechnen", build_growth: "Wachstumsplan", export_json: "JSON exportieren",
      view_json: "JSON ansehen", hide_json: "JSON ausblenden", generate: "Erstellen", select: "Auswählen",
      back: "Zurück", open: "Öffnen", continue_: "Weiter", approve: "Genehmigen", reject: "Ablehnen",
      radar_title: "Chancen-Radar", passport_title: "SKU-Pass", sup_match_title: "Lieferanten-Matching",
      listing_title: "KI-Listing-Studio", comp_title: "Compliance-Routenprüfung",
      order_title: "Handelsauftrag-Zeitleiste", ledger_title: "Handels-Loop-Buch", cash_title: "Cash-Conversion-Rechner",
      growth_title: "Wachstums-Playbook", price_title: "Tarife", priv_title: "Datenschutz & Haftungsausschluss",
      about_title: "Über Atlaz", settings_title: "Einstellungen",
      st_loading: "KI generiert…", st_empty: "Noch nichts hier", st_retry: "Erneut", st_error: "Etwas ist schiefgelaufen",
      st_blocked: "Blockiert — hohes Risiko", st_approval: "Genehmigung erforderlich",
      ob_welcome: "Willkommen bei Atlaz", ob_start: "Atlaz betreten",
      disc_ai: "KI-Ausgaben dienen nur der operativen Unterstützung und können Fehler enthalten.",
      disc_comp: "Compliance-Ergebnisse sind allgemeine Risikosignale und stellen keine Rechtsberatung dar.",
      disc_fin: "Finanzberechnungen sind Schätzungen und stellen keine Anlage-, Steuer-, Kredit-, Buchhaltungs- oder Finanzierungsberatung dar.",
    },
  };

  const LANGS = [
    { code: "en", label: "English" }, { code: "zh", label: "简体中文" },
    { code: "ja", label: "日本語" }, { code: "es", label: "Español" },
    { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" },
  ];
  const CURRENCIES = [
    { code: "USD", symbol: "$", rate: 1 }, { code: "CNY", symbol: "¥", rate: 7.18 },
    { code: "EUR", symbol: "€", rate: 0.92 }, { code: "JPY", symbol: "¥", rate: 152 },
    { code: "GBP", symbol: "£", rate: 0.79 },
  ];

  let uiLang = "en";
  const listeners = [];

  function t(key) {
    return (T[uiLang] && T[uiLang][key]) || T.en[key] || key;
  }
  function setLang(code) {
    if (!T[code]) code = "en";
    uiLang = code;
    try { localStorage.setItem("atlaz.lang", code); } catch (e) {}
    apply();
    listeners.forEach((fn) => { try { fn(code); } catch (e) {} });
  }
  function getLang() { return uiLang; }
  function onChange(fn) { if (typeof fn === "function") listeners.push(fn); }

  function apply() {
    if (typeof document === "undefined" || !document.documentElement) return;
    document.documentElement.lang = uiLang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  }

  // UI language is SEPARATE from AI output language.
  function aiOutputLangFor(targetRegion) {
    const r = String(targetRegion || "").toLowerCase();
    if (r.includes("united states") || r === "us" || r.includes("usa")) return "English (US)";
    if (r.includes("united kingdom") || r === "uk" || r.includes("britain")) return "English (UK)";
    if (r.includes("germany")) return "German, with English fallback";
    if (r.includes("france")) return "French";
    if (r.includes("japan")) return "Japanese";
    if (r.includes("southeast") || r.includes("sea")) return "English (regional)";
    if (r.includes("middle east")) return "English, with Arabic note";
    if (r.includes("latin")) return "Spanish";
    return "English";
  }

  function fmtMoney(usd, currencyCode) {
    const c = CURRENCIES.find((x) => x.code === currencyCode) || CURRENCIES[0];
    const v = usd * c.rate;
    const dp = c.code === "JPY" ? 0 : 2;
    return c.symbol + v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  try {
    const saved = (typeof localStorage !== "undefined") && localStorage.getItem("atlaz.lang");
    if (saved && T[saved]) uiLang = saved;
  } catch (e) {}

  return { t, setLang, getLang, onChange, apply, aiOutputLangFor, LANGS, CURRENCIES, fmtMoney };
})();
if (typeof window !== "undefined") window.I18N = I18N;
