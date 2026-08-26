// AppLovin MAX rewarded-ad wrapper.
//
// This module is written so the app BUILDS AND RUNS with zero native ad deps
// (Expo Go / dev). When you add the real SDK for a production build:
//
//   npx expo install react-native-applovin-max   (or your chosen MAX wrapper)
//   then set EXPO_PUBLIC_APPLOVIN_SDK_KEY + rewarded ad unit id (app.json extra)
//
// and replace the mock branch below with the real AppLovinMAX calls.
// AppLovin MAX mediates Meta Audience Network, so Meta demand flows through here too.
import Constants from 'expo-constants';

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
const SDK_KEY = process.env.EXPO_PUBLIC_APPLOVIN_SDK_KEY || extra.applovinSdkKey || '';
const REWARDED_UNIT = process.env.EXPO_PUBLIC_APPLOVIN_REWARDED_UNIT || extra.applovinRewardedUnit || '';

let AppLovinMAX = null;
try {
  // Optional native dep — absent in Expo Go / dev. Wrapped so bundling never fails.
  // eslint-disable-next-line global-require, import/no-unresolved
  AppLovinMAX = require('react-native-applovin-max');
} catch (_) { AppLovinMAX = null; }

let _inited = false;
async function ensureInit() {
  if (_inited || !AppLovinMAX || !SDK_KEY) return;
  await AppLovinMAX.initialize(SDK_KEY);
  _inited = true;
}

/**
 * Show a rewarded ad. Resolves { amount, label } when reward is granted,
 * rejects if the ad fails or the user closes before completion.
 * Falls back to an instant mock reward in dev (no SDK / no key).
 */
export async function rewardedAd() {
  if (!AppLovinMAX || !SDK_KEY || !REWARDED_UNIT) {
    // Dev / preview: grant a mock reward so the flow is fully testable.
    await new Promise((r) => setTimeout(r, 600));
    return { amount: 5, label: 'credits', _mock: true };
  }
  await ensureInit();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      AppLovinMAX.removeEventListener('OnRewardedAdReceivedRewardEvent');
      AppLovinMAX.removeEventListener('OnRewardedAdHiddenEvent');
      AppLovinMAX.removeEventListener('OnRewardedAdLoadFailedEvent');
      AppLovinMAX.removeEventListener('OnRewardedAdFailedToDisplayEvent');
    };
    let rewarded = null;
    AppLovinMAX.addEventListener('OnRewardedAdReceivedRewardEvent', (ad) => { rewarded = { amount: Number(ad?.rewardAmount) || 5, label: ad?.rewardLabel || 'credits' }; });
    AppLovinMAX.addEventListener('OnRewardedAdHiddenEvent', () => { cleanup(); rewarded ? resolve(rewarded) : reject(new Error('closed_before_reward')); });
    AppLovinMAX.addEventListener('OnRewardedAdLoadFailedEvent', (e) => { cleanup(); reject(new Error('load_failed')); });
    AppLovinMAX.addEventListener('OnRewardedAdFailedToDisplayEvent', () => { cleanup(); reject(new Error('display_failed')); });

    AppLovinMAX.addEventListener('OnRewardedAdLoadedEvent', () => AppLovinMAX.showRewardedAd(REWARDED_UNIT));
    AppLovinMAX.loadRewardedAd(REWARDED_UNIT);
  });
}
