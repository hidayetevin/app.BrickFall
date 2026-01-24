import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

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

    // Test IDs (replace with your real IDs in production)
    private readonly ADS = {
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewarded: 'ca-app-pub-3940256099942544/5224354917'
    };

    private constructor() { }

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
                testingDevices: ['YOUR_DEVICE_ID_HERE'],
                initializeForTesting: true
            });

            this.isInitialized = true;
            console.log('✅ AdMob initialized successfully');

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
                adId: this.ADS.banner,
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: true
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
                adId: this.ADS.interstitial,
                isTesting: true
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
                adId: this.ADS.rewarded,
                isTesting: true
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
        if (!this.isInitialized) return false;

        if (!this.rewardedReady) {
            console.log('⚠️ Rewarded ad not ready');
            await this.prepareRewarded();
            return false;
        }

        return new Promise((resolve) => {
            let rewarded = false;
            let listenerHandle: any;

            // Listen for reward
            const handleReward = (reward: AdMobRewardItem) => {
                console.log('🎁 User earned reward:', reward);
                rewarded = true;
            };
            listenerHandle = AdMob.addListener(RewardAdPluginEvents.Rewarded, handleReward);

            // Show ad
            AdMob.showRewardVideoAd()
                .then(() => {
                    this.rewardedReady = false;
                    setTimeout(() => this.prepareRewarded(), 1000);

                    // Wait a bit for reward event
                    setTimeout(() => {
                        if (listenerHandle) {
                            listenerHandle.remove();
                        }
                        resolve(rewarded);
                    }, 500);
                })
                .catch((error) => {
                    console.error('Show rewarded error:', error);
                    if (listenerHandle) {
                        listenerHandle.remove();
                    }
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
