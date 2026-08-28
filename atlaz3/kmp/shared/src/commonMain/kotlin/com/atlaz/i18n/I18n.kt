package com.atlaz.i18n

/**
 * I18n — 6 UI languages (en, zh, ja, es, fr, de) with English fallback, plus the
 * crucial UI-language ≠ AI-output-language separation via [aiOutputLangFor].
 * Mirrors the web prototype's i18n.js contract. 5 display currencies are supported.
 */
object I18n {
    data class Lang(val code: String, val label: String)
    data class Currency(val code: String, val symbol: String, val rate: Double, val decimals: Int)

    val languages = listOf(
        Lang("en", "English"), Lang("zh", "中文"), Lang("ja", "日本語"),
        Lang("es", "Español"), Lang("fr", "Français"), Lang("de", "Deutsch")
    )

    val currencies = mapOf(
        "USD" to Currency("USD", "$", 1.0, 2),
        "CNY" to Currency("CNY", "¥", 7.18, 2),
        "EUR" to Currency("EUR", "€", 0.92, 2),
        "JPY" to Currency("JPY", "¥", 152.0, 0),
        "GBP" to Currency("GBP", "£", 0.79, 2)
    )

    private val strings: Map<String, Map<String, String>> = mapOf(
        "en" to mapOf(
            "brand_tagline" to "The AI trade operating network for small global merchants",
            "tab_radar" to "Radar", "tab_suppliers" to "Suppliers", "tab_orders" to "Orders",
            "tab_cashflow" to "Cashflow", "tab_growth" to "Growth",
            "cc_title" to "AI Trade Command Center", "start_trade_loop" to "Start a Trade Loop"
        ),
        "zh" to mapOf(
            "brand_tagline" to "面向全球小商家的 AI 贸易操作网络",
            "tab_radar" to "雷达", "tab_suppliers" to "供应商", "tab_orders" to "订单",
            "tab_cashflow" to "现金流", "tab_growth" to "增长",
            "cc_title" to "AI 贸易指挥中心", "start_trade_loop" to "开启一个贸易闭环"
        ),
        "ja" to mapOf("tab_radar" to "レーダー", "cc_title" to "AI 貿易コマンドセンター"),
        "es" to mapOf("tab_radar" to "Radar", "cc_title" to "Centro de Comando Comercial AI"),
        "fr" to mapOf("tab_radar" to "Radar", "cc_title" to "Centre de Commande Commercial IA"),
        "de" to mapOf("tab_radar" to "Radar", "cc_title" to "KI-Handelszentrale")
    )

    var uiLang: String = "en"

    fun t(key: String, lang: String = uiLang): String =
        strings[lang]?.get(key) ?: strings["en"]?.get(key) ?: key

    /** UI language is independent of the language the AI should WRITE in for a given market. */
    fun aiOutputLangFor(targetRegion: String): String = when (targetRegion) {
        "United States", "United Kingdom" -> "English"
        "Germany" -> "German (with English fallback)"
        "France" -> "French"
        "Japan" -> "Japanese"
        "Southeast Asia" -> "English (regional)"
        "Middle East" -> "English (with Arabic note)"
        else -> "English"
    }

    fun fmtMoney(usd: Double, currencyCode: String = "USD"): String {
        val c = currencies[currencyCode] ?: currencies["USD"]!!
        val v = usd * c.rate
        val rounded = if (c.decimals == 0) v.toLong().toString() else ((v * 100).toLong() / 100.0).toString()
        return "${c.symbol}$rounded"
    }
}
