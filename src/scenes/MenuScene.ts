import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { StorageManager } from '@systems/StorageManager';
import { COLORS } from '@config/Constants';

/**
 * MenuScene - Main menu of the game
 */
export class MenuScene extends Phaser.Scene {
    private storage: StorageManager;

    constructor() {
        super({ key: 'Menu' });
        this.storage = StorageManager.getInstance();
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Title
        const title = this.add.text(width / 2, height * 0.25, 'BRICK\nFALL', {
            fontSize: '64px',
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
        new Button(this, width / 2, height * 0.5, 'PLAY', 240, 60, COLORS.UI_PRIMARY, () => {
            this.scene.start('WorldMap');
        });

        // If progress exists, show continue
        const currentLevel = this.storage.getCurrentLevel();
        if (currentLevel > 1) {
            new Button(this, width / 2, height * 0.6, 'CONTINUE', 240, 60, COLORS.UI_SECONDARY, () => {
                this.scene.start('Game', { levelId: currentLevel });
            });
        }

        // Settings button
        new Button(this, width / 2, height * 0.7, 'SETTINGS', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('Settings');
        });

        // Version/Credit
        this.add.text(width / 2, height - 30, 'v1.0.0 | 2026', {
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
    }
}
