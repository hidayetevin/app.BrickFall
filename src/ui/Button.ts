import Phaser from 'phaser';

/**
 * Custom Button component for Phaser UI
 */
export class Button extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private onClick: () => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        width: number = 200,
        height: number = 50,
        color: number = 0x0f3460,
        onClick: () => void
    ) {
        super(scene, x, y);

        this.onClick = onClick;

        // Background
        this.background = scene.add.rectangle(0, 0, width, height, color);
        this.background.setInteractive({ useHandCursor: true });
        this.add(this.background);

        // Text
        this.label = scene.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.label);

        // Hover effects
        this.background.on('pointerover', () => {
            this.background.setFillStyle(Phaser.Display.Color.GetColor(22, 33, 62));
            this.setScale(1.05);
        });

        this.background.on('pointerout', () => {
            this.background.setFillStyle(color);
            this.setScale(1);
        });

        this.background.on('pointerdown', () => {
            this.setScale(0.95);
        });

        this.background.on('pointerup', () => {
            this.setScale(1.05);
            this.onClick();
        });

        // Add to scene
        scene.add.existing(this);
    }

    public setEnabled(enabled: boolean): void {
        if (this.background.input) {
            this.background.input.enabled = enabled;
        }
        this.setAlpha(enabled ? 1 : 0.5);
    }
}
