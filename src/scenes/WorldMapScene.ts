import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { LevelManager } from '@systems/LevelManager';
import { StorageManager } from '@systems/StorageManager';
import { AdMobManager } from '../services/AdMobManager';
import { LocalizationService } from '../services/LocalizationService';
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
        const isSmallScreen = width < 400;
        const headerH = isSmallScreen ? 80 : 100;
        const header = this.add.container(0, 0);
        const headerBg = this.add.rectangle(0, 0, width, headerH, 0x0f3460).setOrigin(0);
        headerBg.setFillStyle(0x0f3460, 0.95);

        // Add a bottom line for the header
        const headerLine = this.add.rectangle(0, headerH - 2, width, 2, 0x00d2ff).setOrigin(0);
        const i18n = LocalizationService.getInstance();

        const titleFontSize = isSmallScreen ? '18px' : '24px';
        const title = this.add.text(width / 2 + 20, headerH / 2, i18n.get('WORLD_MAP.TITLE'), {
            fontSize: titleFontSize,
            color: '#00d2ff',
            fontStyle: '900',
            letterSpacing: isSmallScreen ? 1 : 2
        }).setOrigin(0.5);

        const backBtn = new Button(this, 50, headerH / 2, '←', 60, headerH - 30, 0x16213e, () => {
            try {
                if (!this.isDragging) this.scene.start('Menu');
            } catch (e) {
                console.error('❌ Back button click error:', e);
            }
        });

        header.add([headerBg, headerLine, title, backBtn]);
        header.setDepth(100);

        // Scrollable area
        this.container = this.add.container(0, isSmallScreen ? 100 : 120);

        let currentY = 20;

        // Dynamic Grid Calculation
        const panelMargin = 20;
        const panelPadding = 40;
        const availableGridWidth = width - (panelMargin * 2) - (panelPadding * 2);

        const minSpacing = isSmallScreen ? 70 : 80;
        const cols = Math.max(1, Math.floor(availableGridWidth / minSpacing));

        // Use a fixed spacing or distribute if multiple columns
        const spacing = cols > 1 ? availableGridWidth / (cols - 1) : 0;
        const startX = width / 2 - ((cols - 1) * spacing) / 2;

        WORLDS.forEach((world) => {
            const isUnlocked = this.storage.isWorldUnlocked(world.id);
            const progress = this.levelManager.getWorldProgress(world.id);

            // World title
            const worldHeader = this.add.text(width / 2, currentY, world.name.toUpperCase(), {
                fontSize: isSmallScreen ? '18px' : '22px',
                color: isUnlocked ? '#ffffff' : '#4a4a4a',
                fontStyle: 'bold',
                letterSpacing: 1
            }).setOrigin(0.5);
            this.container.add(worldHeader);
            currentY += 35;

            // World stars with icons
            const starStr = `${progress.stars}/${progress.maxStars} ⭐`;
            const starInfo = this.add.text(width / 2, currentY, starStr, {
                fontSize: isSmallScreen ? '12px' : '14px',
                color: isUnlocked ? '#ffcc00' : '#4a4a4a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add(starInfo);
            currentY += 45;

            // Unlock requirement if locked
            if (!isUnlocked) {
                const lockText = i18n.get('WORLD_MAP.WORLD_LOCKED', world.unlockStars);
                const lockInfo = this.add.text(width / 2, currentY, `🔒 ${lockText}`, {
                    fontSize: isSmallScreen ? '10px' : '12px',
                    color: '#ff4444',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                this.container.add(lockInfo);
                currentY += 30;
            }

            // Grid start Y
            const gridStartY = currentY;
            const cardSize = isSmallScreen ? 55 : 65;
            const rowHeight = isSmallScreen ? 80 : 95;

            world.levels.forEach((levelId, index) => {
                const r = Math.floor(index / cols);
                const c = index % cols;

                const lx = startX + c * spacing;
                const ly = gridStartY + r * rowHeight + (cardSize / 2);

                const isLevelUnlocked = this.storage.isLevelUnlocked(levelId) && isUnlocked;
                const stars = this.storage.getLevelStars(levelId);

                // Level card
                const levelColor = isLevelUnlocked ? 0x0f3460 : 0x1a1a1a;
                const btn = new Button(this, lx, ly, levelId.toString(), cardSize, cardSize, levelColor, () => {
                    try {
                        if (isLevelUnlocked && !this.isDragging) {
                            this.scene.start('Game', { levelId });
                        }
                    } catch (e) {
                        console.error('❌ Level button click error:', e);
                    }
                });

                if (!isLevelUnlocked) {
                    btn.setAlpha(0.3);
                } else {
                    const glowSize = cardSize + 4;
                    const glow = this.add.rectangle(0, 0, glowSize, glowSize, 0x00d2ff, 0.2).setOrigin(0.5);
                    btn.addAt(glow, 0);
                }

                this.container.add(btn);

                // Stars below levels
                if (isLevelUnlocked) {
                    const starLayout = this.add.text(lx, ly + (cardSize / 2) + 12, '⭐'.repeat(stars) || '☆☆☆', {
                        fontSize: isSmallScreen ? '9px' : '11px',
                        color: stars > 0 ? '#ffcc00' : '#444444'
                    }).setOrigin(0.5);
                    this.container.add(starLayout);
                }
            });

            const gridRows = Math.ceil(world.levels.length / cols);
            const gridH = gridRows * rowHeight;

            // Background panel (Calculated to perfectly fit buttons inside)
            const panelHeight = (gridStartY - worldHeader.y) + gridH + 30;
            const sectionBg = this.add.rectangle(width / 2, worldHeader.y - 25, width - (panelMargin * 2), panelHeight, 0x1a1a2e)
                .setOrigin(0.5, 0)
                .setStrokeStyle(2, 0x0f3460, 0.8);
            this.container.addAt(sectionBg, 0);

            currentY += gridH + 120;
        });

        this.maxScroll = height - currentY - 200;
        if (this.maxScroll > (isSmallScreen ? 80 : 120)) this.maxScroll = (isSmallScreen ? 80 : 120); // Prevent scrolling if content is short

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
                        // Ensure deltaMove is a valid number to prevent NaNs
                        if (Number.isFinite(deltaMove)) {
                            this.container.y += deltaMove;
                        }

                        // Clamping
                        const containerTopLimit = isSmallScreen ? 80 : 120;
                        if (this.container.y > containerTopLimit) this.container.y = containerTopLimit;
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
