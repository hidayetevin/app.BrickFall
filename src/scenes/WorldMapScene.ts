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
    private startY: number = 0;
    private isDragging: boolean = false;
    private dragThreshold: number = 10;
    private maxScroll: number = 0;

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
        const headerBg = this.add.rectangle(0, 0, width, 100, 0x0f3460).setOrigin(0);
        headerBg.setFillStyle(0x0f3460, 0.95);

        // Add a bottom line for the header
        const headerLine = this.add.rectangle(0, 98, width, 2, 0x00d2ff).setOrigin(0);

        const title = this.add.text(width / 2, 50, 'LEVEL SELECTION', {
            fontSize: '24px',
            color: '#00d2ff',
            fontStyle: '900',
            letterSpacing: 2
        }).setOrigin(0.5);

        const backBtn = new Button(this, 50, 50, '←', 60, 50, 0x16213e, () => {
            if (!this.isDragging) this.scene.start('Menu');
        });

        header.add([headerBg, headerLine, title, backBtn]);
        header.setDepth(100);

        // Scrollable area
        this.container = this.add.container(0, 120);

        let currentY = 20;

        WORLDS.forEach((world) => {
            const isUnlocked = this.storage.isWorldUnlocked(world.id);
            const progress = this.levelManager.getWorldProgress(world.id);

            // World Section Background (Subtle)
            const sectionBg = this.add.rectangle(width / 2, currentY + 100, width - 40, 200, 0x1a1a2e)
                .setOrigin(0.5, 0)
                .setStrokeStyle(1, 0x0f3460, 0.5);
            this.container.add(sectionBg);

            // World title
            const worldHeader = this.add.text(width / 2, currentY, world.name.toUpperCase(), {
                fontSize: '20px',
                color: isUnlocked ? '#ffffff' : '#4a4a4a',
                fontStyle: 'bold',
                letterSpacing: 1
            }).setOrigin(0.5);
            this.container.add(worldHeader);
            currentY += 35;

            // World stars with icons
            const starStr = `${progress.stars}/${progress.maxStars} ⭐`;
            const starInfo = this.add.text(width / 2, currentY, starStr, {
                fontSize: '14px',
                color: isUnlocked ? '#ffcc00' : '#4a4a4a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add(starInfo);
            currentY += 45;

            // Unlock requirement if locked
            if (!isUnlocked) {
                const lockInfo = this.add.text(width / 2, currentY, `🔒 REACH ${world.unlockStars} STARS TO UNLOCK`, {
                    fontSize: '12px',
                    color: '#ff4444',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                this.container.add(lockInfo);
                currentY += 30;
            }

            // Level grid
            const cols = 4;
            const spacing = 80;
            const startX = (width - (cols - 1) * spacing) / 2;

            world.levels.forEach((levelId, index) => {
                const r = Math.floor(index / cols);
                const c = index % cols;

                const lx = startX + c * spacing;
                const ly = currentY + r * spacing + 30;

                const isLevelUnlocked = this.storage.isLevelUnlocked(levelId) && isUnlocked;
                const stars = this.storage.getLevelStars(levelId);

                // Level card
                const levelColor = isLevelUnlocked ? 0x0f3460 : 0x1a1a1a;
                const btn = new Button(this, lx, ly, levelId.toString(), 65, 65, levelColor, () => {
                    if (isLevelUnlocked && !this.isDragging) {
                        this.scene.start('Game', { levelId });
                    }
                });

                if (!isLevelUnlocked) {
                    btn.setAlpha(0.3);
                } else {
                    // Add a subtle glow/border to unlocked buttons
                    const glow = this.add.rectangle(0, 0, 68, 68, 0x00d2ff, 0.2).setOrigin(0.5);
                    btn.addAt(glow, 0);
                }

                this.container.add(btn);

                // Stars below levels
                if (isLevelUnlocked) {
                    const starLayout = this.add.text(lx, ly + 28, '⭐'.repeat(stars) || '☆☆☆', {
                        fontSize: '10px',
                        color: stars > 0 ? '#ffcc00' : '#444444'
                    }).setOrigin(0.5);
                    this.container.add(starLayout);
                }
            });

            const gridRows = Math.ceil(world.levels.length / cols);
            const gridHeight = gridRows * spacing + 40;
            sectionBg.height = gridHeight + (isUnlocked ? 80 : 110);

            currentY += gridHeight + 100;
        });

        this.maxScroll = height - currentY - 200;

        // --- FIXED SCROLL LOGIC ---
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            try {
                this.startY = pointer.y;
                this.isDragging = false;
            } catch (e) {
                console.error('❌ Scroll start error:', e);
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            try {
                if (pointer.isDown) {
                    const dy = pointer.y - this.startY;

                    if (!this.isDragging && Math.abs(dy) > this.dragThreshold) {
                        this.isDragging = true;
                    }

                    if (this.isDragging) {
                        // Move container based on mouse movement delta
                        const deltaMove = pointer.y - pointer.prevPosition.y;
                        this.container.y += deltaMove;

                        // Clamping
                        if (this.container.y > 120) this.container.y = 120;
                        if (this.container.y < this.maxScroll) this.container.y = this.maxScroll;
                    }
                }
            } catch (e) {
                console.error('❌ Scrolling error:', e);
                this.isDragging = false;
            }
        });

        this.input.on('pointerup', () => {
            try {
                // End dragging state shortly after finger lift to avoid triggering clicks
                this.time.delayedCall(50, () => {
                    this.isDragging = false;
                });
            } catch (e) {
                console.error('❌ Scroll end error:', e);
                this.isDragging = false;
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
