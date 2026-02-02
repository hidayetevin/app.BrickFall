import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { LevelManager } from '@systems/LevelManager';
import { StorageManager } from '@systems/StorageManager';
import { AdMobManager } from '../services/AdMobManager';
import { COLORS } from '@config/Constants';

/**
 * LevelCompleteScene - Screen shown after winning a level
 */
export class LevelCompleteScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private storage: StorageManager;
    private adMob: AdMobManager;
    private doubleRewardClaimed: boolean = false;

    constructor() {
        super({ key: 'LevelComplete' });
        this.levelManager = LevelManager.getInstance();
        this.storage = StorageManager.getInstance();
        this.adMob = AdMobManager.getInstance();
    }

    create(data: { levelId: number, score: number, stars: number }): void {
        try {
            const { width, height } = this.cameras.main;
            const isSmallScreen = width < 400;

            // Background overlay
            this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

            // Victory text
            const titleFontSize = isSmallScreen ? '28px' : '36px';
            this.add.text(width / 2, height * 0.2, 'LEVEL COMPLETE!', {
                fontSize: titleFontSize,
                color: '#00ff88',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Score
            this.add.text(width / 2, height * 0.3, `SCORE: ${data.score}`, {
                fontSize: isSmallScreen ? '20px' : '24px',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Stars container background
            const starsY = height * 0.40;
            const panelWidth = Math.min(width * 0.8, 280);
            const panelHeight = isSmallScreen ? 110 : 130;

            // Background panel for stars
            const starsPanel = this.add.graphics();
            starsPanel.fillStyle(0x1a1a2e, 0.6);
            starsPanel.fillRoundedRect(
                width / 2 - panelWidth / 2,
                starsY - panelHeight / 2,
                panelWidth,
                panelHeight,
                20
            );

            // Stars
            const starSpacing = isSmallScreen ? 50 : 60;
            const starFontSize = isSmallScreen ? '40px' : '48px';
            for (let i = 0; i < 3; i++) {
                const x = width / 2 + (i - 1) * starSpacing;
                const isEarned = i < data.stars;

                const star = this.add.text(x, starsY, '⭐', {
                    fontSize: starFontSize,
                    padding: { top: 10, bottom: 10 } // Add padding to prevent emoji clipping
                }).setOrigin(0.5);

                if (!isEarned) star.setAlpha(0.2);

                if (isEarned) {
                    this.tweens.add({
                        targets: star,
                        scale: { from: 0, to: 1 },
                        delay: i * 200,
                        duration: 500,
                        ease: 'Back.easeOut'
                    });
                }
            }

            // Buttons
            const btnW = Math.min(width * 0.75, 240);
            const btnH = isSmallScreen ? 55 : 60;

            // Other buttons (needed for handleDoubleReward)
            const nextBtn = new Button(this, width / 2, height * 0.68, 'NEXT LEVEL', btnW, btnH, COLORS.UI_PRIMARY, () => {
                try { this.goToNextLevel(data.levelId); } catch (e) { }
            });
            nextBtn.setAlpha(0);

            const selectBtn = new Button(this, width / 2, height * 0.78, 'LEVEL SELECT', btnW, btnH, COLORS.UI_SECONDARY, () => {
                try { this.scene.start('WorldMap'); } catch (e) { }
            });
            selectBtn.setAlpha(0);

            const menuBtn = new Button(this, width / 2, height * 0.88, 'MAIN MENU', btnW, btnH, COLORS.UI_SECONDARY, () => {
                try { this.scene.start('Menu'); } catch (e) { }
            });
            menuBtn.setAlpha(0);

            // 2X KAZAN BUTTON
            const otherButtons = [nextBtn, selectBtn, menuBtn];
            const doubleBtn = new Button(this, width / 2, height * 0.58, '🎁 2X KAZAN', btnW, btnH + 10, 0xffaa00, () => {
                try { this.handleDoubleReward(data, doubleBtn, otherButtons); } catch (e) { }
            });
            doubleBtn.setAlpha(0);

            this.tweens.add({
                targets: doubleBtn,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });

            // Show other buttons after a delay
            this.time.delayedCall(2000, () => {
                try {
                    this.tweens.add({
                        targets: [nextBtn, selectBtn, menuBtn],
                        alpha: 1,
                        duration: 400,
                        ease: 'Power2'
                    });
                } catch (e) { }
            });

            // Show interstitial ad
            if (data.levelId % 2 === 0 && !this.doubleRewardClaimed) {
                this.time.delayedCall(500, () => {
                    try { this.adMob.showInterstitial(); } catch (e) { }
                });
            }
        } catch (e) {
            console.error('❌ LevelCompleteScene error:', e);
        }
    }

    private async handleDoubleReward(data: { levelId: number, score: number, stars: number }, button: Button, otherButtons: Button[]): Promise<void> {
        // Prevent multiple clicks
        if (this.doubleRewardClaimed) return;

        // Disable ALL buttons
        button.setEnabled(false);
        otherButtons.forEach(btn => btn.setEnabled(false));

        // Show loading indicator
        const { width, height } = this.cameras.main;
        const loadingText = this.add.text(width / 2, height * 0.52, 'Loading ad...', {
            fontSize: '18px',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2000);

        try {
            // Set a safety timeout (15 seconds total)
            const timeoutPromise = new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(false), 15000);
            });

            // Race between ad and timeout
            const rewarded = await Promise.race([
                this.adMob.showRewarded(),
                timeoutPromise
            ]);

            // Remove loading text
            loadingText.destroy();

            if (rewarded) {
                this.doubleRewardClaimed = true;
                const doubleStars = Math.min(data.stars * 2, 3);
                this.storage.saveLevelScore(data.levelId, data.score, doubleStars);

                // Show success feedback
                const successText = this.add.text(width / 2, height * 0.6, `+${data.stars} BONUS ⭐`, {
                    fontSize: '28px', color: '#ffaa00', fontStyle: 'bold'
                }).setOrigin(0.5).setAlpha(0).setDepth(2000);

                this.tweens.add({
                    targets: successText,
                    alpha: 1,
                    y: successText.y - 20,
                    duration: 500,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.time.delayedCall(1000, () => this.goToNextLevel(data.levelId));
                    }
                });
            } else {
                // Ad failed or cancelled
                const errorText = this.add.text(width / 2, height * 0.52, 'Ad not completed', {
                    fontSize: '16px', color: '#ff6666'
                }).setOrigin(0.5).setDepth(2000);

                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: errorText, alpha: 0, duration: 300,
                        onComplete: () => {
                            errorText.destroy();
                            // Re-enable buttons only after error message is gone
                            button.setEnabled(true);
                            otherButtons.forEach(btn => btn.setEnabled(true));
                        }
                    });
                });
            }
        } catch (error) {
            console.error('❌ Reward error:', error);
            if (loadingText) loadingText.destroy();
            button.setEnabled(true);
            otherButtons.forEach(btn => btn.setEnabled(true));
        }
    }

    private goToNextLevel(currentLevelId: number): void {
        const nextId = this.levelManager.getNextLevelId(currentLevelId);
        if (nextId) {
            this.scene.start('Game', { levelId: nextId });
        } else {
            this.scene.start('WorldMap');
        }
    }
}
