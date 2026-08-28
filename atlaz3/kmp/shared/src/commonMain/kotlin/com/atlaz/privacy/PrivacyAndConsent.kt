package com.atlaz.privacy

import com.atlaz.domain.model.DataRightConsent

/**
 * Privacy & data-rights layer. Atlaz's data network effect is only defensible if
 * it is consent-first: merchants and suppliers own their data, sharing is opt-in,
 * anonymized, purpose-bound and revocable. This object centralizes those rules.
 */
object PrivacyPolicy {
    val principles = listOf(
        "Merchants own their SKU Passports, trade data and ledger.",
        "Cross-merchant insights are derived only from anonymized, consented signals.",
        "No personal data of end customers is collected in the MVP.",
        "Suppliers control whether their trust signals are shared into the graph.",
        "All data sharing is purpose-bound and revocable.",
        "No data is sold to third parties; aggregated insights only with consent."
    )

    val dataBoundaries = listOf(
        "Stored locally / in the merchant's workspace in the MVP (mock).",
        "Trade Loop Ledger is append-only and owned by the merchant.",
        "Tool integrations only transmit what the user approves.",
        "Compliance and finance outputs are estimates, never guarantees."
    )

    fun defaultConsent() = DataRightConsent(
        consentId = "DRC-001",
        scope = "anonymized trade-signal aggregation",
        anonymized = true,
        purpose = "Improve supplier trust scores and market signals for all merchants",
        grantedAt = "2026-05-01T00:00:00Z",
        revocable = true
    )
}
