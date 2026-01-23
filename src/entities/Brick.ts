import Phaser from 'phaser';
import { BrickType } from '../types/GameTypes';

/**
 * Brick - Abstract base class for all brick types
 * Handles hit detection, health, and destruction
 */
export abstract class Brick extends Phaser.GameObjects.Rectangle {
    public scene: Phaser.Scene;
    public declare body: MatterJS.BodyType;

    public type: BrickType;
    public health: number;
    public maxHealth: number;
    public points: number;
    public isDestroyed: boolean = false;

    protected originalColor: number;

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
        const color = Brick.getColorForType(type, health);
        super(scene, x, y, width, height, color);

        this.scene = scene;
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.points = points;
        this.originalColor = color;

        // Add to scene
        scene.add.existing(this);

        // Setup physics
        this.setupPhysics();
    }

    /**
     * Setup Matter.js physics body
     */
    protected setupPhysics(): void {
        // Create static physics body (bricks don't fall)
        this.scene.matter.add.gameObject(this, {
            isStatic: true,
            friction: 0,
            frictionStatic: 0,
            restitution: 1,
        });

        this.body = this.body as MatterJS.BodyType;
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
        // Darken brick as it takes damage
        const healthPercent = this.health / this.maxHealth;
        const darkenAmount = 1 - healthPercent * 0.3;

        const r = ((this.originalColor >> 16) & 0xff) * darkenAmount;
        const g = ((this.originalColor >> 8) & 0xff) * darkenAmount;
        const b = (this.originalColor & 0xff) * darkenAmount;

        const newColor = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
        this.setFillStyle(newColor);
    }

    /**
     * Visual feedback when brick is hit (to be overridden by subclasses)
     */
    protected abstract onHit(): void;

    /**
     * Flash effect when hit
     */
    protected flash(color: number = 0xffffff, duration: number = 100): void {
        this.setFillStyle(color);
        this.scene.time.delayedCall(duration, () => {
            this.updateAppearance();
        });
    }

    /**
     * Destroy brick with animation
     */
    public destroy(): void {
        if (this.isDestroyed) return;

        this.isDestroyed = true;

        // Emit destroy event
        this.scene.events.emit('brickDestroyed', {
            brick: this,
            type: this.type,
            points: this.points,
            x: this.x,
            y: this.y,
        });

        // Destruction particles
        this.createDestructionParticles();

        // Fade out and remove
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 150,
            onComplete: () => {
                super.destroy();
            },
        });
    }

    /**
     * Create particle effect when brick is destroyed
     */
    protected createDestructionParticles(): void {
        const particleCount = 8;
        const color = this.originalColor;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 100;

            const particle = this.scene.add.rectangle(
                this.x,
                this.y,
                4,
                4,
                color
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 300 + Math.random() * 200,
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Get color for brick type and health
     */
    protected static getColorForType(type: BrickType, health: number): number {
        const colors: Record<BrickType, number[]> = {
            [BrickType.STANDARD]: [0xff6b6b, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x54a0ff],
            [BrickType.STRONG]: [0xff6348, 0xff4757, 0xd63031],
            [BrickType.METAL]: [0x95a5a6, 0x7f8c8d, 0x636e72],
            [BrickType.MOVING]: [0xf368e0, 0xee5a6f, 0xc44569],
        };

        const colorArray = colors[type];
        const index = Math.min(health - 1, colorArray.length - 1);
        return colorArray[index] || colorArray[0];
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
