import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { AdMobManager } from '../services/AdMobManager';
import { LocalizationService } from '../services/LocalizationService';
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
        try {
            const { width, height } = this.cameras.main;
            const isSmallScreen = width < 400;
            const i18n = LocalizationService.getInstance();

            // Background overlay
            this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

            // Game Over text
            const titleSize = isSmallScreen ? '36px' : '48px';
            this.add.text(width / 2, height * 0.25, i18n.get('GAME.GAME_OVER_TITLE'), {
                fontSize: titleSize,
                color: '#ff4444',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Final Score
            this.add.text(width / 2, height * 0.4, `${i18n.get('GAME.SCORE')}: ${data.score}`, {
                fontSize: isSmallScreen ? '24px' : '28px',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Buttons
            const btnW = Math.min(width * 0.75, 240);
            const btnH = 60;

            new Button(this, width / 2, height * 0.6, i18n.get('GAME.RETRY'), btnW, btnH, COLORS.UI_PRIMARY, () => {
                try { this.scene.start('Game', { levelId: data.levelId }); } catch (e) { }
            });

            new Button(this, width / 2, height * 0.7, i18n.get('WORLD_MAP.TITLE'), btnW, btnH, COLORS.UI_SECONDARY, () => {
                try { this.scene.start('WorldMap'); } catch (e) { }
            });

            new Button(this, width / 2, height * 0.8, i18n.get('GAME.MAIN_MENU'), btnW, btnH, COLORS.UI_SECONDARY, () => {
                try { this.scene.start('Menu'); } catch (e) { }
            });

            // Show interstitial ad
            this.time.delayedCall(500, () => {
                try { this.adMob.showInterstitial(); } catch (e) { }
            });
        } catch (e) {
            console.error('❌ GameOverScene error:', e);
        }
    }
}
