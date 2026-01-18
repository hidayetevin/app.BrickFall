import Phaser from 'phaser';
import {
    BALL_RADIUS,
    BALL_BASE_SPEED,
    BALL_MAX_SPEED,
    BALL_MIN_SPEED,
    COLORS,
    GAME_WIDTH,
    GAME_HEIGHT,
} from '@config/Constants';

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
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(COLORS.BALL, 1);
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
        // Create circular body
        this.setCircle(this.radius);

        // Physics properties for perfect bouncing
        this.setBounce(1);
        this.setFriction(0, 0, 0);
        this.setMass(1);

        // Prevent rotation
        this.setFixedRotation();

        // Set collision category
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

        // Random angle between -60 and -120 degrees (upward)
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

        // Apply speed to current velocity direction
        if (this.isLaunched) {
            const velocity = this.body.velocity;
            const angle = Math.atan2(velocity.y, velocity.x);
            this.setVelocity(
                Math.cos(angle) * clampedSpeed,
                Math.sin(angle) * clampedSpeed
            );
        }
    }

    /**
     * Increase ball speed
     */
    public increaseSpeed(amount: number): void {
        this.setSpeed(this.currentSpeed + amount);
    }

    /**
     * Decrease ball speed
     */
    public decreaseSpeed(amount: number): void {
        this.setSpeed(this.currentSpeed - amount);
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
        // Calculate hit position on paddle (-1 to 1, left to right)
        const relativeHitX = (this.x - paddleX) / (paddleWidth / 2);

        // Adjust bounce angle based on hit position
        const maxBounceAngle = 60; // degrees
        const bounceAngle = relativeHitX * maxBounceAngle;
        const radians = Phaser.Math.DegToRad(bounceAngle - 90); // -90 to make it upward

        // Add paddle velocity to ball
        const speedBoost = Math.abs(paddleVelocity) * 0.1;
        const totalSpeed = Math.min(this.currentSpeed + speedBoost, BALL_MAX_SPEED);

        this.setVelocity(
            Math.cos(radians) * totalSpeed,
            Math.sin(radians) * totalSpeed
        );
    }

    /**
     * Prevent horizontal or too-steep angles
     */
    private preventHorizontalBounce(): void {
        const velocity = this.body.velocity;
        const angle = Math.atan2(velocity.y, velocity.x);
        const degrees = Phaser.Math.RadToDeg(angle);

        // If ball is moving too horizontally (between -15 and 15 degrees)
        if (Math.abs(degrees) < 15 || Math.abs(degrees - 180) < 15) {
            // Adjust to minimum angle
            const newAngle = degrees < 0 ? -15 : 15;
            const radians = Phaser.Math.DegToRad(newAngle);
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

            this.setVelocity(
                Math.cos(radians) * speed,
                Math.sin(radians) * speed
            );
        }
    }

    /**
     * Update ball trail
     */
    private updateTrail(): void {
        if (!this.trail) return;

        // Add current position to trail
        this.trailPoints.push({ x: this.x, y: this.y });

        // Keep trail length limited
        if (this.trailPoints.length > 20) {
            this.trailPoints.shift();
        }

        // Draw trail
        this.trail.clear();
        this.trail.lineStyle(2, COLORS.BALL, 0.3);

        for (let i = 1; i < this.trailPoints.length; i++) {
            const alpha = i / this.trailPoints.length;
            this.trail.lineStyle(2, COLORS.BALL, alpha * 0.3);
            this.trail.lineBetween(
                this.trailPoints[i - 1].x,
                this.trailPoints[i - 1].y,
                this.trailPoints[i].x,
                this.trailPoints[i].y
            );
        }
    }

    /**
     * Check if ball is out of bounds (fell below paddle)
     */
    public isOutOfBounds(): boolean {
        return this.y > GAME_HEIGHT + this.radius * 2;
    }

    /**
     * Update ball physics and appearance
     */
    public update(): void {
        if (!this.isLaunched) return;

        // Maintain constant speed
        const velocity = this.body.velocity;
        const currentSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

        if (Math.abs(currentSpeed - this.currentSpeed) > 10) {
            const ratio = this.currentSpeed / currentSpeed;
            this.setVelocity(velocity.x * ratio, velocity.y * ratio);
        }

        // Prevent horizontal bounces
        this.preventHorizontalBounce();

        // Update trail
        this.updateTrail();

        // Check bounds
        if (this.x < this.radius || this.x > GAME_WIDTH - this.radius) {
            this.setVelocityX(-velocity.x);
        }
        if (this.y < this.radius) {
            this.setVelocityY(-velocity.y);
        }
    }

    /**
     * Destroy ball and cleanup
     */
    public destroy(): void {
        if (this.trail) {
            this.trail.destroy();
        }
        this.trailPoints = [];
        super.destroy();
    }
}
