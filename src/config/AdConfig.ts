/**
 * AdMob configuration for Android
 */

// Toggle between test and production ads
export const USE_TEST_ADS = false;

// Banner Ad IDs
export const BANNER_AD_ID = {
    // Use test IDs during development
    TEST: 'ca-app-pub-3940256099942544/6300978111',
    // Replace with your actual AdMob IDs before production
    ANDROID: 'ca-app-pub-4190858087915294/5570806007',
};

// Interstitial Ad IDs
export const INTERSTITIAL_AD_ID = {
    TEST: 'ca-app-pub-3940256099942544/1033173712',
    ANDROID: 'ca-app-pub-4190858087915294/2848040360',
};

// Rewarded Ad IDs (for future use)
export const REWARDED_AD_ID = {
    TEST: 'ca-app-pub-3940256099942544/5224354917',
    ANDROID: 'ca-app-pub-4190858087915294/8085288709',
};

// Ad display settings
export const AD_CONFIG = {
    // Show interstitial after every N level completions
    interstitialFrequency: 2,
    // Show banner on these scenes
    bannerScenes: ['Menu', 'WorldMap'],
    // Minimum time between interstitials (ms)
    interstitialCooldown: 30000, // 30 seconds
};

/**
 * Get the appropriate ad ID based on current environment
 */
export function getBannerAdId(): string {
    return USE_TEST_ADS ? BANNER_AD_ID.TEST : BANNER_AD_ID.ANDROID;
}

export function getInterstitialAdId(): string {
    return USE_TEST_ADS ? INTERSTITIAL_AD_ID.TEST : INTERSTITIAL_AD_ID.ANDROID;
}

export function getRewardedAdId(): string {
    return USE_TEST_ADS ? REWARDED_AD_ID.TEST : REWARDED_AD_ID.ANDROID;
}

// Native Ad IDs
export const NATIVE_AD_ID = {
    TEST: 'ca-app-pub-3940256099942544/2247696110', // Test Native Advanced
    ANDROID: 'ca-app-pub-4190858087915294/7185668793', // Replace with actual ID
};

export function getNativeAdId(): string {
    return USE_TEST_ADS ? NATIVE_AD_ID.TEST : NATIVE_AD_ID.ANDROID;
}
