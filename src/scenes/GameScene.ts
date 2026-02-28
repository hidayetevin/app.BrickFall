import Phaser from 'phaser';
import { Paddle } from '@entities/Paddle';
import { Ball } from '@entities/Ball';
import { BrickManager } from '@systems/BrickManager';
import { PowerUpManager } from '@systems/PowerUpManager';
import { LevelManager } from '@systems/LevelManager';
import { ProgressionManager } from '@systems/ProgressionManager';
import { StorageManager } from '@systems/StorageManager';
import { AdMobManager } from '../services/AdMobManager';
import { LevelConfig, LevelStats } from '../types/LevelTypes';
import { GameState } from '../types/GameTypes';
import { Brick } from '@entities/Brick';
import { COLORS, INITIAL_LIVES, MAX_LIVES, PADDLE_Y_OFFSET, BALL_SPEED_INCREMENT } from '@config/Constants';

/**
 * GameScene - Main gameplay scene
 */
export class GameScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private progressionManager: ProgressionManager;
    private storage: StorageManager;
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

    // Aiming
    private isAiming: boolean = false;
    private currentAimAngle: number = -90; // Default straight up

    constructor() {
        super({ key: 'Game' });
        this.levelManager = LevelManager.getInstance();
        this.progressionManager = ProgressionManager.getInstance();
        this.storage = StorageManager.getInstance();
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

        // Setup Events and UI bridge
        this.setupUIEvents();
        this.scene.launch('GameUI'); // Start the UI scene in parallel

        // Setup Event Listeners
        this.setupEvents();

        // Setup Collision Detection
        this.setupCollisions();

        // Setup Tilt Control
        this.setupTiltControl();

        this.gameState = 'IDLE';
    }

    private setupUIEvents(): void {
        this.events.on('uiReady', () => {
            this.updateUI();
            this.events.emit('showLaunchText', this.gameState === 'IDLE');
        });

        this.events.on('requestPause', () => {
            if (this.gameState === 'PLAYING' || this.gameState === 'IDLE') {
                this.pauseGame();
            }
        });

        this.events.on('requestResume', () => {
            if (this.gameState === 'PAUSED') {
                // The UI scene handles ad showing (or we handle it here if requested)
                this.adMob.showInterstitial().then(() => {
                    this.matter.world.resume();
                    this.gameState = 'IDLE'; // Or restore previous state
                });
            }
        });

        this.events.on('requestRetry', () => {
            this.adMob.showInterstitial().then(() => {
                this.scene.stop('GameUI');
                this.scene.restart({ levelId: this.levelConfig.id });
            });
        });

        this.events.on('requestMainMenu', () => {
            this.adMob.showInterstitial().then(() => {
                this.scene.stop('GameUI');
                this.scene.stop();
                this.scene.start('Menu');
            });
        });

        this.events.on('requestGameOver', () => {
            this.handleGameOver();
        });

        this.events.on('requestAdContinue', async () => {
            const rewarded = await this.adMob.showRewarded();
            if (rewarded) {
                this.lives = 1;
                this.updateUI();
                this.gameState = 'IDLE';
                this.setupBall();
                this.events.emit('adContinueSuccess');
                this.events.emit('showLaunchText', true);
            } else {
                this.events.emit('adContinueFailed');
            }
        });

        // Input for aiming (still handled here, but graphics are in UI)
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Check if clicking near top (pause button area approx)
            if (pointer.y < 100 && pointer.x < 100) return;

            if (this.gameState === 'IDLE') {
                this.isAiming = true;
                this.currentAimAngle = -90;
                this.events.emit('showLaunchText', false);
                this.updateAimAngle(pointer);
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isAiming && this.gameState === 'IDLE') {
                this.updateAimAngle(pointer);
            }
        });

        this.input.on('pointerup', () => {
            if (this.isAiming && this.gameState === 'IDLE') {
                this.isAiming = false;
                this.events.emit('clearAimLine');
                this.gameState = 'PLAYING';
                if (this.balls[0]) {
                    this.balls[0].launch(this.currentAimAngle);
                }
            }
        });
    }

    private setupTiltControl(): void {
        const settings = this.storage.getSettings();
        if (!settings.tiltControlEnabled) return;

        console.log('📱 Tilt control enabled');

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (this.gameState !== 'PLAYING' && this.gameState !== 'IDLE') return;

            // gamma is the left-to-right tilt in degrees, where right is positive
            const tilt = event.gamma;
            if (tilt !== null) {
                // Deadzone of 2 degrees
                if (Math.abs(tilt) > 2) {
                    const normalizedTilt = tilt / 90; // -1 to 1
                    this.paddle.addTiltMovement(normalizedTilt);
                }
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);

        // Cleanup on scene shutdown
        this.events.once('shutdown', () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        });
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

    private setupEvents(): void {
        this.events.on('brickDestroyed', (data: any) => {
            try {
                // Don't process brick events if game is ending
                if (this.gameState !== 'PLAYING') return;

                this.handleScore(data.points);
                this.powerUpManager.spawnPowerUp(data.x, data.y);

                if (this.brickManager.getBricksRemaining() === 0) {
                    this.handleLevelWin();
                }
            } catch (e) {
                console.error('❌ Error handling brick destruction:', e);
            }
        });


        this.events.on('addLife', () => {
            try {
                // Don't exceed maximum lives
                if (this.lives < MAX_LIVES) {
                    this.lives++;
                    this.updateUI();
                    console.log(`❤️ Life added! Lives: ${this.lives}/${MAX_LIVES}`);
                } else {
                    console.log(`⚠️ Already at maximum lives (${MAX_LIVES})`);
                }
            } catch (e) {
                console.error('❌ Error adding life:', e);
            }
        });
    }

    private setupCollisions(): void {
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            try {
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
            } catch (e) {
                console.error('❌ Collision handling error:', e);
            }
        });
    }

    private handleBrickHit(ball: Ball, brick: Brick, pair: any): void {
        try {
            if (brick.isDestroyed) return;

            // Apply physical bounce
            ball.bounce(pair.collision.normal);

            // Delay destruction so physics can resolve first
            this.time.delayedCall(0, () => {
                try {
                    if (brick && !brick.isDestroyed) {
                        brick.hit();
                    }
                } catch (e) {
                    console.error('❌ Error in delayed brick hit:', e);
                }
            });

            // Update target speed
            ball.setSpeed(ball.currentSpeed + BALL_SPEED_INCREMENT);
        } catch (e) {
            console.error('❌ Error handling brick hit:', e);
        }
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
        // Emit events to GameUIScene
        this.events.emit('updateScore', this.score);
        this.events.emit('updateLives', this.lives);
    }

    update(): void {
        try {
            if (this.gameState !== 'PLAYING') return;

            this.paddle.update();
            this.powerUpManager.update();

            // Update all balls
            for (let i = this.balls.length - 1; i >= 0; i--) {
                const ball = this.balls[i];

                if (ball && ball.active) {
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
        } catch (e) {
            console.error('❌ Main update loop error:', e);
            // Attempt to recover if possible, or force cleanup
            if (this.balls.length === 0) this.handleBallLoss();
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
        this.events.emit('showContinueOption', this.adMob.isRewardedReady());
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
        this.scene.stop('GameUI');

        this.time.delayedCall(100, () => {
            this.scene.start('GameOver', { levelId: this.levelConfig.id, score: this.score });
        });
    }

    private pauseGame(): void {
        this.gameState = 'PAUSED';
        this.matter.world.pause();
        this.events.emit('showPauseMenu');
    }

    private updateAimAngle(pointer: Phaser.Input.Pointer): void {
        if (!this.balls[0]) return;
        const ball = this.balls[0];

        let angle = Phaser.Math.Angle.Between(ball.x, ball.y, pointer.x, pointer.y);
        let degrees = Phaser.Math.RadToDeg(angle);

        if (pointer.y > ball.y) {
            if (pointer.x < ball.x) degrees = -165;
            else degrees = -15;
        } else {
            degrees = Phaser.Math.Clamp(degrees, -165, -15);
        }

        this.currentAimAngle = degrees;
        this.events.emit('drawAimLine', ball.x, ball.y, degrees);
    }
}
