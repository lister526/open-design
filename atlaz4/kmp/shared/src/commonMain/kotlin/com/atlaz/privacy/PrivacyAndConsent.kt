package com.atlaz.privacy

/* ============================================================================
 * Atlaz v4 · Privacy, consent & data-rights boundaries.
 *
 * Atlaz handles a merchant's most sensitive asset — their supplier graph and
 * unit economics. These constants are surfaced in the UI so the merchant
 * always knows what data leaves the device and what never does.
 * ========================================================================== */
object PrivacyAndConsent {

    const val DATA_OWNERSHIP =
        "All trade data you enter — SKU Passports, supplier records, ledger events, unit economics — " +
        "belongs to you. Atlaz claims no ownership of your business data."

    const val NEVER_AUTO_SHARED =
        "Your supplier list, prices and margins are NEVER shared with other merchants or sold. " +
        "Sharing a SKU Passport is an explicit, high-risk action that requires your approval each time."

    const val AI_PROCESSING_NOTE =
        "AI features may process the inputs you provide to generate drafts. In this build all AI is mock " +
        "and runs locally. In a production build, AI requests would be sent to a model provider only with " +
        "your consent, and sensitive fields can be redacted."

    const val CONSENT_REQUIRED_FOR = listOf(
        "send_inquiry", "trigger_payment", "submit_listing", "share_supplier_data",
        "request_credit_terms", "generate_compliance_statement", "confirm_order"
    ).joinToString(", ")

    const val RIGHTS =
        "You may export (SKU Passport JSON) or delete your data at any time. Deletion removes the local " +
        "store; exported copies you have shared are outside Atlaz's control."

    fun requiresConsent(actionType: String): Boolean =
        listOf(
            "send_inquiry", "trigger_payment", "submit_listing", "share_supplier_data",
            "request_credit_terms", "generate_compliance_statement", "confirm_order"
        ).contains(actionType)
}
