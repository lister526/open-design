package com.atlaz.i18n

/* ============================================================================
 * Atlaz v4 · i18n + currency.
 *
 * 7 UI languages (zh/en/es/fr/de/ja/ar incl. RTL Arabic) switchable in real
 * time, and 10 currencies with a mock FX table. Critically: UI language is
 * independent of AI OUTPUT language — a German merchant may read the UI in
 * English while the listing/inquiry is generated in German for the supplier.
 * ========================================================================== */
object I18n {

    val LANGS = listOf("en", "zh", "es", "fr", "de", "ja", "ar")
    val RTL = setOf("ar")

    val CURRENCIES = listOf("USD", "CNY", "EUR", "GBP", "JPY", "CAD", "AUD", "AED", "MXN", "BRL")

    // Mock USD-per-unit FX rates (1 unit of currency = X USD).
    private val fxToUsd = mapOf(
        "USD" to 1.0, "CNY" to 0.139, "EUR" to 1.08, "GBP" to 1.27, "JPY" to 0.0067,
        "CAD" to 0.73, "AUD" to 0.66, "AED" to 0.27, "MXN" to 0.059, "BRL" to 0.18
    )
    private val symbols = mapOf(
        "USD" to "$", "CNY" to "¥", "EUR" to "€", "GBP" to "£", "JPY" to "¥",
        "CAD" to "C$", "AUD" to "A$", "AED" to "د.إ", "MXN" to "MX$", "BRL" to "R$"
    )

    var uiLang: String = "en"
    var aiLang: String = "auto"
    var currency: String = "USD"

    fun isRtl(): Boolean = RTL.contains(uiLang)

    fun setLang(l: String) { if (LANGS.contains(l)) uiLang = l }
    fun setCurrency(c: String) { if (CURRENCIES.contains(c)) currency = c }

    /** AI output language defaults to the supplier/market locale, not the UI. */
    fun aiOutputLangFor(region: String): String {
        if (aiLang != "auto") return aiLang
        val r = region.lowercase()
        return when {
            r.contains("france") || r.contains("fr") -> "fr"
            r.contains("germany") || r.contains("de") -> "de"
            r.contains("mexico") || r.contains("latam") || r.contains("brazil") || r.contains("brasil") -> "es"
            r.contains("middle east") || r.contains("uae") || r.contains("gulf") -> "ar"
            r.contains("japan") || r.contains("jp") -> "ja"
            else -> "en"
        }
    }

    fun convertUsd(amountUsd: Double, to: String = currency): Double {
        val rate = fxToUsd[to] ?: 1.0
        return amountUsd / rate
    }

    fun fmtMoney(amountUsd: Double, ccy: String = currency): String {
        val v = convertUsd(amountUsd, ccy)
        val s = symbols[ccy] ?: "$"
        val num = ((v * 100).toLong() / 100.0).toString()
        return if (isRtl()) "$num $s" else "$s$num"
    }

    private val en = mapOf(
        "app.name" to "Atlaz",
        "app.tagline" to "The AI trade execution network for small global merchants",
        "nav.command" to "Trade Command Center",
        "nav.radar" to "Opportunity Radar",
        "nav.dealrooms" to "Deal Rooms",
        "nav.suppliers" to "Supplier Match",
        "nav.compliance" to "Compliance Copilot",
        "nav.listing" to "AI Listing Studio",
        "nav.flow" to "Trade Flow",
        "nav.cash" to "Cash Conversion",
        "nav.growth" to "Growth Playbook",
        "nav.factory" to "Factory Portal",
        "q.today" to "What should I do today?",
        "q.opp" to "What is worth selling right now?",
        "q.supplier" to "Who can I trust to make it?",
        "q.cash" to "Will this make money without killing my cash?",
        "q.growth" to "Is the test working — reorder or pivot?",
        "approval.required" to "Human approval required"
    )

    private val overlay = mapOf(
        "zh" to mapOf(
            "app.tagline" to "面向全球小商家的 AI 贸易执行网络",
            "nav.command" to "贸易指挥中心", "nav.radar" to "机会雷达", "nav.dealrooms" to "交易室",
            "nav.suppliers" to "供应商匹配", "nav.compliance" to "合规副驾", "nav.listing" to "AI 上架工作室",
            "nav.flow" to "贸易流程", "nav.cash" to "现金转化", "nav.growth" to "增长手册", "nav.factory" to "工厂端",
            "q.today" to "我今天该做什么？", "q.opp" to "现在什么值得卖？", "q.supplier" to "谁能可靠地生产？",
            "q.cash" to "这能赚钱又不拖垮现金流吗？", "q.growth" to "测试有效吗——补货还是转向？",
            "approval.required" to "需要人工审批"
        ),
        "es" to mapOf("app.tagline" to "La red de ejecución comercial con IA para pequeños comerciantes globales", "approval.required" to "Se requiere aprobación humana"),
        "fr" to mapOf("app.tagline" to "Le réseau d'exécution commerciale par IA pour les petits commerçants", "approval.required" to "Approbation humaine requise"),
        "de" to mapOf("app.tagline" to "Das KI-Handelsausführungsnetzwerk für kleine Händler", "approval.required" to "Menschliche Freigabe erforderlich"),
        "ja" to mapOf("app.tagline" to "世界の小規模事業者のためのAI貿易実行ネットワーク", "approval.required" to "人間の承認が必要"),
        "ar" to mapOf("app.tagline" to "شبكة تنفيذ التجارة بالذكاء الاصطناعي للتجار الصغار", "approval.required" to "تتطلب موافقة بشرية")
    )

    fun t(key: String): String =
        overlay[uiLang]?.get(key) ?: en[key] ?: key
}
