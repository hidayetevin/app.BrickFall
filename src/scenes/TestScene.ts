import Phaser from 'phaser';
import { Paddle } from '@entities/Paddle';
import { Ball } from '@entities/Ball';
import { Brick } from '@entities/Brick';
import { BrickManager } from '@systems/BrickManager';
import { PowerUpManager } from '@systems/PowerUpManager';
import { PADDLE_Y_OFFSET, COLORS, INITIAL_LIVES } from '@config/Constants';

/**
 * TestScene - Test paddle, ball, brick, and power-up mechanics
 */
export class TestScene extends Phaser.Scene {
    private paddle!: Paddle;
    private balls: Ball[] = [];
    private brickManager!: BrickManager;
    private powerUpManager!: PowerUpManager;
    private infoText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private powerUpsText!: Phaser.GameObjects.Text;

    public score: number = 0;
    public lives: number = INITIAL_LIVES;

    constructor() {
        super({ key: 'Test' });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Title
        this.add
            .text(width / 2, 20, '🎮 Brick Breaker - Phase 4 Test', {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        // Score display
        this.scoreText = this.add
            .text(16, 16, 'Score: 0', {
                fontSize: '16px',
                color: '#00ff88',
            })
            .setOrigin(0, 0);

        // Lives display
        this.livesText = this.add
            .text(16, 38, `Lives: ${this.lives}`, {
                fontSize: '16px',
                color: '#ff006e',
            })
            .setOrigin(0, 0);

        // Power-ups display
        this.powerUpsText = this.add
            .text(width - 16, 16, '', {
                fontSize: '14px',
                color: '#ffd700',
                align: 'right',
            })
            .setOrigin(1, 0);

        // Create brick manager and bricks
        this.brickManager = new BrickManager(this);
        this.brickManager.createMixedPattern(4, 8); // Smaller pattern for easier testing

        // Create paddle
        const paddleY = height - PADDLE_Y_OFFSET;
        this.paddle = new Paddle(this, width / 2, paddleY);

        // Create ball (attached to paddle)
        const ball = new Ball(this, width / 2, paddleY - 30);
        this.balls.push(ball);

        // Create power-up manager
        this.powerUpManager = new PowerUpManager(this, this.paddle, this.balls);

        // Setup collisions
        this.setupCollisions();

        // Instructions
        this.instructionText = this.add
            .text(width / 2, height - 80, 'Click/Tap to Launch\nCollect Power-Ups!', {
                fontSize: '14px',
                color: '#00ff88',
                align: 'center',
            })
            .setOrigin(0.5);

        // Info text
        this.infoText = this.add
            .text(width - 16, height - 16, '', {
                fontSize: '11px',
                color: '#ffffff',
                align: 'right',
            })
            .setOrigin(1, 1);

        // Click to launch
        this.input.on('pointerdown', () => {
            if (this.balls[0] && !this.balls[0].isLaunched) {
                this.balls[0].launch();
                this.instructionText.setVisible(false);
            }
        });

        // Listen for events
        this.events.on('allBricksDestroyed', () => this.showVictory());
        this.events.on('brickDestroyed', (data: any) => {
            this.score += data.points;
            this.updateScore();
        });
        this.events.on('spawnPowerUp', (data: { x: number; y: number }) => {
            this.powerUpManager.spawnPowerUp(data.x, data.y);
        });
        this.events.on('addLife', () => {
            this.lives++;
            this.updateLives();
        });

        console.log('✅ TestScene: Full game mechanics initialized');
    }

    /**
     * Setup collision detection
     */
    private setupCollisions(): void {
        this.matter.world.on(
            'collisionstart',
            (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
                event.pairs.forEach((pair) => {
                    const { bodyA, bodyB } = pair;

                    // Identify ball
                    const ball = this.balls.find(b => b.body === bodyA || b.body === bodyB);
                    if (!ball) return;

                    // Identify other object
                    const otherBody = (bodyA === ball.body) ? bodyB : bodyA;
                    const otherObject = (otherBody as any).gameObject;

                    if (!otherObject) return;

                    // Handle collisions
                    if (otherObject instanceof Paddle) {
                        this.onPaddleHit(ball, pair);
                    } else if (otherObject instanceof Brick) {
                        this.onBrickHit(ball, otherObject, pair);
                    }
                });
            }
        );
    }

    /**
     * Handle ball hitting paddle
     */
    private onPaddleHit(ball: Ball, pair: any): void {
        if (!ball.isLaunched) return;

        ball.bounce(pair.collision.normal);

        // Visual feedback
        this.paddle.setFillStyle(COLORS.SUCCESS);
        this.time.delayedCall(100, () => {
            this.paddle.setFillStyle(COLORS.PADDLE);
        });
    }

    /**
     * Handle ball hitting brick
     */
    private onBrickHit(ball: Ball, brick: Brick, pair: any): void {
        if (brick.isDestroyed) return;
        ball.bounce(pair.collision.normal);
        brick.hit(1);
    }

    /**
     * Update score display
     */
    private updateScore(): void {
        this.scoreText.setText(`Score: ${this.score}`);
    }

    /**
     * Update lives display
     */
    private updateLives(): void {
        this.livesText.setText(`Lives: ${this.lives}`);
    }

    /**
     * Show victory message
     */
    private showVictory(): void {
        const { width, height } = this.cameras.main;
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);
        this.add.text(width / 2, height / 2 - 40, '🎉 VICTORY! 🎉', { fontSize: '32px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 60, 'Click to restart', { fontSize: '16px', color: '#ffaa00' }).setOrigin(0.5);
        this.input.once('pointerdown', () => this.scene.restart());
    }

    /**
     * Show game over message
     */
    private showGameOver(): void {
        const { width, height } = this.cameras.main;
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);
        this.add.text(width / 2, height / 2 - 40, '💀 GAME OVER 💀', { fontSize: '32px', color: '#ff0044', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 60, 'Click to restart', { fontSize: '16px', color: '#ffaa00' }).setOrigin(0.5);
        this.input.once('pointerdown', () => this.scene.restart());
    }

    update(): void {
        // Update paddle
        this.paddle.update();

        // Update all balls (iterate backwards to safely remove)
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (ball && ball.active) {
                ball.update();
                if (ball.isOutOfBounds()) {
                    ball.destroy();
                    this.balls.splice(i, 1);
                }
            } else {
                this.balls.splice(i, 1);
            }
        }

        // If no balls left, lose a life
        if (this.balls.length === 0 && this.lives > 0) {
            this.lives--;
            this.updateLives();
            if (this.lives > 0) {
                this.resetBall();
            } else {
                this.showGameOver();
            }
        }

        // Update bricks
        this.brickManager.update();

        // Update power-ups
        this.powerUpManager.update();

        // Update info text
        this.updateInfoText();
    }

    /**
     * Reset ball to paddle
     */
    private resetBall(): void {
        const ball = new Ball(this, this.paddle.x, this.paddle.y - 30);
        this.balls = [ball];
        this.instructionText.setVisible(true);
    }

    /**
     * Update info text with debug information
     */
    private updateInfoText(): void {
        const activePowerUps = this.powerUpManager.getActivePowerUps();
        const powerUpsText = activePowerUps.length > 0 ? `Active: ${activePowerUps.join(', ')}` : '';
        this.powerUpsText.setText(powerUpsText);

        let ballSpeed = 0;
        if (this.balls[0] && this.balls[0].body) {
            const velocity = (this.balls[0].body as any).velocity;
            if (velocity) {
                const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
                ballSpeed = isNaN(speed) ? 0 : speed;
            }
        }

        this.infoText.setText([
            `Bricks: ${this.brickManager.getBricksRemaining()}`,
            `Balls: ${this.balls.length}`,
            `Speed: ${Math.round(ballSpeed)}`,
            `PowerUps: ${this.powerUpManager.getPowerUpsUsedCount()}`,
        ]);
    }
}
