import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdPluginEvents, InterstitialAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { getBannerAdId, getInterstitialAdId, getRewardedAdId, USE_TEST_ADS } from '@config/AdConfig';

/**
 * AdMobManager - Centralized AdMob ad management
 * Handles banner, interstitial, and rewarded ads
 */
export class AdMobManager {
    private static instance: AdMobManager;
    private isInitialized: boolean = false;
    private isBannerShowing: boolean = false;
    private lastInterstitialTime: number = 0;
    private readonly INTERSTITIAL_COOLDOWN = 30000; // 30 seconds
    private interstitialReady: boolean = false;
    private rewardedReady: boolean = false;

    private constructor() {
        // Listen for ad dismissal to fix layout issues
        if (Capacitor.isNativePlatform()) {
            this.setupAdListeners();
        }
    }

    private setupAdListeners(): void {
        // Interstitial Dismissed
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            this.forceResize();
        });

        // Rewarded Dismissed (or Closed)
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            this.forceResize();
        });
    }

    private forceResize(): void {
        // Force a resize event to fix Phaser layout on Android after ad close
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            // Double check after a short delay
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
        }, 100);
    }

    public static getInstance(): AdMobManager {
        if (!AdMobManager.instance) {
            AdMobManager.instance = new AdMobManager();
        }
        return AdMobManager.instance;
    }

    /**
     * Initialize AdMob (call once at app start)
     */
    public async initialize(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            console.log('AdMob: Not on native platform, skipping initialization');
            return;
        }

        if (this.isInitialized) {
            console.log('AdMob: Already initialized');
            return;
        }

        try {
            await AdMob.initialize({
                testingDevices: ['YOUR_DEVICE_ID_HERE'], // You can keep this or manage via config if needed
                initializeForTesting: USE_TEST_ADS
            });

            this.isInitialized = true;
            console.log(`✅ AdMob initialized successfully (Test Mode: ${USE_TEST_ADS})`);

            // Preload ads
            this.prepareInterstitial();
            this.prepareRewarded();
        } catch (error) {
            console.error('❌ AdMob initialization failed:', error);
        }
    }

    /**
     * Show banner ad at bottom of screen
     */
    public async showBanner(): Promise<void> {
        if (!this.isInitialized || this.isBannerShowing) return;

        try {
            const options: BannerAdOptions = {
                adId: getBannerAdId(),
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: USE_TEST_ADS
            };

            await AdMob.showBanner(options);
            this.isBannerShowing = true;
            console.log('📊 Banner ad shown');
        } catch (error) {
            console.error('Banner ad error:', error);
        }
    }

    /**
     * Hide banner ad
     */
    public async hideBanner(): Promise<void> {
        if (!this.isBannerShowing) return;

        try {
            await AdMob.hideBanner();
            this.isBannerShowing = false;
            console.log('📊 Banner ad hidden');
        } catch (error) {
            console.error('Hide banner error:', error);
        }
    }

    /**
     * Prepare interstitial ad
     */
    private async prepareInterstitial(): Promise<void> {
        try {
            await AdMob.prepareInterstitial({
                adId: getInterstitialAdId(),
                isTesting: USE_TEST_ADS
            });
            this.interstitialReady = true;
            console.log('📺 Interstitial ad prepared');
        } catch (error) {
            console.error('Prepare interstitial error:', error);
            this.interstitialReady = false;
        }
    }

    /**
     * Show interstitial ad (with cooldown)
     */
    public async showInterstitial(): Promise<boolean> {
        if (!this.isInitialized) return false;

        const now = Date.now();
        if (now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN) {
            console.log('⏳ Interstitial on cooldown');
            return false;
        }

        if (!this.interstitialReady) {
            console.log('⚠️ Interstitial not ready');
            await this.prepareInterstitial();
            return false;
        }

        try {
            await AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            this.interstitialReady = false;

            // Prepare next one
            setTimeout(() => this.prepareInterstitial(), 1000);

            console.log('📺 Interstitial ad shown');
            return true;
        } catch (error) {
            console.error('Show interstitial error:', error);
            this.interstitialReady = false;
            return false;
        }
    }

    /**
     * Prepare rewarded ad
     */
    private async prepareRewarded(): Promise<void> {
        try {
            await AdMob.prepareRewardVideoAd({
                adId: getRewardedAdId(),
                isTesting: USE_TEST_ADS
            });
            this.rewardedReady = true;
            console.log('🎁 Rewarded ad prepared');
        } catch (error) {
            console.error('Prepare rewarded error:', error);
            this.rewardedReady = false;
        }
    }

    /**
     * Show rewarded ad and return whether user watched it
     */
    public async showRewarded(): Promise<boolean> {
        if (!this.isInitialized) {
            console.log('⚠️ AdMob not initialized');
            return false;
        }

        if (!this.rewardedReady) {
            console.log('⚠️ Rewarded ad not ready, preparing...');
            try {
                await this.prepareRewarded();
                // Wait a bit for ad to be ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!this.rewardedReady) {
                    console.log('❌ Rewarded ad still not ready after prepare');
                    return false;
                }
            } catch (error) {
                console.error('❌ Failed to prepare rewarded ad:', error);
                return false;
            }
        }

        return new Promise((resolve) => {
            let rewarded = false;
            let resolved = false;
            let listeners: any[] = [];
            let timeoutId: any;

            // Cleanup function
            const cleanup = () => {
                if (resolved) return;
                resolved = true;

                if (timeoutId) clearTimeout(timeoutId);
                listeners.forEach(l => l.remove());
                listeners = [];
            };

            // Timeout safety (10 seconds - reduced from 15)
            timeoutId = setTimeout(() => {
                console.log('⏱️ Rewarded ad timeout - forcing resolve');
                cleanup();
                resolve(rewarded);
            }, 10000);

            // Listen for reward event
            listeners.push(AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
                console.log('🎁 User earned reward:', reward);
                rewarded = true;
            }));

            // Listen for dismissed event
            listeners.push(AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                console.log('👋 Rewarded ad dismissed');
                cleanup();
                resolve(rewarded);
            }));

            // Listen for failed to show
            listeners.push(AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
                console.error('❌ Rewarded ad failed to show:', error);
                cleanup();
                resolve(false);
            }));

            // Show ad
            AdMob.showRewardVideoAd()
                .then(() => {
                    this.rewardedReady = false;
                    console.log('📺 Rewarded ad show started');
                    // Prepare next ad
                    setTimeout(() => this.prepareRewarded(), 1000);
                })
                .catch((error) => {
                    console.error('❌ Show rewarded error inside promise:', error);
                    cleanup();
                    this.rewardedReady = false;
                    resolve(false);
                });
        });
    }

    /**
     * Check if rewarded ad is ready
     */
    public isRewardedReady(): boolean {
        return this.rewardedReady;
    }

    /**
     * Remove banner when leaving scene
     */
    public async removeBanner(): Promise<void> {
        if (!this.isBannerShowing) return;

        try {
            await AdMob.removeBanner();
            this.isBannerShowing = false;
            console.log('📊 Banner ad removed');
        } catch (error) {
            console.error('Remove banner error:', error);
        }
    }
}
