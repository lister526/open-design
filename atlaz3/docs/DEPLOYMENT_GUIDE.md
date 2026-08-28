# Atlaz — Production Deployment Advice (20 items)

The MVP is a prototype with mock data. To take Atlaz to production, address these 20 items.

1. **Backend & system of record.** Replace `MockDataProvider` with a real backend (Postgres for
   relational data + an append-only event store for the Trade Loop Ledger).
2. **Auth & accounts.** Add merchant sign-in (Apple/Google/email), org/team support for Enterprise.
3. **Sync layer.** Local cache + server sync behind the existing `TradeRepository` interface.
4. **Real AI service.** Swap `MockTradeAiService` for an LLM + tool-calling pipeline, keeping the
   17 method signatures and the 13-field envelope. Add prompt/version logging.
5. **Tool integrations.** Implement the 15 reserved tools per `API_INTEGRATION_ROADMAP.md`,
   gating every side effect behind the Agent Action approval flow.
6. **Secrets management.** Store API keys/credentials in a vault (never in the app bundle).
7. **Compliance data.** License real regulatory data; have professionals review the Compliance
   Route Engine outputs; keep the risk-only, not-legal-advice posture.
8. **Payments & finance.** Integrate payment/FX with strong approval gates; keep "no loan/profit
   guarantee" disclaimers; treat finance eligibility as referrals, never guarantees.
9. **Privacy & consent.** Implement `DataRightConsent` enforcement, anonymization pipelines, and
   revocation; comply with GDPR/CCPA and platform data policies.
10. **Security.** TLS everywhere, encryption at rest, least-privilege, audit logs, pen-testing.
11. **iOS release.** App Store provisioning, signing, privacy nutrition labels, TestFlight beta.
12. **Android release.** Play Console, signing, data-safety form (shared Compose code is ready).
13. **Observability.** Crash reporting, analytics (privacy-respecting), AI quality monitoring.
14. **Rate limiting & cost control.** Cap AI/tool spend per plan; cache deterministic results.
15. **Localization.** Complete translations for all 6 languages; add RTL support for Arabic markets.
16. **Accessibility.** VoiceOver/TalkBack, dynamic type, contrast — extend the design system.
17. **Performance.** Lazy-load lists, paginate the ledger, precompute Cash Scores where possible.
18. **Testing/CI.** Run the integrity harness + unit/UI tests in CI; add Compose UI tests.
19. **Legal.** Terms of Service, Privacy Policy, disclaimers surfaced in-app; entity & IP per
   `OWNERSHIP_NOTICE.md`.
20. **Data network rollout.** Launch consent at onboarding; begin populating the Supplier Trust
    Graph and Market Demand Signals from real, opt-in data (Phase 2–3).

## Web Preview hosting (the demoable artifact)
The `web/` folder is fully static and zero-dependency. Host it on any static host
(Cloudflare Pages, Netlify, GitHub Pages, S3+CloudFront) — no build step required.
```bash
cd web && python3 -m http.server 8080   # local
# or deploy the web/ directory as-is to any static host
```
