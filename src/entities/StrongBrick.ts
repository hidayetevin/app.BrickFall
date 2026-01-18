import { Brick } from './Brick';
import { BrickType } from '../types/GameTypes';
import { BRICK_WIDTH, BRICK_HEIGHT } from '@config/Constants';

/**
 * StrongBrick - Requires 2 hits to destroy
 * Shows visual damage after first hit
 */
export class StrongBrick extends Brick {
    private crackGraphics?: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            BRICK_WIDTH,
            BRICK_HEIGHT,
            BrickType.STRONG,
            2, // health
            Brick.getPointsForType(BrickType.STRONG)
        );
    }

    /**
     * Show crack effect after first hit
     */
    protected onHit(): void {
        this.flash(0xffd700, 80);

        // Show cracks if damaged but not destroyed
        if (this.health === 1 && !this.crackGraphics) {
            this.showCracks();
        }
    }

    /**
     * Draw crack lines on the brick
     */
    private showCracks(): void {
        this.crackGraphics = this.scene.add.graphics();
        this.crackGraphics.lineStyle(1, 0x000000, 0.5);

        const left = this.x - BRICK_WIDTH / 2;
        const top = this.y - BRICK_HEIGHT / 2;
        const right = this.x + BRICK_WIDTH / 2;
        const bottom = this.y + BRICK_HEIGHT / 2;

        // Draw some crack lines
        this.crackGraphics.beginPath();
        this.crackGraphics.moveTo(left + 5, top + BRICK_HEIGHT / 2);
        this.crackGraphics.lineTo(right - 5, top + BRICK_HEIGHT / 3);
        this.crackGraphics.strokePath();

        this.crackGraphics.beginPath();
        this.crackGraphics.moveTo(left + BRICK_WIDTH / 3, top + 2);
        this.crackGraphics.lineTo(left + BRICK_WIDTH / 2, bottom - 2);
        this.crackGraphics.strokePath();
    }

    /**
     * Destroy brick and crack graphics
     */
    public destroy(): void {
        if (this.crackGraphics) {
            this.crackGraphics.destroy();
        }
        super.destroy();
    }
}
