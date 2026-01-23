import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { LevelManager } from '@systems/LevelManager';
import { COLORS } from '@config/Constants';

/**
 * LevelCompleteScene - Screen shown after winning a level
 */
export class LevelCompleteScene extends Phaser.Scene {
    private levelManager: LevelManager;

    constructor() {
        super({ key: 'LevelComplete' });
        this.levelManager = LevelManager.getInstance();
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

        // Stars container background
        const starsY = height * 0.45;
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

        // Buttons
        new Button(this, width / 2, height * 0.65, 'NEXT LEVEL', 240, 60, COLORS.UI_PRIMARY, () => {
            const nextId = this.levelManager.getNextLevelId(data.levelId);
            if (nextId) {
                this.scene.start('Game', { levelId: nextId });
            } else {
                this.scene.start('WorldMap');
            }
        });

        new Button(this, width / 2, height * 0.75, 'LEVEL SELECT', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('WorldMap');
        });

        new Button(this, width / 2, height * 0.85, 'MAIN MENU', 240, 60, COLORS.UI_SECONDARY, () => {
            this.scene.start('Menu');
        });
    }
}
