import Phaser from 'phaser';
import { PowerUpType } from '../types/GameTypes';
import { POWER_UP_FALL_SPEED } from '@config/Constants';

/**
 * PowerUp - Collectible power-up that falls from destroyed bricks
 */
export class PowerUp extends Phaser.GameObjects.Container {
    public scene: Phaser.Scene;
    public type: PowerUpType;
    public fallSpeed: number;
    public isActive: boolean = true;

    private icon!: Phaser.GameObjects.Text;
    private glow!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        super(scene, x, y);

        this.scene = scene;
        this.type = type;
        this.fallSpeed = POWER_UP_FALL_SPEED;

        // Add to scene
        scene.add.existing(this);

        // Create visual elements
        this.createVisuals();

        // Start falling
        this.startFalling();
    }

    /**
     * Create power-up visuals
     */
    private createVisuals(): void {
        const config = this.getPowerUpConfig(this.type);

        // Background glow
        this.glow = this.scene.add.graphics();
        this.glow.fillStyle(config.color, 0.3);
        this.glow.fillCircle(0, 0, 18);
        this.add(this.glow);

        // Background circle
        const bg = this.scene.add.circle(0, 0, 15, config.color);
        this.add(bg);

        // Icon (emoji)
        this.icon = this.scene.add.text(0, 0, config.icon, {
            fontSize: '20px',
        }).setOrigin(0.5);
        this.add(this.icon);

        // Pulse animation for glow
        this.scene.tweens.add({
            targets: this.glow,
            alpha: 0.5,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Rotation animation
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
        });
    }

    /**
     * Get power-up configuration
     */
    private getPowerUpConfig(type: PowerUpType): { icon: string; color: number; name: string } {
        const configs = {
            [PowerUpType.MULTI_BALL]: { icon: '⚽', color: 0x00d2ff, name: 'Multi Ball' },
            [PowerUpType.EXTEND_PADDLE]: { icon: '📏', color: 0x00ff88, name: 'Extend Paddle' },
            [PowerUpType.SLOW_BALL]: { icon: '🐌', color: 0xffaa00, name: 'Slow Ball' },
            [PowerUpType.FAST_BALL]: { icon: '⚡', color: 0xff0044, name: 'Fast Ball' },
            [PowerUpType.STICKY_PADDLE]: { icon: '🍯', color: 0xffd700, name: 'Sticky Paddle' },
            [PowerUpType.EXTRA_LIFE]: { icon: '❤️', color: 0xff006e, name: 'Extra Life' },
        };

        return configs[type];
    }

    /**
     * Start falling animation
     */
    private startFalling(): void {
        this.scene.tweens.add({
            targets: this,
            y: this.scene.cameras.main.height + 50,
            duration: (this.scene.cameras.main.height - this.y) / this.fallSpeed * 1000,
            ease: 'Linear',
            onComplete: () => {
                this.destroy();
            },
        });
    }

    /**
     * Collect power-up (stop falling and animate to UI)
     */
    public collect(): void {
        if (!this.isActive) return;

        this.isActive = false;

        // Stop falling tween
        this.scene.tweens.killTweensOf(this);

        // Emit collection event
        this.scene.events.emit('powerUpCollected', {
            type: this.type,
            x: this.x,
            y: this.y,
        });

        // Collect animation (zoom and fade)
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
            },
        });

        // Particle burst effect
        this.createCollectParticles();
    }

    /**
     * Create particle effect when collected
     */
    private createCollectParticles(): void {
        const config = this.getPowerUpConfig(this.type);
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 50;

            const particle = this.scene.add.circle(
                this.x,
                this.y,
                3,
                config.color
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * speed,
                y: this.y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy(),
            });
        }
    }

    /**
     * Check if power-up is out of bounds
     */
    public isOutOfBounds(): boolean {
        return this.y > this.scene.cameras.main.height + 50;
    }

    /**
     * Get power-up name for display
     */
    public getName(): string {
        return this.getPowerUpConfig(this.type).name;
    }

    /**
     * Cleanup
     */
    public destroy(fromScene?: boolean): void {
        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.killTweensOf(this.glow);
        super.destroy(fromScene);
    }
}
