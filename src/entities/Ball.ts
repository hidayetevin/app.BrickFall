import Phaser from 'phaser';
import { BALL_RADIUS, BALL_BASE_SPEED, BALL_MIN_SPEED, BALL_MAX_SPEED, COLORS } from '@config/Constants';

/**
 * Ball - The main game ball with Matter.js physics
 * Handles movement, bouncing, and collision with paddle/bricks
 */
export class Ball extends Phaser.Physics.Matter.Sprite {
    public radius: number;
    public baseSpeed: number;
    public currentSpeed: number;
    public isLaunched: boolean = false;
    public isStuck: boolean = false;

    private trail?: Phaser.GameObjects.Graphics;
    private trailPoints: { x: number; y: number }[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, radius?: number) {
        const ballRadius = radius || BALL_RADIUS;

        // Create a circle texture if it doesn't exist
        if (!scene.textures.exists('ball')) {
            const graphics = scene.make.graphics({ x: 0, y: 0 });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(ballRadius, ballRadius, ballRadius);
            graphics.generateTexture('ball', ballRadius * 2, ballRadius * 2);
            graphics.destroy();
        }

        super(scene.matter.world, x, y, 'ball');

        this.radius = ballRadius;
        this.baseSpeed = BALL_BASE_SPEED;
        this.currentSpeed = BALL_BASE_SPEED;

        // Add to scene
        scene.add.existing(this);

        // Setup physics
        this.setupPhysics();

        // Setup trail effect
        this.setupTrail();
    }

    /**
     * Setup Matter.js physics
     */
    private setupPhysics(): void {
        this.setCircle(this.radius);
        this.setBounce(1);
        this.setFriction(0, 0, 0);
        this.setMass(1);
        this.setFixedRotation();
        this.setCollisionCategory(1);
    }

    /**
     * Setup trail effect
     */
    private setupTrail(): void {
        this.trail = this.scene.add.graphics();
        this.trail.setDepth(-1);
    }

    /**
     * Launch the ball at an angle
     */
    public launch(angle?: number): void {
        if (this.isLaunched) return;

        const launchAngle = angle || Phaser.Math.Between(-120, -60);
        const radians = Phaser.Math.DegToRad(launchAngle);

        const velocityX = Math.cos(radians) * this.currentSpeed;
        const velocityY = Math.sin(radians) * this.currentSpeed;

        this.setVelocity(velocityX, velocityY);
        this.isLaunched = true;
        this.isStuck = false;

        console.log(`🎾 Ball launched at ${launchAngle}° with speed ${this.currentSpeed}`);
    }

    /**
     * Set ball speed
     */
    public setSpeed(speed: number): void {
        const clampedSpeed = Phaser.Math.Clamp(speed, BALL_MIN_SPEED, BALL_MAX_SPEED);
        this.currentSpeed = clampedSpeed;

        if (this.isLaunched && this.body) {
            const velocity = (this.body as any).velocity;
            const angle = Math.atan2(velocity.y, velocity.x);
            this.setVelocity(
                Math.cos(angle) * clampedSpeed,
                Math.sin(angle) * clampedSpeed
            );
        }
    }

    /**
     * Reset ball to initial state
     */
    public reset(x: number, y: number): void {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.isLaunched = false;
        this.isStuck = true;
        this.currentSpeed = this.baseSpeed;
        this.trailPoints = [];
    }

    /**
     * Attach ball to paddle
     */
    public attachToPaddle(paddleX: number, paddleY: number): void {
        this.reset(paddleX, paddleY - this.radius - 10);
    }

    /**
     * Handle bounce off paddle
     */
    public bounceOffPaddle(paddleX: number, paddleWidth: number, paddleVelocity: number): void {
        if (!this.isLaunched) return;

        // Calculate hit position on paddle (-1 to 1)
        const relativeHitX = (this.x - paddleX) / (paddleWidth / 2 || 1);
        const maxBounceAngle = 60;
        const bounceAngle = Phaser.Math.Clamp(relativeHitX * maxBounceAngle, -75, 75);
        const radians = Phaser.Math.DegToRad(bounceAngle - 90);

        const speedBoost = Math.abs(paddleVelocity) * 0.1;
        const totalSpeed = Math.min(this.currentSpeed + speedBoost, BALL_MAX_SPEED);

        this.setVelocity(
            Math.cos(radians) * totalSpeed,
            Math.sin(radians) * totalSpeed
        );
    }

    /**
     * Prevent too horizontal angles
     */
    private preventHorizontalBounce(): void {
        if (!this.body) return;
        const velocity = (this.body as any).velocity;

        if (isNaN(velocity.x) || isNaN(velocity.y)) return;

        const angle = Math.atan2(velocity.y, velocity.x);
        const degrees = Phaser.Math.RadToDeg(angle);

        if (Math.abs(degrees) < 10 || Math.abs(degrees - 180) < 10 || Math.abs(degrees + 180) < 10) {
            const newAngle = degrees < 0 ? -15 : 15;
            const radians = Phaser.Math.DegToRad(newAngle);
            this.setVelocity(
                Math.cos(radians) * this.currentSpeed,
                Math.sin(radians) * this.currentSpeed
            );
        }
    }

    /**
     * Update ball trail
     */
    private updateTrail(): void {
        if (!this.trail || !this.active) return;

        this.trailPoints.push({ x: this.x, y: this.y });
        if (this.trailPoints.length > 10) this.trailPoints.shift();

        this.trail.clear();
        for (let i = 1; i < this.trailPoints.length; i++) {
            const alpha = (i / this.trailPoints.length) * 0.2;
            this.trail.lineStyle(2, COLORS.BALL, alpha);
            this.trail.lineBetween(
                this.trailPoints[i - 1].x,
                this.trailPoints[i - 1].y,
                this.trailPoints[i].x,
                this.trailPoints[i].y
            );
        }
    }

    /**
     * Check if ball is out of bounds
     */
    public isOutOfBounds(): boolean {
        if (isNaN(this.y) || isNaN(this.x)) return true;
        const limit = (this.scene.scale?.height || 667) + this.radius * 2;
        return this.y > limit;
    }

    /**
     * Update ball physics and appearance
     */
    public update(): void {
        if (!this.active || !this.isLaunched || !this.body) return;

        const velocity = (this.body as any).velocity;

        // Final safety check for NaN
        if (isNaN(velocity.x) || isNaN(velocity.y) || isNaN(this.x) || isNaN(this.y)) {
            console.warn('⚠️ Physics NaN detected, resetting ball velocity');
            this.setVelocity(0, -this.currentSpeed);
            if (isNaN(this.x) || isNaN(this.y)) {
                this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
            }
            return;
        }

        // Maintain constant speed
        const currentSpeedSq = velocity.x ** 2 + velocity.y ** 2;
        if (currentSpeedSq < 100) { // If speed is too low (less than 10px/s)
            this.setVelocity(0, -this.currentSpeed);
        } else {
            const currentSpeed = Math.sqrt(currentSpeedSq);
            if (Math.abs(currentSpeed - this.currentSpeed) > 0.5) {
                const ratio = this.currentSpeed / currentSpeed;
                if (isFinite(ratio)) {
                    this.setVelocity(velocity.x * ratio, velocity.y * ratio);
                }
            }
        }

        this.preventHorizontalBounce();
        this.updateTrail();

        // Bounds bounce with position clamping
        const gameWidth = this.scene.scale.width;
        if (this.x < this.radius) {
            this.setX(this.radius);
            this.setVelocityX(Math.abs(velocity.x) || 1);
        } else if (this.x > gameWidth - this.radius) {
            this.setX(gameWidth - this.radius);
            this.setVelocityX(-Math.abs(velocity.x) || -1);
        }

        if (this.y < this.radius) {
            this.setY(this.radius);
            this.setVelocityY(Math.abs(velocity.y) || 1);
        }
    }
}
