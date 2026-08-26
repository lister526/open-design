# Ad Platform Integration — AppLovin MAX + Meta

Wanka uses ad platforms in **two distinct ways** (see founding kit §5):

1. **Monetization** — show ads to free-tier mobile users (rewarded / interstitial / banner).
2. **Placement (closed loop)** — merchants who *make* creatives in Wanka can *push* them
   to Meta Ads / AppLovin as campaigns. We make the ad AND help place it.

The backend never ships ad-account secrets to clients. It exposes only **non-secret client
config** at `GET /api/config → ads`, driven by these env vars:

| Env var | Role | Client-safe? |
|---|---|---|
| `APPLOVIN_SDK_KEY` | AppLovin MAX SDK key | yes (client) |
| `APPLOVIN_REWARDED_UNIT` / `_INTERSTITIAL_UNIT` / `_BANNER_UNIT` | ad unit ids | yes |
| `META_AN_PLACEMENT` | Meta Audience Network placement | yes |
| `META_PIXEL_ID` | web/app pixel | yes |
| `META_ADS_ACCESS_TOKEN` | Graph API token to CREATE ads (placement) | **secret, server-only** |

Set secrets with: `wrangler secret put META_ADS_ACCESS_TOKEN` (never commit them).

---

## 1. Monetization — AppLovin MAX (mediates Meta Audience Network)

### Mobile (Expo / RN)
```bash
npm install react-native-applovin-max
```
```js
import AppLovinMAX from 'react-native-applovin-max';
import { getConfig } from '../lib/api';

const cfg = await getConfig();
if (cfg.ads.applovin.enabled) {
  await AppLovinMAX.initialize(cfg.ads.applovin.sdk_key);
  // Rewarded ad → grant credits (server verifies the callback)
  AppLovinMAX.loadRewardedAd(cfg.ads.applovin.units.rewarded);
  AppLovinMAX.addEventListener('OnRewardedAdReceivedRewardEvent', async () => {
    // Client shows success; server grants via the S2S reward callback (below).
  });
}
```
Add **Meta Audience Network** as a mediation adapter inside the AppLovin dashboard so
Meta demand fills the same MAX ad units (recommended over integrating Meta AN directly).

### Reward flow (IMPLEMENTED)

There are **two** endpoints, already live in `src/index.js`:

1. **`POST /api/ads/reward`** (client, optimistic) — the mobile app calls this right after a
   rewarded ad completes (`src/lib/ads.js → rewardedAd()` → `api.claimRewardedCredits()`).
   Grants a fixed **5 credits** server-side (never trusts a client-sent amount) and is
   **daily-capped at 50 credits/user** for anti-abuse.

2. **`GET /api/ads/applovin/s2s`** (AppLovin server-to-server, **authoritative**) — configure
   this URL in the AppLovin dashboard → *Account → Rewarded Callback*:
   ```
   https://YOUR_DOMAIN/api/ads/applovin/s2s?user_id={USER_ID}&amount={AMOUNT}&event_id={EVENT_ID}&secret=YOUR_SECRET
   ```
   - Pass the logged-in Wanka user id as AppLovin's custom `user_id`.
   - Verified with a shared secret: `wrangler secret put APPLOVIN_S2S_SECRET`.
   - **Idempotent** by `event_id` (won't double-grant on retries).

The reward amount contract is defined in `src/ads.js → rewardedCreditsContract()`
(5 credits per rewarded view). To change it, edit that one function.

---

## 2. Placement — push a Wanka creative to Meta Ads

`src/ads.js → toMetaCreative(asset, opts)` builds a Graph API creative payload from any
generated asset. At deploy, add a server route that:
1. renders the asset media (image/video),
2. uploads it to Meta (`adimages` / `advideos`) to get `image_hash` / `video_id`,
3. creates the `adcreative` with `toMetaCreative()`,
4. creates the campaign/adset/ad under the merchant's ad account.

This is the **closed loop**: content creation → one-click ad placement → outcome data
flows back (which creative converted) → strengthens the template ranking (the moat).

---

## 3. Web pixel (attribution)
When `META_PIXEL_ID` is set, inject the Meta Pixel on the web SPA to attribute
signups/checkouts. AppLovin/GA equivalents optional.

## 4. Flip ads on/off without a release
Because the client reads `/api/config`, you enable/disable or swap ad units purely by
changing env vars and redeploying the Worker — no app-store review needed.
