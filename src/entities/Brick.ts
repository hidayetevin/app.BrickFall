import Phaser from 'phaser';
import { BrickType } from '../types/GameTypes';

/**
 * Brick - Abstract base class for all brick types
 * Handles hit detection, health, and destruction
 */
export abstract class Brick extends Phaser.Physics.Matter.Sprite {
    public scene: Phaser.Scene;
    public declare body: MatterJS.BodyType;

    public type: BrickType;
    public health: number;
    public maxHealth: number;
    public points: number;
    public isDestroyed: boolean = false;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        type: BrickType,
        health: number,
        points: number
    ) {
        // Use neon_bricks spritesheet
        super(scene.matter.world, x, y, 'neon_bricks');

        this.scene = scene;
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.points = points;

        // Set frame based on type
        this.setFrame(this.getFrameForType(type));

        // Scale to match constant brick size
        this.setDisplaySize(width, height);

        // Add to scene
        scene.add.existing(this);

        // Set blend mode to ADD to hide black background and enhance glow
        this.setBlendMode(Phaser.BlendModes.ADD);

        // Setup physics
        this.setupPhysics();
    }

    /**
     * Setup Matter.js physics body
     */
    protected setupPhysics(): void {
        this.setStatic(true);
        this.setFriction(0, 0);
        this.setBounce(1);

        // Ensure circular or rectangular body matches visual
        this.setBody({
            type: 'rectangle',
            width: this.displayWidth,
            height: this.displayHeight
        }, {
            isStatic: true,
            friction: 0,
            frictionStatic: 0,
            restitution: 1,
        });

        this.body = this.body as MatterJS.BodyType;
    }

    /**
     * Get frame index from spritesheet based on brick type
     */
    private getFrameForType(type: BrickType): number {
        const frameMap: Record<BrickType, number> = {
            [BrickType.STANDARD]: 2, // Cyan/Blue
            [BrickType.STRONG]: 1,   // Gold/Yellow
            [BrickType.METAL]: 0,    // Red
            [BrickType.MOVING]: 3,   // Pink/Magenta
        };
        return frameMap[type] || 0;
    }

    /**
     * Handle brick being hit
     * @returns true if brick is destroyed
     */
    public hit(damage: number = 1): boolean {
        if (this.isDestroyed) return false;

        this.health -= damage;

        if (this.health <= 0) {
            this.destroy();
            return true;
        } else {
            this.onHit();
            this.updateAppearance();
            return false;
        }
    }

    /**
     * Update brick appearance based on health
     */
    protected updateAppearance(): void {
        // Visual damage feedback
        this.setAlpha(0.5 + (this.health / this.maxHealth) * 0.5);
    }

    /**
     * Visual feedback when brick is hit (to be overridden by subclasses)
     */
    protected abstract onHit(): void;

    /**
     * Flash effect when hit
     */
    protected flash(color: number = 0xffffff, duration: number = 100): void {
        this.setTint(color);
        this.scene.time.delayedCall(duration, () => {
            this.clearTint();
        });
    }

    /**
     * Destroy brick with animation
     */
    public destroy(): void {
        try {
            if (this.isDestroyed) return;

            this.isDestroyed = true;

            // Remove physics body immediately to prevent double hits
            if (this.body) {
                this.scene.matter.world.remove(this.body);
            }

            // Emit destroy event
            if (this.scene && this.scene.events) {
                this.scene.events.emit('brickDestroyed', {
                    brick: this,
                    type: this.type,
                    points: this.points,
                    x: this.x,
                    y: this.y,
                });
            }

            // Destruction particles
            this.createDestructionParticles();

            // Fade out and remove
            if (this.scene && this.scene.tweens) {
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 150,
                    onComplete: () => {
                        try {
                            super.destroy();
                        } catch (e) {
                            console.warn('❌ Brick super.destroy error:', e);
                        }
                    },
                });
            } else {
                super.destroy();
            }
        } catch (e) {
            console.error('❌ Brick destroy error:', e);
            try { super.destroy(); } catch (si) { }
        }
    }

    /**
     * Create particle effect when brick is destroyed
     */
    protected createDestructionParticles(): void {
        const particleCount = 6; // Reduced count
        const color = 0xffffff;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 4; // Drastically reduced spread

            const particle = this.scene.add.rectangle(
                this.x,
                this.y,
                1, // Reduced size to 1 for a finer look
                1,
                color
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 150 + Math.random() * 100, // Shorter duration
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Get points value based on type
     */
    public static getPointsForType(type: BrickType): number {
        const points: Record<BrickType, number> = {
            [BrickType.STANDARD]: 10,
            [BrickType.STRONG]: 20,
            [BrickType.METAL]: 50,
            [BrickType.MOVING]: 30,
        };
        return points[type];
    }
}
