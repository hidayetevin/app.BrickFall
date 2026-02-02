import Phaser from 'phaser';
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, GAME_WIDTH } from '@config/Constants';

/**
 * Paddle - Player-controlled platform at the bottom of the screen
 * Handles touch/mouse movement and ball attachment
 */
export class Paddle extends Phaser.Physics.Matter.Sprite {
    public scene: Phaser.Scene;
    public declare body: MatterJS.BodyType;

    public defaultWidth: number;
    public currentWidth: number;
    public isSticky: boolean = false;
    public attachedBalls: Phaser.Physics.Matter.Sprite[] = [];

    private targetX: number;
    private moveSpeed: number;
    private sensitivity: number = 5;

    constructor(scene: Phaser.Scene, x: number, y: number, width?: number, height?: number) {
        const paddleWidth = width || PADDLE_WIDTH;
        const paddleHeight = height || PADDLE_HEIGHT;

        super(scene.matter.world, x, y, 'paddle');

        this.scene = scene;
        this.defaultWidth = paddleWidth;
        this.currentWidth = paddleWidth;
        this.targetX = x;

        // Load sensitivity from storage
        const storage = (scene as any).storage || { getSettings: () => ({ sensitivity: 5 }) };
        this.sensitivity = storage.getSettings().sensitivity;
        this.moveSpeed = PADDLE_SPEED * (0.5 + this.sensitivity / 5);

        // Set dimensions
        this.setDisplaySize(paddleWidth, paddleHeight);

        // Set blend mode to ADD to hide black background and enhance glow
        this.setBlendMode(Phaser.BlendModes.ADD);

        // Add to scene
        scene.add.existing(this);

        // Setup Matter.js physics
        this.setupPhysics();

        // Setup input
        this.setupInput();
    }

    /**
     * Setup Matter.js physics body
     */
    private setupPhysics(): void {
        this.setStatic(true);
        this.setFriction(0, 0);
        this.setBounce(1);

        // Ensure rectangular body matches visual
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
     * Setup touch and mouse input
     */
    private setupInput(): void {
        // Mouse/Touch move
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            // Use worldX to handle scaled games correctly
            this.targetX = pointer.worldX;
        });

        // Handle touch cases where pointermove might not trigger without contact
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.targetX = pointer.worldX;
        });

        // Keyboard controls
        const cursors = this.scene.input.keyboard?.createCursorKeys();
        if (cursors) {
            this.scene.events.on('update', () => {
                const moveAmount = this.moveSpeed * 0.016;
                if (cursors.left.isDown) {
                    this.targetX = Math.max(this.currentWidth / 2, this.targetX - moveAmount);
                } else if (cursors.right.isDown) {
                    this.targetX = Math.min(GAME_WIDTH - this.currentWidth / 2, this.targetX + moveAmount);
                }
            });
        }
    }

    /**
     * Move paddle left
     */
    public moveLeft(): void {
        this.targetX = Math.max(this.currentWidth / 2, this.x - this.moveSpeed * 0.016);
    }

    /**
     * Move paddle right
     */
    public moveRight(): void {
        this.targetX = Math.min(
            GAME_WIDTH - this.currentWidth / 2,
            this.x + this.moveSpeed * 0.016
        );
    }

    /**
     * Move paddle to specific X position (for touch control)
     */
    public moveTo(x: number): void {
        this.targetX = Phaser.Math.Clamp(x, this.currentWidth / 2, GAME_WIDTH - this.currentWidth / 2);
    }

    /**
     * Stop paddle movement
     */
    public stopMovement(): void {
        this.targetX = this.x;
    }

    /**
     * Extend paddle width (power-up)
     */
    public extend(multiplier: number = 1.3): void {
        try {
            const newWidth = this.defaultWidth * multiplier;
            this.currentWidth = newWidth;

            // Update visual size
            this.setDisplaySize(newWidth, this.displayHeight);

            // Update physics body - Recreate body instead of scaling for stability
            if (this.body) {
                this.scene.matter.world.remove(this.body);
                this.setupPhysics();
            }
        } catch (e) {
            console.error('❌ Paddle extend error:', e);
        }
    }

    /**
     * Shrink paddle to default width
     */
    public shrink(): void {
        this.currentWidth = this.defaultWidth;

        // Reset visual size
        this.setDisplaySize(this.defaultWidth, this.displayHeight);

        // Reset physics body
        if (this.body) {
            this.scene.matter.world.remove(this.body);
            this.setupPhysics();
        }
    }

    /**
     * Reset paddle to default state
     */
    public reset(): void {
        this.shrink();
        this.isSticky = false;
        this.releaseBalls();
    }

    /**
     * Attach a ball to the paddle (sticky power-up)
     */
    public attachBall(ball: Phaser.Physics.Matter.Sprite): void {
        if (this.isSticky) {
            this.attachedBalls.push(ball);
        }
    }

    /**
     * Release all attached balls
     */
    public releaseBalls(): void {
        this.attachedBalls = [];
    }

    /**
     * Add movement based on device tilt (gamma/beta)
     */
    public addTiltMovement(tiltDelta: number): void {
        // Multiplier based on sensitivity (scale 1-10)
        const tiltSensitivity = 0.5 + (this.sensitivity / 5);
        this.targetX = Phaser.Math.Clamp(
            this.targetX + tiltDelta * 10 * tiltSensitivity,
            this.currentWidth / 2,
            GAME_WIDTH - this.currentWidth / 2
        );
    }

    /**
     * Update paddle position (smooth movement)
     */
    public update(): void {
        try {
            if (!this.active || !this.scene || !this.scene.add) return;

            // Smooth movement towards target
            // Sensitivity impacts how fast it snaps to target
            // Range 0.1 to 0.4
            const lerpFactor = 0.1 + (this.sensitivity / 10) * 0.3;
            const dx = this.targetX - this.x;
            const moveAmount = Math.abs(dx) > 1 ? dx * lerpFactor : dx;

            const newX = this.x + moveAmount;
            const gameWidth = this.scene.scale?.width || GAME_WIDTH;
            const clampedX = Phaser.Math.Clamp(
                newX,
                this.currentWidth / 2,
                gameWidth - this.currentWidth / 2
            );

            this.setX(clampedX);

            // Update Matter.js body position
            if (this.body && this.scene.matter && this.scene.matter.body) {
                this.scene.matter.body.setPosition(this.body as any, { x: clampedX, y: this.y });
            }

            // Update attached balls positions
            this.attachedBalls.forEach((ball, index) => {
                if (ball && ball.active) {
                    const ballOffset = (index - (this.attachedBalls.length - 1) / 2) * 20;
                    ball.setPosition(this.x + ballOffset, this.y - 20);
                }
            });
        } catch (e) {
            console.error('❌ Paddle update error:', e);
        }
    }

    /**
     * Get paddle movement delta (for ball bounce angle calculation)
     */
    public getMovementDelta(): number {
        return this.targetX - this.x;
    }

    /**
     * Destroy paddle and cleanup
     */
    public destroy(): void {
        this.releaseBalls();
        super.destroy();
    }
}
