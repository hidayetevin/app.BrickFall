import Phaser from 'phaser';
import { Paddle } from '@entities/Paddle';
import { Ball } from '@entities/Ball';
import { BrickManager } from '@systems/BrickManager';
import { PowerUpManager } from '@systems/PowerUpManager';
import { LevelManager } from '@systems/LevelManager';
import { ProgressionManager } from '@systems/ProgressionManager';
import { AdMobManager } from '../services/AdMobManager';
import { LevelConfig, LevelStats } from '../types/LevelTypes';
import { GameState } from '../types/GameTypes';
import { Brick } from '@entities/Brick';
import { COLORS, INITIAL_LIVES, PADDLE_Y_OFFSET, BALL_SPEED_INCREMENT } from '@config/Constants';

/**
 * GameScene - Main gameplay scene
 */
export class GameScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private progressionManager: ProgressionManager;
    private adMob: AdMobManager;
    private brickManager!: BrickManager;
    private powerUpManager!: PowerUpManager;

    private paddle!: Paddle;
    private balls: Ball[] = [];
    private levelConfig!: LevelConfig;

    private gameState: GameState = 'IDLE';
    private score: number = 0;
    private lives: number = INITIAL_LIVES;
    private combo: number = 0;
    private lastHitTime: number = 0;

    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'Game' });
        this.levelManager = LevelManager.getInstance();
        this.progressionManager = ProgressionManager.getInstance();
        this.adMob = AdMobManager.getInstance();
    }

    init(data: { levelId: number }): void {
        const config = this.levelManager.getLevelConfig(data.levelId);
        if (!config) {
            console.error(`Invalid level ID: ${data.levelId}`);
            this.scene.start('Menu');
            return;
        }
        this.levelConfig = config;
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.balls = [];
        this.gameState = 'IDLE';
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Setup Entities
        this.setupPaddle();
        this.setupBall();

        // Setup Systems
        this.brickManager = new BrickManager(this);
        this.brickManager.createBricksFromLevel(this.levelConfig);

        this.powerUpManager = new PowerUpManager(this, this.paddle, this.balls);

        // Setup UI
        this.setupUI();

        // Setup Event Listeners
        this.setupEvents();

        // Setup Collision Detection
        this.setupCollisions();

        this.gameState = 'IDLE';
    }

    private setupPaddle(): void {
        const x = this.cameras.main.width / 2;
        const y = this.cameras.main.height - PADDLE_Y_OFFSET;
        this.paddle = new Paddle(this, x, y, this.levelConfig.paddleWidth);
    }

    private setupBall(): void {
        const ball = new Ball(this, this.paddle.x, this.paddle.y - 30);
        ball.setSpeed(this.levelConfig.ballSpeed);
        this.balls.push(ball);
        ball.attachToPaddle(this.paddle.x, this.paddle.y);
    }

    private setupUI(): void {
        const { width, height } = this.cameras.main;

        this.scoreText = this.add.text(20, 20, `SCORE: ${this.score}`, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        this.livesText = this.add.text(width - 20, 20, `LIVES: ${this.lives}`, {
            fontSize: '20px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        this.add.text(width / 2, 20, this.levelConfig.name, {
            fontSize: '18px',
            color: '#00ff88',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        const launchText = this.add.text(width / 2, height / 2 + 100, 'Tap to Launch', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            if (this.gameState === 'IDLE') {
                this.gameState = 'PLAYING';
                launchText.setVisible(false);
                this.balls[0].launch();
            }
        });
    }

    private setupEvents(): void {
        this.events.on('brickDestroyed', (data: any) => {
            // Don't process brick events if game is ending
            if (this.gameState !== 'PLAYING') return;

            this.handleScore(data.points);
            this.powerUpManager.spawnPowerUp(data.x, data.y);

            if (this.brickManager.getBricksRemaining() === 0) {
                this.handleLevelWin();
            }
        });

        this.events.on('addLife', () => {
            this.lives++;
            this.updateUI();
        });
    }

    private setupCollisions(): void {
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                const ball = this.balls.find(b => b.body === bodyA || b.body === bodyB);
                if (!ball) return;

                const otherBody = (bodyA === ball.body) ? bodyB : bodyA;
                const otherObject = (otherBody as any).gameObject;

                if (!otherObject) return;

                if (otherObject instanceof Brick) {
                    this.handleBrickHit(ball, otherObject, pair);
                } else if (otherObject instanceof Paddle) {
                    this.handlePaddleHit(ball, otherObject, pair);
                }
            });
        });
    }

    private handleBrickHit(ball: Ball, brick: Brick, pair: any): void {
        if (brick.isDestroyed) return;

        // Apply physical bounce
        ball.bounce(pair.collision.normal);

        // Delay destruction so physics can resolve first
        this.time.delayedCall(0, () => {
            if (brick && !brick.isDestroyed) {
                brick.hit();
            }
        });

        // Update target speed
        ball.setSpeed(ball.currentSpeed + BALL_SPEED_INCREMENT);
    }

    private handlePaddleHit(ball: Ball, _paddle: Paddle, pair: any): void {
        // Apply physical bounce
        ball.bounce(pair.collision.normal);
    }

    private handleScore(points: number): void {
        // Don't process score if game is ending
        if (this.gameState !== 'PLAYING') return;

        const now = this.time.now;
        if (now - this.lastHitTime < 2000) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastHitTime = now;

        const multiplier = Math.min(1 + (this.combo - 1) * 0.1, 2.0);
        this.score += Math.floor(points * multiplier);
        this.updateUI();
    }

    private updateUI(): void {
        // Only update if scene is still active and text objects exist
        if (!this.scene || !this.scoreText || !this.livesText) return;
        if (!this.scoreText.scene || !this.livesText.scene) return;

        try {
            this.scoreText.setText(`SCORE: ${this.score}`);
            this.livesText.setText(`LIVES: ${this.lives}`);
        } catch (e) {
            // Scene may be transitioning, ignore render errors
        }
    }

    update(): void {
        if (this.gameState !== 'PLAYING') return;

        this.paddle.update();
        this.powerUpManager.update();

        // Update all balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            if (ball.active) {
                ball.update();

                // Out of bounds
                if (ball.isOutOfBounds()) {
                    ball.destroy();
                    this.balls.splice(i, 1);
                }
            } else {
                this.balls.splice(i, 1);
            }
        }

        // If no balls left
        if (this.balls.length === 0) {
            this.handleBallLoss();
        }
    }

    private handleBallLoss(): void {
        // Prevent multiple calls in the same frame
        if (this.gameState !== 'PLAYING') return;

        this.lives--;
        this.updateUI();

        if (this.lives > 0) {
            this.gameState = 'IDLE';
            this.setupBall();
            // Show tap to launch again (logic simplified)
        } else {
            // Offer rewarded ad for continue
            this.showContinueOption();
        }
    }

    private showContinueOption(): void {
        this.gameState = 'GAME_OVER';
        const { width, height } = this.cameras.main;

        // Dark overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setDepth(1000);

        // Game Over text
        const gameOverText = this.add.text(width / 2, height * 0.3, 'GAME OVER', {
            fontSize: '32px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        // Continue button (ALWAYS show, even if not ready)
        const continueBtn = this.add.rectangle(width / 2, height * 0.5, 240, 60, 0x00aa00)
            .setOrigin(0.5)
            .setDepth(1001)
            .setInteractive({ useHandCursor: true });

        const continueBtnText = this.add.text(width / 2, height * 0.5,
            this.adMob.isRewardedReady() ? '🎁 WATCH AD\nFOR EXTRA LIFE' : '⏳ LOADING AD...', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        continueBtn.on('pointerdown', async () => {
            // Disable button during ad
            continueBtn.disableInteractive();
            continueBtnText.setText('⏳ LOADING...');

            const rewarded = await this.adMob.showRewarded();
            if (rewarded) {
                // Grant extra life
                this.lives = 1;
                this.updateUI();
                this.gameState = 'IDLE';
                overlay.destroy();
                gameOverText.destroy();
                continueBtn.destroy();
                continueBtnText.destroy();
                gameOverBtn.destroy();
                gameOverBtnText.destroy();
                this.setupBall();
                console.log('✅ Extra life granted!');
            } else {
                // Ad failed or not ready
                continueBtnText.setText('❌ AD NOT READY\nTRY AGAIN');
                continueBtn.setInteractive({ useHandCursor: true });

                // Auto-retry after 2 seconds
                this.time.delayedCall(2000, () => {
                    if (this.adMob.isRewardedReady()) {
                        continueBtnText.setText('🎁 WATCH AD\nFOR EXTRA LIFE');
                    }
                });
            }
        });

        // Game Over button
        const gameOverBtn = this.add.rectangle(width / 2, height * 0.65, 240, 60, 0xaa0000)
            .setOrigin(0.5)
            .setDepth(1001)
            .setInteractive({ useHandCursor: true });

        const gameOverBtnText = this.add.text(width / 2, height * 0.65, 'GIVE UP', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        gameOverBtn.on('pointerdown', () => {
            this.handleGameOver();
        });
    }

    private handleLevelWin(): void {
        this.gameState = 'LEVEL_COMPLETE';
        const stats: LevelStats = {
            bricksDestroyed: this.brickManager.getBricksDestroyed(),
            totalBricks: this.brickManager.getTotalBricksCount(),
            livesRemaining: this.lives,
            powerUpsUsed: this.powerUpManager.getPowerUpsUsedCount(),
            timeElapsed: 0, // TODO: track time
            maxCombo: 0 // TODO: track combo
        };

        const result = this.progressionManager.completeLevel(this.levelConfig.id, this.score, stats);

        // Transition to LevelComplete Scene
        this.scene.start('LevelComplete', {
            levelId: this.levelConfig.id,
            score: this.score,
            stars: result.stars,
            stats
        });
    }

    private handleGameOver(): void {
        // Prevent any further events from being processed
        this.gameState = 'GAME_OVER';

        // Small delay before transition to allow cleanup
        this.time.delayedCall(100, () => {
            this.scene.start('GameOver', { levelId: this.levelConfig.id, score: this.score });
        });
    }
}
