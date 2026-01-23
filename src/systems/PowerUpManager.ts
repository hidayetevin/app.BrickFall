import Phaser from 'phaser';
import { PowerUp } from '@entities/PowerUp';
import { Paddle } from '@entities/Paddle';
import { Ball } from '@entities/Ball';
import { PowerUpType } from '../types/GameTypes';
import {
    POWER_UP_DURATION,
    POWER_UP_EXTEND_MULTIPLIER,
    POWER_UP_SPEED_MULTIPLIER,
    POWER_UP_FAST_MULTIPLIER,
    POWER_UP_DROP_CHANCE,
} from '@config/Constants';

/**
 * PowerUpManager - Manages power-up spawning, collection, and effects
 */
export class PowerUpManager {
    private scene: Phaser.Scene;
    private paddle: Paddle;
    private balls: Ball[];

    private powerUps: PowerUp[] = [];
    private activePowerUps: Map<PowerUpType, Phaser.Time.TimerEvent> = new Map();
    private powerUpsUsedCount: number = 0;

    constructor(scene: Phaser.Scene, paddle: Paddle, balls: Ball[]) {
        this.scene = scene;
        this.paddle = paddle;
        this.balls = balls;

        // Listen for power-up collection events
        this.scene.events.on('powerUpCollected', this.onPowerUpCollected, this);
    }

    /**
     * Spawn a power-up at a specific location
     */
    public spawnPowerUp(x: number, y: number): void {
        // Random chance to spawn
        if (Math.random() > POWER_UP_DROP_CHANCE) {
            return;
        }

        // Random power-up type
        const type = this.getRandomPowerUpType();
        const powerUp = new PowerUp(this.scene, x, y, type);
        this.powerUps.push(powerUp);

        console.log(`💎 Power-up spawned: ${powerUp.getName()}`);
    }

    /**
     * Get random power-up type with weighted probabilities
     */
    private getRandomPowerUpType(): PowerUpType {
        const weights = {
            [PowerUpType.MULTI_BALL]: 0.15,
            [PowerUpType.EXTEND_PADDLE]: 0.25,
            [PowerUpType.SLOW_BALL]: 0.20,
            [PowerUpType.FAST_BALL]: 0.10,
            [PowerUpType.STICKY_PADDLE]: 0.15,
            [PowerUpType.EXTRA_LIFE]: 0.15,
        };

        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * total;

        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return type as PowerUpType;
            }
        }

        return PowerUpType.EXTEND_PADDLE; // Fallback
    }

    /**
     * Handle power-up collection
     */
    private onPowerUpCollected(data: { type: PowerUpType; x: number; y: number }): void {
        this.activatePowerUp(data.type);
        this.powerUpsUsedCount++;

        // Remove from array
        this.powerUps = this.powerUps.filter(p => p.isActive);
    }

    /**
     * Activate a power-up effect
     */
    private activatePowerUp(type: PowerUpType): void {
        console.log(`✨ Activating power-up: ${type}`);

        // Deactivate conflicting power-ups
        this.deactivateConflicts(type);

        switch (type) {
            case PowerUpType.MULTI_BALL:
                this.activateMultiBall();
                break;

            case PowerUpType.EXTEND_PADDLE:
                this.activateExtendPaddle();
                break;

            case PowerUpType.SLOW_BALL:
                this.activateSlowBall();
                break;

            case PowerUpType.FAST_BALL:
                this.activateFastBall();
                break;

            case PowerUpType.STICKY_PADDLE:
                this.activateStickyPaddle();
                break;

            case PowerUpType.EXTRA_LIFE:
                this.activateExtraLife();
                break;
        }
    }

    /**
     * Multi-ball: Spawn 2 extra balls
     */
    private activateMultiBall(): void {
        const mainBall = this.balls.find(b => b.active && b.body && b.isLaunched);
        if (!mainBall) return;

        // Spawn 2 extra balls with different angles
        for (let i = 0; i < 2; i++) {
            const newBall = new Ball(this.scene, mainBall.x, mainBall.y);
            this.balls.push(newBall);

            // Launch at different angles
            const angleOffset = (i === 0 ? -30 : 30);
            const currentVelocity = (mainBall.body as any).velocity;

            if (currentVelocity) {
                const currentAngle = Math.atan2(currentVelocity.y, currentVelocity.x);
                const newAngle = Phaser.Math.RadToDeg(currentAngle) + angleOffset;
                newBall.launch(newAngle);
            } else {
                newBall.launch(); // Default launch if velocity not available
            }
        }

        console.log('⚽ Multi-ball activated! Total balls:', this.balls.length);
    }

    /**
     * Extend paddle by 30%
     */
    private activateExtendPaddle(): void {
        this.paddle.extend(POWER_UP_EXTEND_MULTIPLIER);

        // Set timer to deactivate
        const timer = this.scene.time.delayedCall(POWER_UP_DURATION, () => {
            this.paddle.shrink();
            this.activePowerUps.delete(PowerUpType.EXTEND_PADDLE);
            console.log('📏 Extend paddle expired');
        });

        this.activePowerUps.set(PowerUpType.EXTEND_PADDLE, timer);
        console.log('📏 Paddle extended for', POWER_UP_DURATION / 1000, 'seconds');
    }

    /**
     * Slow ball by 40%
     */
    private activateSlowBall(): void {
        this.balls.forEach(ball => {
            if (ball.isLaunched) {
                ball.setSpeed(ball.currentSpeed * POWER_UP_SPEED_MULTIPLIER);
            }
        });

        const timer = this.scene.time.delayedCall(POWER_UP_DURATION, () => {
            this.balls.forEach(ball => {
                if (ball.isLaunched) {
                    ball.setSpeed(ball.baseSpeed);
                }
            });
            this.activePowerUps.delete(PowerUpType.SLOW_BALL);
            console.log('🐌 Slow ball expired');
        });

        this.activePowerUps.set(PowerUpType.SLOW_BALL, timer);
        console.log('🐌 Ball slowed down for', POWER_UP_DURATION / 1000, 'seconds');
    }

    /**
     * Speed up ball by 40%
     */
    private activateFastBall(): void {
        this.balls.forEach(ball => {
            if (ball.isLaunched) {
                ball.setSpeed(ball.currentSpeed * POWER_UP_FAST_MULTIPLIER);
            }
        });

        const timer = this.scene.time.delayedCall(POWER_UP_DURATION, () => {
            this.balls.forEach(ball => {
                if (ball.isLaunched) {
                    ball.setSpeed(ball.baseSpeed);
                }
            });
            this.activePowerUps.delete(PowerUpType.FAST_BALL);
            console.log('⚡ Fast ball expired');
        });

        this.activePowerUps.set(PowerUpType.FAST_BALL, timer);
        console.log('⚡ Ball sped up for', POWER_UP_DURATION / 1000, 'seconds');
    }

    /**
     * Sticky paddle: Ball sticks on paddle
     */
    private activateStickyPaddle(): void {
        this.paddle.isSticky = true;

        const timer = this.scene.time.delayedCall(POWER_UP_DURATION, () => {
            this.paddle.isSticky = false;
            this.activePowerUps.delete(PowerUpType.STICKY_PADDLE);
            console.log('🍯 Sticky paddle expired');
        });

        this.activePowerUps.set(PowerUpType.STICKY_PADDLE, timer);
        console.log('🍯 Sticky paddle activated for', POWER_UP_DURATION / 1000, 'seconds');
    }

    /**
     * Extra life: Add one life (handled by game scene)
     */
    private activateExtraLife(): void {
        this.scene.events.emit('addLife');
        console.log('❤️ Extra life granted!');
    }

    /**
     * Deactivate conflicting power-ups
     */
    private deactivateConflicts(type: PowerUpType): void {
        const conflicts: Record<PowerUpType, PowerUpType[]> = {
            [PowerUpType.SLOW_BALL]: [PowerUpType.FAST_BALL],
            [PowerUpType.FAST_BALL]: [PowerUpType.SLOW_BALL],
            [PowerUpType.MULTI_BALL]: [],
            [PowerUpType.EXTEND_PADDLE]: [],
            [PowerUpType.STICKY_PADDLE]: [],
            [PowerUpType.EXTRA_LIFE]: [],
        };

        const conflictTypes = conflicts[type] || [];
        conflictTypes.forEach(conflictType => {
            if (this.activePowerUps.has(conflictType)) {
                this.deactivatePowerUp(conflictType);
            }
        });
    }

    /**
     * Manually deactivate a power-up
     */
    private deactivatePowerUp(type: PowerUpType): void {
        const timer = this.activePowerUps.get(type);
        if (timer) {
            timer.remove();
            this.activePowerUps.delete(type);
        }

        // Reset effects
        switch (type) {
            case PowerUpType.EXTEND_PADDLE:
                this.paddle.shrink();
                break;
            case PowerUpType.STICKY_PADDLE:
                this.paddle.isSticky = false;
                break;
            case PowerUpType.SLOW_BALL:
            case PowerUpType.FAST_BALL:
                this.balls.forEach(ball => ball.setSpeed(ball.baseSpeed));
                break;
        }
    }

    /**
     * Update - Check for paddle collision with power-ups
     */
    public update(): void {
        this.powerUps.forEach(powerUp => {
            if (!powerUp.isActive) return;

            // Check collision with paddle
            const paddleBounds = this.paddle.getBounds();
            const powerUpBounds = powerUp.getBounds();

            if (Phaser.Geom.Intersects.RectangleToRectangle(paddleBounds, powerUpBounds)) {
                powerUp.collect();
            }
        });

        // Remove destroyed power-ups
        this.powerUps = this.powerUps.filter(p => p.active);
    }

    /**
     * Get number of power-ups used
     */
    public getPowerUpsUsedCount(): number {
        return this.powerUpsUsedCount;
    }

    /**
     * Get active power-up types
     */
    public getActivePowerUps(): PowerUpType[] {
        return Array.from(this.activePowerUps.keys());
    }

    /**
     * Clear all power-ups
     */
    public clearAll(): void {
        // Destroy all power-ups
        this.powerUps.forEach(p => p.destroy());
        this.powerUps = [];

        // Deactivate all effects
        this.activePowerUps.forEach((timer, type) => {
            timer.remove();
            this.deactivatePowerUp(type);
        });
        this.activePowerUps.clear();

        this.powerUpsUsedCount = 0;
    }

    /**
     * Cleanup
     */
    public destroy(): void {
        this.clearAll();
        this.scene.events.off('powerUpCollected', this.onPowerUpCollected, this);
    }
}
