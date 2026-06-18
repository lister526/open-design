# Privacy Notes

## What data Atlaz handles
A merchant's most sensitive assets: their **supplier list, unit prices, margins,
SKU Passports, and trade ledger**. Atlaz treats these as the user's property.

## In this build
- All AI is **mock and local**; no data is sent to any model provider.
- All adapters are mock; no data is sent to any third party.
- The web prototype stores only a small onboarding flag in `localStorage`.

## In a production build (design intent)
- **Data ownership:** the merchant owns all their trade data (`OWNERSHIP_NOTICE.md`).
- **Never sold or cross-shared:** supplier lists, prices, and margins are never
  shared with other merchants or sold.
- **Consent-gated AI:** AI requests sent to a model provider only with consent;
  sensitive fields (prices, supplier identities) can be redacted first.
- **High-risk = explicit consent each time:** `send_inquiry, trigger_payment,
  submit_listing, share_supplier_data, request_credit_terms,
  generate_compliance_statement, confirm_order`.
- **Rights:** export (SKU Passport JSON) or delete at any time.
- **Audit:** every meaningful action is logged in the Trade Loop Ledger.

## Applicable law
A production deployment must comply with GDPR (EU), CCPA/CPRA (California), and
other applicable regimes. See `DATA_RIGHTS_AND_PRIVACY_BOUNDARIES.md` for the
boundary rules and `LEGAL_LIMITATIONS.md` for honest current status.
