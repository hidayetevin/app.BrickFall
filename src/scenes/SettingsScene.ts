import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { StorageManager } from '@systems/StorageManager';
import { COLORS } from '@config/Constants';
import { Settings } from '../types/GameTypes';

/**
 * SettingsScene - Game settings and configuration
 */
export class SettingsScene extends Phaser.Scene {
    private storage: StorageManager;
    private settings!: Settings;

    constructor() {
        super({ key: 'Settings' });
        this.storage = StorageManager.getInstance();
    }

    create(): void {
        const { width, height } = this.cameras.main;
        this.settings = this.storage.getSettings();

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Title
        this.add.text(width / 2, 80, 'SETTINGS', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startY = 160;
        const spacing = 60;

        // Toggle Settings
        this.createToggle(width / 2, startY, 'SOUND', this.settings.soundEnabled, (val) => {
            this.storage.updateSettings({ soundEnabled: val });
        });

        this.createToggle(width / 2, startY + spacing, 'HAPTICS', this.settings.hapticEnabled, (val) => {
            this.storage.updateSettings({ hapticEnabled: val });
        });

        this.createToggle(width / 2, startY + spacing * 2, 'TILT CONTROL', this.settings.tiltControlEnabled, (val) => {
            this.storage.updateSettings({ tiltControlEnabled: val });
        });

        // Sensitivity Stepper (1-10)
        this.createSensitivityControl(width / 2, startY + spacing * 3.5);

        // Reset Data Button (Secondary color)
        new Button(this, width / 2, height - 160, 'RESET ALL PROGRESS', width * 0.7, 50, 0xaa0000, () => {
            if (confirm('Reset all game progress?')) {
                this.storage.resetGameData();
                this.scene.start('Menu');
            }
        });

        // Back Button
        new Button(this, width / 2, height - 80, 'BACK', width * 0.7, 50, COLORS.UI_PRIMARY, () => {
            this.scene.start('Menu');
        });
    }

    private createToggle(x: number, y: number, label: string, initialValue: boolean, onToggle: (val: boolean) => void): void {
        const width = 300;

        this.add.text(x - width / 2, y, label, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const statusText = this.add.text(x + width / 2, y, initialValue ? 'ON' : 'OFF', {
            fontSize: '20px',
            color: initialValue ? '#00ff88' : '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        statusText.on('pointerdown', () => {
            const newValue = statusText.text === 'OFF';
            statusText.setText(newValue ? 'ON' : 'OFF');
            statusText.setColor(newValue ? '#00ff88' : '#ff4444');
            onToggle(newValue);
        });
    }

    private createSensitivityControl(x: number, y: number): void {
        this.add.text(x, y - 30, 'SENSITIVITY', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const sensitivity = this.settings.sensitivity || 5;

        const valueText = this.add.text(x, y + 10, sensitivity.toString(), {
            fontSize: '32px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const minusBtn = this.add.text(x - 80, y + 10, '[-]', { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        const plusBtn = this.add.text(x + 80, y + 10, '[+]', { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        minusBtn.on('pointerdown', () => {
            let val = parseInt(valueText.text);
            if (val > 1) {
                val--;
                valueText.setText(val.toString());
                this.storage.updateSettings({ sensitivity: val });
            }
        });

        plusBtn.on('pointerdown', () => {
            let val = parseInt(valueText.text);
            if (val < 10) {
                val++;
                valueText.setText(val.toString());
                this.storage.updateSettings({ sensitivity: val });
            }
        });
    }
}
