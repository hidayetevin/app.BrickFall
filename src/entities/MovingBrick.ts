import { Brick } from './Brick';
import { BrickType } from '../types/GameTypes';
import { BRICK_WIDTH, BRICK_HEIGHT } from '@config/Constants';

/**
 * MovingBrick - Brick that moves horizontally
 * Makes the game more challenging
 */
export class MovingBrick extends Brick {
    private moveTween?: Phaser.Tweens.Tween;
    private moveRange: number;
    private moveSpeed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, moveRange: number = 80) {
        super(
            scene,
            x,
            y,
            BRICK_WIDTH,
            BRICK_HEIGHT,
            BrickType.MOVING,
            1, // health
            Brick.getPointsForType(BrickType.MOVING)
        );

        this.moveRange = moveRange;
        this.moveSpeed = 2000; // Duration of one complete movement (slower = easier)

        // Start moving
        this.startMoving();
    }

    /**
     * Start horizontal movement
     */
    private startMoving(): void {
        const startX = this.x;
        const leftBound = startX - this.moveRange / 2;
        const rightBound = startX + this.moveRange / 2;

        this.moveTween = this.scene.tweens.add({
            targets: this,
            x: rightBound,
            duration: this.moveSpeed / 2,
            yoyo: true,
            repeat: -1, // Infinite
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Update physics body position
                if (this.body && this.scene.matter) {
                    this.scene.matter.body.setPosition(this.body, { x: this.x, y: this.y });
                }
            },
        });
    }

    /**
     * Glow effect when hit
     */
    protected onHit(): void {
        this.flash(0xff00ff, 70);

        // Speed up movement slightly when hit (adds urgency)
        if (this.moveTween) {
            this.moveTween.timeScale = 1.2;
        }
    }

    /**
     * Stop movement and destroy
     */
    public destroy(): void {
        if (this.moveTween) {
            this.moveTween.stop();
            this.moveTween.remove();
        }
        super.destroy();
    }

    /**
     * Update method (called from BrickManager)
     */
    public update(): void {
        // Movement is handled by tween, body position updated in tween callback
    }
}
