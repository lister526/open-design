// ads.js — ad-platform integration surface (AppLovin MAX + Meta Audience Network).
//
// Two roles ads play in Wanka (per founding kit §5):
//   1) MONETIZATION: show ads to free-tier users (mobile) via AppLovin MAX / Meta AN.
//   2) PLACEMENT: merchants who make creatives here can push them to Meta Ads / AppLovin
//      as ad campaigns (closed loop: we make the creative AND help place it).
//
// The server exposes non-secret client config; secrets (ad account tokens) live in
// env and are only used server-side when actually calling the ad platform APIs.

export function adConfig(env) {
  return {
    applovin: {
      enabled: !!env.APPLOVIN_SDK_KEY,
      sdk_key: env.APPLOVIN_SDK_KEY || null,          // safe to expose to mobile client
      units: {
        rewarded: env.APPLOVIN_REWARDED_UNIT || null, // watch-ad-for-credits
        interstitial: env.APPLOVIN_INTERSTITIAL_UNIT || null,
        banner: env.APPLOVIN_BANNER_UNIT || null,
      },
    },
    meta: {
      // Audience Network placement id for in-app ads (client-safe)
      audience_network_placement: env.META_AN_PLACEMENT || null,
      // Whether "publish to Meta Ads" is available (requires server-side token)
      ads_placement_enabled: !!env.META_ADS_ACCESS_TOKEN,
      pixel_id: env.META_PIXEL_ID || null,            // client-safe
    },
  };
}

// Build a Meta Ads "create ad creative" payload from a Wanka asset.
// (Wire the real Graph API call at deploy; kept pure/testable here.)
export function toMetaCreative(asset, opts = {}) {
  return {
    name: opts.name || `Wanka ${asset.kind} ${asset.lang}`,
    object_story_spec: {
      page_id: opts.page_id || null,
      link_data: {
        message: asset.body || asset.headline || '',
        link: opts.link || '',
        name: asset.headline || asset.title || '',
        call_to_action: { type: 'LEARN_MORE' },
      },
    },
    // image_hash / video_id filled after uploading the rendered media
    degrees_of_freedom_spec: { creative_features_spec: { standard_enhancements: { enroll_status: 'OPT_IN' } } },
  };
}

// Build an AppLovin rewarded-ad -> credits grant contract (server verifies callback).
export function rewardedCreditsContract() {
  return { reward_amount: 5, reward_currency: 'credits', verify: 'server_side_callback' };
}
