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
        const { width, height } = this.cameras.main;

        // Background overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        // Victory text
        this.add.text(width / 2, height * 0.2, 'LEVEL COMPLETE!', {
            fontSize: '36px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score
        this.add.text(width / 2, height * 0.3, `SCORE: ${data.score}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stars container background (Moved up)
        const starsY = height * 0.40;
        const panelWidth = 280;
        const panelHeight = 130;

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
        for (let i = 0; i < 3; i++) {
            const x = width / 2 + (i - 1) * 60;
            const isEarned = i < data.stars;

            const star = this.add.text(x, starsY, '⭐', {
                fontSize: '48px'
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

        // 2X KAZAN BUTTON (Moved up)
        const doubleBtn = new Button(this, width / 2, height * 0.58, '🎁 2X KAZAN', 240, 70, 0xffaa00, () => {
            this.handleDoubleReward(data, doubleBtn);
        });
        doubleBtn.setAlpha(0);
        this.tweens.add({
            targets: doubleBtn,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // Other buttons (Moved up)
        const nextBtn = new Button(this, width / 2, height * 0.68, 'NEXT LEVEL', 240, 60, COLORS.UI_PRIMARY, () => {
            this.goToNextLevel(data.levelId);
        });
        nextBtn.setAlpha(0);

        const selectBtn = new Button(this, width / 2, height * 0.78, 'LEVEL SELECT', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('WorldMap');
        });
        selectBtn.setAlpha(0);

        const menuBtn = new Button(this, width / 2, height * 0.88, 'MAIN MENU', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('Menu');
        });
        menuBtn.setAlpha(0);

        // Show other buttons after 2.5 seconds
        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: [nextBtn, selectBtn, menuBtn],
                alpha: 1,
                duration: 400,
                ease: 'Power2'
            });
        });

        // Show interstitial every 2 levels (only if double reward not claimed)
        if (data.levelId % 2 === 0 && !this.doubleRewardClaimed) {
            this.time.delayedCall(500, () => {
                this.adMob.showInterstitial();
            });
        }
    }

    private async handleDoubleReward(data: { levelId: number, score: number, stars: number }, button: Button): Promise<void> {
        // Disable button
        button.setAlpha(0.5);
        button.setInteractive(false);

        // Show rewarded ad
        const rewarded = await this.adMob.showRewarded();

        if (rewarded) {
            this.doubleRewardClaimed = true;

            // Calculate double stars
            const doubleStars = Math.min(data.stars * 2, 3); // Max 3 stars

            // Save double stars directly to storage
            this.storage.saveLevelScore(data.levelId, data.score, doubleStars);

            console.log(`✅ Double reward! ${data.stars} → ${doubleStars} stars`);

            // Show success feedback
            const successText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.6,
                `+${data.stars} BONUS ⭐`, {
                fontSize: '28px',
                color: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: successText,
                alpha: 1,
                y: successText.y - 20,
                duration: 500,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Auto go to next level after 1 second
                    this.time.delayedCall(1000, () => {
                        this.goToNextLevel(data.levelId);
                    });
                }
            });
        } else {
            // Ad failed, re-enable button
            button.setAlpha(1);
            button.setInteractive(true);
            console.log('❌ Rewarded ad failed');
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
