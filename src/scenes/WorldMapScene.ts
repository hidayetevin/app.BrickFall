import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { LevelManager } from '@systems/LevelManager';
import { StorageManager } from '@systems/StorageManager';
import { AdMobManager } from '../services/AdMobManager';
import { WORLDS } from '@config/LevelData';
import { COLORS } from '@config/Constants';

/**
 * WorldMapScene - Level selection screen
 */
export class WorldMapScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private storage: StorageManager;
    private adMob: AdMobManager;
    private container!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'WorldMap' });
        this.levelManager = LevelManager.getInstance();
        this.storage = StorageManager.getInstance();
        this.adMob = AdMobManager.getInstance();
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Header
        const header = this.add.container(0, 0);
        const headerBg = this.add.rectangle(0, 0, width, 80, 0x0f3460).setOrigin(0);
        const title = this.add.text(width / 2, 40, 'LEVELS', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const backBtn = new Button(this, 50, 40, '←', 60, 40, 0x16213e, () => {
            this.scene.start('Menu');
        });

        header.add([headerBg, title, backBtn]);
        header.setDepth(10);

        // Scrollable area
        this.container = this.add.container(0, 100);

        let currentY = 0;

        WORLDS.forEach(world => {
            const isUnlocked = this.storage.isWorldUnlocked(world.id);
            const progress = this.levelManager.getWorldProgress(world.id);

            // World header
            const worldHeader = this.add.text(width / 2, currentY, world.name, {
                fontSize: '24px',
                color: isUnlocked ? '#ffffff' : '#666666',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add(worldHeader);
            currentY += 40;

            const starInfo = this.add.text(width / 2, currentY, `${progress.stars}/${progress.maxStars} ⭐`, {
                fontSize: '16px',
                color: '#ffcc00'
            }).setOrigin(0.5);
            this.container.add(starInfo);
            currentY += 50;

            // Unlock requirement if locked
            if (!isUnlocked) {
                const lockInfo = this.add.text(width / 2, currentY, `Locked: Needs ${world.unlockStars} ⭐`, {
                    fontSize: '14px',
                    color: '#ff4444'
                }).setOrigin(0.5);
                this.container.add(lockInfo);
                currentY += 40;
            }

            // Level grid
            const cols = 4;
            const spacing = 75;
            const startX = (width - (cols - 1) * spacing) / 2;

            world.levels.forEach((levelId, index) => {
                const r = Math.floor(index / cols);
                const c = index % cols;

                const lx = startX + c * spacing;
                const ly = currentY + r * spacing;

                const isLevelUnlocked = this.storage.isLevelUnlocked(levelId) && isUnlocked;
                const stars = this.storage.getLevelStars(levelId);

                // Level button
                const btn = new Button(this, lx, ly, levelId.toString(), 60, 60, isLevelUnlocked ? 0x0f3460 : 0x222222, () => {
                    if (isLevelUnlocked) {
                        this.scene.start('Game', { levelId });
                    }
                });

                if (!isLevelUnlocked) btn.setAlpha(0.5);
                this.container.add(btn);

                // Level stars
                if (stars > 0) {
                    const starText = this.add.text(lx, ly + 25, '⭐'.repeat(stars), {
                        fontSize: '12px'
                    }).setOrigin(0.5);
                    this.container.add(starText);
                }
            });

            currentY += Math.ceil(world.levels.length / cols) * spacing + 60;
        });

        // Add dummy spacing at end for scrolling
        const dummy = this.add.rectangle(0, currentY, 1, 1);
        this.container.add(dummy);

        // Simple touch scroll handling
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                this.container.y += pointer.velocity.y;
                // Clamp scrolling
                const minScroll = height - currentY - 150;
                this.container.y = Phaser.Math.Clamp(this.container.y, minScroll, 100);
            }
        });

        // Show banner ad
        this.adMob.showBanner();
    }

    shutdown(): void {
        // Remove banner when leaving
        this.adMob.removeBanner();
    }
}
