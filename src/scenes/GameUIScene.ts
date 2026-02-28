import Phaser from 'phaser';
import { LocalizationService } from '../services/LocalizationService';

export class GameUIScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private launchText!: Phaser.GameObjects.Text;
    private i18n = LocalizationService.getInstance();
    private aimLine!: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'GameUI' });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Listeners
        const gameScene = this.scene.get('Game');

        this.scoreText = this.add.text(20, 20, `${this.i18n.get('GAME.SCORE')}: 0`, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        this.livesText = this.add.text(width - 20, 20, `${this.i18n.get('GAME.LIVES')}: 0`, {
            fontSize: '20px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        this.launchText = this.add.text(width / 2, height / 2 + 100, this.i18n.get('GAME.TAP_TO_LAUNCH'), {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        this.launchText.setVisible(false);

        // Aim Graphics
        this.aimLine = this.add.graphics();
        this.aimLine.setDepth(10);

        // Pause Button
        const pauseBtn = this.add.text(20, 50, '⏸️', {
            fontSize: '32px'
        })
            .setInteractive({ useHandCursor: true })
            .setDepth(100);

        pauseBtn.on('pointerdown', () => {
            gameScene.events.emit('requestPause');
        });

        // Event setup
        gameScene.events.on('updateScore', (score: number) => {
            this.scoreText.setText(`${this.i18n.get('GAME.SCORE')}: ${score}`);
        });

        gameScene.events.on('updateLives', (lives: number) => {
            this.livesText.setText(`${this.i18n.get('GAME.LIVES')}: ${lives}`);
        });

        gameScene.events.on('showLaunchText', (show: boolean) => {
            this.launchText.setVisible(show);
        });

        gameScene.events.on('drawAimLine', (ballX: number, ballY: number, angle: number) => {
            this.drawAimLine(ballX, ballY, angle);
        });

        gameScene.events.on('clearAimLine', () => {
            this.aimLine.clear();
        });

        gameScene.events.on('showPauseMenu', () => {
            this.showPauseMenu(gameScene);
        });

        gameScene.events.on('showContinueOption', (adReady: boolean) => {
            this.showContinueOption(gameScene, adReady);
        });

        // Init UI Request
        gameScene.events.emit('uiReady');
    }

    private drawAimLine(ballX: number, ballY: number, degrees: number): void {
        this.aimLine.clear();
        this.aimLine.lineStyle(4, 0xffffff, 0.5);

        const lineLength = 150;
        const rads = Phaser.Math.DegToRad(degrees);
        const endX = ballX + Math.cos(rads) * lineLength;
        const endY = ballY + Math.sin(rads) * lineLength;

        this.aimLine.beginPath();
        this.aimLine.moveTo(ballX, ballY);
        this.aimLine.lineTo(endX, endY);
        this.aimLine.strokePath();
    }

    private showPauseMenu(gameScene: Phaser.Scene): void {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setDepth(2000)
            .setInteractive();

        const container = this.add.container(width / 2, height / 2).setDepth(2001);

        const bg = this.add.rectangle(0, 0, 300, 350, 0x1a1a2e)
            .setStrokeStyle(2, 0x0f3460);
        container.add(bg);

        const title = this.add.text(0, -140, this.i18n.get('GAME.PAUSED_TITLE'), {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(title);

        const continueBtn = this.createButton(0, -50, this.i18n.get('GAME.CONTINUE'), 0x00aa00, async () => {
            gameScene.events.emit('requestResume');
            container.destroy();
            overlay.destroy();
        });
        container.add(continueBtn);

        const retryBtn = this.createButton(0, 30, this.i18n.get('GAME.RETRY'), 0x0f3460, async () => {
            gameScene.events.emit('requestRetry');
            container.destroy();
            overlay.destroy();
        });
        container.add(retryBtn);

        const menuBtn = this.createButton(0, 110, this.i18n.get('GAME.MAIN_MENU'), 0xaa0000, async () => {
            gameScene.events.emit('requestMainMenu');
            container.destroy();
            overlay.destroy();
        });
        container.add(menuBtn);
    }

    private showContinueOption(gameScene: Phaser.Scene, adReady: boolean): void {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setDepth(1000).setInteractive();

        const gameOverText = this.add.text(width / 2, height * 0.3, this.i18n.get('GAME.GAME_OVER_TITLE'), {
            fontSize: '32px',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        const continueBtn = this.add.rectangle(width / 2, height * 0.5, 240, 60, 0x00aa00)
            .setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

        const adTextStr = adReady ? this.i18n.get('GAME.WATCH_AD_EXTRA_LIFE') : this.i18n.get('GAME.LOADING_AD');
        const continueBtnText = this.add.text(width / 2, height * 0.5, adTextStr, {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        continueBtn.on('pointerdown', () => {
            continueBtn.disableInteractive();
            continueBtnText.setText(this.i18n.get('GAME.LOADING'));
            gameScene.events.emit('requestAdContinue');
        });

        const gameOverBtn = this.add.rectangle(width / 2, height * 0.65, 240, 60, 0xaa0000)
            .setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });

        const gameOverBtnText = this.add.text(width / 2, height * 0.65, this.i18n.get('GAME.GIVE_UP'), {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);

        gameOverBtn.on('pointerdown', () => {
            gameScene.events.emit('requestGameOver');
        });

        // Listen for failure to cleanup
        gameScene.events.once('adContinueFailed', () => {
            continueBtnText.setText(this.i18n.get('GAME.AD_NOT_READY'));
            continueBtn.setInteractive({ useHandCursor: true });
        });

        gameScene.events.once('adContinueSuccess', () => {
            overlay.destroy();
            gameOverText.destroy();
            continueBtn.destroy();
            continueBtnText.destroy();
            gameOverBtn.destroy();
            gameOverBtnText.destroy();
        });
    }

    private createButton(yOffset: number, y: number, text: string, color: number, onClick: () => void): Phaser.GameObjects.Container {
        const btn = this.add.container(yOffset, y);
        const cBtnBg = this.add.rectangle(0, 0, 240, 60, color).setInteractive({ useHandCursor: true });
        const cBtnText = this.add.text(0, 0, text, {
            fontSize: '24px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        btn.add([cBtnBg, cBtnText]);
        cBtnBg.on('pointerdown', () => {
            cBtnBg.disableInteractive();
            onClick();
        });
        return btn;
    }
}
