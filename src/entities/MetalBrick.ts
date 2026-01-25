import { Brick } from './Brick';
import { BrickType } from '../types/GameTypes';
import { BRICK_WIDTH, BRICK_HEIGHT } from '@config/Constants';

/**
 * MetalBrick - Very tough brick requiring 3 hits
 * Shows spark particles when hit
 */
export class MetalBrick extends Brick {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            BRICK_WIDTH,
            BRICK_HEIGHT,
            BrickType.METAL,
            3, // health
            Brick.getPointsForType(BrickType.METAL)
        );

        // Add metallic shine effect
        this.addMetallicShine();
    }

    /**
     * Add metallic shine overlay
     */
    private addMetallicShine(): void {
        const shine = this.scene.add.rectangle(
            this.x,
            this.y - BRICK_HEIGHT / 4,
            BRICK_WIDTH - 4,
            2,
            0xffffff,
            0.3
        );

        // Store reference to destroy with brick
        (this as any).shineEffect = shine;
    }

    /**
     * Create spark particles when hit
     */
    protected onHit(): void {
        this.flash(0xffff00, 60);
        this.createSparks();
    }

    /**
     * Create spark particle effect
     */
    private createSparks(): void {
        const sparkCount = 2; // Reduced from 5

        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const sparkSize = 1;
            const spark = this.scene.add.rectangle(
                this.x,
                this.y,
                sparkSize,
                sparkSize,
                0xffff00
            );

            // Random spark direction
            const speed = BRICK_WIDTH / 30; // 1/30th of the brick size
            const targetX = this.x + Math.cos(angle) * speed;
            const targetY = this.y + Math.sin(angle) * speed;

            this.scene.tweens.add({
                targets: spark,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 150, // Extremely short duration for the tiny spread
                ease: 'Power2',
                onComplete: () => spark.destroy(),
            });
        }
    }

    /**
     * Enhanced destruction with more particles
     */
    protected createDestructionParticles(): void {
        super.createDestructionParticles();

        // Extra metal fragments
        for (let i = 0; i < 8; i++) { // Reduced from 12
            const angle = (Math.PI * 2 * i) / 8;
            const speed = BRICK_WIDTH / 30; // Reduced from 60+80

            const fragment = this.scene.add.rectangle(
                this.x,
                this.y,
                2, // Reduced from 3
                2,
                0xffffff
            );

            this.scene.tweens.add({
                targets: fragment,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                rotation: Math.random() * Math.PI * 2,
                duration: 300 + Math.random() * 200,
                onComplete: () => fragment.destroy(),
            });
        }
    }

    /**
     * Destroy brick and shine effect
     */
    public destroy(): void {
        const shine = (this as any).shineEffect;
        if (shine) {
            shine.destroy();
        }
        super.destroy();
    }
}
