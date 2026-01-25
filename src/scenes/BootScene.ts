import Phaser from 'phaser';

/**
 * BootScene - Initial loading and asset preloading scene
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload(): void {
        // Show loading progress
        const { width, height } = this.cameras.main;

        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '20px',
            color: '#ffffff',
        });
        loadingText.setOrigin(0.5, 0.5);

        // Percent text
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: '18px',
            color: '#ffffff',
        });
        percentText.setOrigin(0.5, 0.5);

        // Update progress bar
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
            percentText.setText(`${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Assets loading
        this.load.path = 'assets/images/';

        // Bricks
        this.load.spritesheet('neon_bricks', 'bricks/neon_bricks.png', {
            frameWidth: 1024,
            frameHeight: 204, // 1024 / 5 roughly
        });

        // Ball
        this.load.image('ball', 'ball/ball.png');

        // Add a small delay for simulation if needed, or remove it as we are now loading real assets
        // For now, let's keep the delay logic if you want but the loader will handle real assets
    }

    create(): void {
        console.log('✅ BootScene: Assets loaded successfully');

        // Show temporary message
        const { width, height } = this.cameras.main;

        this.add.text(width / 2, height / 2 - 50, '🎮 BRICK FALL', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, 'Ready to break!', {
            fontSize: '20px',
            color: '#00ff88',
        }).setOrigin(0.5);

        // Transition to MenuScene after 1 second
        this.time.delayedCall(1000, () => {
            this.scene.start('Menu');
        });
    }
}
