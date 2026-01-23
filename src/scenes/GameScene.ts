import Phaser from 'phaser';
import { Paddle } from '@entities/Paddle';
import { Ball } from '@entities/Ball';
import { BrickManager } from '@systems/BrickManager';
import { PowerUpManager } from '@systems/PowerUpManager';
import { LevelManager } from '@systems/LevelManager';
import { ProgressionManager } from '@systems/ProgressionManager';
import { LevelConfig, LevelStats } from '../types/LevelTypes';
import { GameState } from '../types/GameTypes';
import { COLORS, INITIAL_LIVES, PADDLE_Y_OFFSET } from '@config/Constants';

/**
 * GameScene - Main gameplay scene
 */
export class GameScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private progressionManager: ProgressionManager;
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

    private handleScore(points: number): void {
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
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.livesText.setText(`LIVES: ${this.lives}`);
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
        this.lives--;
        this.updateUI();

        if (this.lives > 0) {
            this.gameState = 'IDLE';
            this.setupBall();
            // Show tap to launch again (logic simplified)
        } else {
            this.handleGameOver();
        }
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
        this.gameState = 'GAME_OVER';
        this.scene.start('GameOver', { levelId: this.levelConfig.id, score: this.score });
    }
}
