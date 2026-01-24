import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { AdMobManager } from '../services/AdMobManager';
import { COLORS } from '@config/Constants';

/**
 * GameOverScene - Screen shown after losing all lives
 */
export class GameOverScene extends Phaser.Scene {
    private adMob: AdMobManager;

    constructor() {
        super({ key: 'GameOver' });
        this.adMob = AdMobManager.getInstance();
    }

    create(data: { levelId: number, score: number }): void {
        const { width, height } = this.cameras.main;

        // Background overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        // Game Over text
        this.add.text(width / 2, height * 0.25, 'GAME OVER', {
            fontSize: '48px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Final Score
        this.add.text(width / 2, height * 0.4, `SCORE: ${data.score}`, {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Buttons
        new Button(this, width / 2, height * 0.6, 'RETRY', 240, 60, COLORS.UI_PRIMARY, () => {
            this.scene.start('Game', { levelId: data.levelId });
        });

        new Button(this, width / 2, height * 0.7, 'LEVEL SELECT', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('WorldMap');
        });

        new Button(this, width / 2, height * 0.8, 'MAIN MENU', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('Menu');
        });

        // Show interstitial ad
        this.time.delayedCall(500, () => {
            this.adMob.showInterstitial();
        });
    }
}
