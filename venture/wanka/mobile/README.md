# Wanka Mobile (iOS + Android) — Expo / React Native

The mobile apps are **thin clients over the same REST API** as the web SPA and the
WeChat Mini Program. There is exactly one backend (`../src/index.js`), so all three
surfaces stay in sync automatically.

## Why Expo
- One codebase → **iOS + Android** (satisfies the "web + iOS app + Android app" requirement).
- OTA updates, easy EAS builds, and first-class ad-SDK config plugins.

## Screens (mirror the web routes)
| Route | Purpose | API used |
|---|---|---|
| Home | pitch + CTA | `/api/config` |
| Studio | the single-player generation core | `/api/generate` |
| Templates | the network layer | `/api/templates`, `/api/templates/:id/use` |
| Creator | earnings dashboard | `/api/creator/earnings` |
| Account | auth, plan, credits | `/api/auth/*`, `/api/me`, `/api/billing/checkout` |

## Ad SDKs (AppLovin MAX + Meta Audience Network)
Server exposes non-secret client config at `/api/config → ads`. In the app:
- **AppLovin MAX** via `react-native-applovin-max` — rewarded ads grant credits
  (`rewardedCreditsContract()` in `../src/ads.js`), interstitial + banner on free tier.
- **Meta Audience Network** via the AppLovin MAX mediation adapter (recommended)
  or `react-native-fbads`.
- Config keys come from the server so you flip ads on/off without an app release.

See `../docs/AD_INTEGRATION.md` for the full wiring.

## Setup (when building for real)
```bash
cd venture/wanka/mobile
npx create-expo-app@latest .        # or copy this structure
# set API base:
#   app.json > expo.extra.apiBaseUrl = "https://<your-worker>.workers.dev"
npm install
npx expo start                       # dev
eas build -p ios                     # store build
eas build -p android
```

## app.json (extra config the client reads)
```json
{
  "expo": {
    "name": "Wanka",
    "slug": "wanka",
    "extra": {
      "apiBaseUrl": "https://wanka.example.workers.dev"
    },
    "plugins": ["react-native-applovin-max"]
  }
}
```

## Payment compliance
- iOS: digital credits/subscriptions must use **Apple IAP** (StoreKit). Route `/api/billing/checkout`
  is a stub — wire StoreKit on iOS and WeChat Pay / server receipts elsewhere.
- Android: Google Play Billing for digital goods.
- Web / WeChat Mini Program: WeChat Pay / Stripe.

> Note: This folder intentionally ships the **structure + client contract** rather than a
> full native build, because native builds require signing keys / store accounts the founder
> supplies at launch. The proven RN patterns from `../../meridian/mobile/` (8-lang i18n, RTL,
> AsyncStorage token, API client) are directly reusable here.
