import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { StorageManager } from '@systems/StorageManager';
import { AdMobManager } from '../services/AdMobManager';
import { LocalizationService } from '../services/LocalizationService';
import { COLORS } from '@config/Constants';

/**
 * MenuScene - Main menu of the game
 */
export class MenuScene extends Phaser.Scene {
    private storage: StorageManager;
    private adMob: AdMobManager;

    constructor() {
        super({ key: 'Menu' });
        this.storage = StorageManager.getInstance();
        this.adMob = AdMobManager.getInstance();
    }

    create(): void {
        try {
            const { width, height } = this.cameras.main;
            const i18n = LocalizationService.getInstance();

            // Background
            this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

            // Title
            const isSmallScreen = width < 400;
            const titleFontSize = isSmallScreen ? '48px' : '64px';
            const titleString = `${i18n.get('MENU.TITLE_BRICK')}\n${i18n.get('MENU.TITLE_FALL')}`;
            const title = this.add.text(width / 2, height * 0.25, titleString, {
                fontSize: titleFontSize,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                lineSpacing: -10
            }).setOrigin(0.5);

            // Title animation
            this.tweens.add({
                targets: title,
                y: title.y + 10,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Buttons
            const btnW = Math.min(width * 0.7, 240);
            const btnH = 60;

            new Button(this, width / 2, height * 0.5, i18n.get('MENU.PLAY'), btnW, btnH, COLORS.UI_PRIMARY, () => {
                try { this.scene.start('WorldMap'); } catch (e) { }
            });

            // If progress exists, show continue
            const currentLevel = this.storage.getCurrentLevel();
            if (currentLevel > 1) {
                new Button(this, width / 2, height * 0.6, i18n.get('MENU.CONTINUE'), btnW, btnH, COLORS.UI_SECONDARY, () => {
                    try { this.scene.start('Game', { levelId: currentLevel }); } catch (e) { }
                });
            }

            // Settings button
            new Button(this, width / 2, height * 0.7, i18n.get('MENU.SETTINGS'), btnW, btnH, COLORS.UI_SECONDARY, () => {
                try { this.scene.start('Settings'); } catch (e) { }
            });

            // Version/Credit
            this.add.text(width / 2, height - 30, i18n.get('MENU.VERSION'), {
                fontSize: '12px',
                color: '#666666'
            }).setOrigin(0.5);

            // Total Stars
            const stars = this.storage.getTotalStars();
            this.add.text(20, 20, `⭐ ${stars}`, {
                fontSize: '20px',
                color: '#ffcc00',
                fontStyle: 'bold'
            });

            // Show Native Ad at bottom instead of banner
            const adHeight = 150; // Customize height for native ad
            this.adMob.showNativeAd(height - adHeight, 0, width, adHeight);
        } catch (e) {
            console.error('❌ MenuScene create error:', e);
        }
    }

    shutdown(): void {
        try {
            // Remove Native Ad when leaving menu
            this.adMob.hideNativeAd();
        } catch (e) {
            console.error('❌ MenuScene shutdown error:', e);
        }
    }
}
