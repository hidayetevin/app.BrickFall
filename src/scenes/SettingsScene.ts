import Phaser from 'phaser';
import { Button } from '@ui/Button';
import { StorageManager } from '@systems/StorageManager';
import { LocalizationService } from '../services/LocalizationService';
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
        const i18n = LocalizationService.getInstance();

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.BACKGROUND).setOrigin(0);

        // Title
        this.add.text(width / 2, 80, i18n.get('SETTINGS.TITLE'), {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startY = 160;
        const spacing = 50;

        // Language Toggle
        const isEnglish = (this.settings.language || 'en') === 'en';
        this.createLanguageToggle(width / 2, startY, isEnglish, (val) => {
            const newLang = val ? 'en' : 'tr';
            this.storage.updateSettings({ language: newLang });
            i18n.setLanguage(newLang);
            // Refresh scene to apply new language
            this.scene.restart();
        });

        // Toggle Settings
        this.createToggle(width / 2, startY + spacing, i18n.get('SETTINGS.SOUND'), this.settings.soundEnabled, (val) => {
            this.storage.updateSettings({ soundEnabled: val });
        });

        this.createToggle(width / 2, startY + spacing * 2, i18n.get('SETTINGS.HAPTICS'), this.settings.hapticEnabled, (val) => {
            this.storage.updateSettings({ hapticEnabled: val });
        });

        this.createToggle(width / 2, startY + spacing * 3, i18n.get('SETTINGS.TILT_CONTROL'), this.settings.tiltControlEnabled, (val) => {
            this.storage.updateSettings({ tiltControlEnabled: val });
        });

        // Sensitivity Stepper (1-10)
        this.createSensitivityControl(width / 2, startY + spacing * 4.5);

        // Reset Data Button (Secondary color)
        new Button(this, width / 2, height - 160, i18n.get('SETTINGS.RESET_ALL_PROGRESS'), width * 0.7, 50, 0xaa0000, () => {
            if (confirm(i18n.get('SETTINGS.RESET_CONFIRM'))) {
                this.storage.resetGameData();
                this.scene.start('Menu');
            }
        });

        // Back Button
        new Button(this, width / 2, height - 80, i18n.get('SETTINGS.BACK'), width * 0.7, 50, COLORS.UI_PRIMARY, () => {
            this.scene.start('Menu');
        });
    }

    private createLanguageToggle(x: number, y: number, isEnglish: boolean, onToggle: (val: boolean) => void): void {
        const width = 300;

        this.add.text(x - width / 2, y, 'LANGUAGE', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const statusText = this.add.text(x + width / 2, y, isEnglish ? 'English' : 'Türkçe', {
            fontSize: '20px',
            color: '#00d9ff',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        statusText.on('pointerdown', () => {
            const isNowEnglish = statusText.text === 'Türkçe'; // toggling
            statusText.setText(isNowEnglish ? 'English' : 'Türkçe');
            onToggle(isNowEnglish);
        });
    }

    private createToggle(x: number, y: number, label: string, initialValue: boolean, onToggle: (val: boolean) => void): void {
        const width = 300;
        const i18n = LocalizationService.getInstance();

        this.add.text(x - width / 2, y, label, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const onStr = i18n.get('SETTINGS.ON');
        const offStr = i18n.get('SETTINGS.OFF');

        const statusText = this.add.text(x + width / 2, y, initialValue ? onStr : offStr, {
            fontSize: '20px',
            color: initialValue ? '#00ff88' : '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        statusText.on('pointerdown', () => {
            const newValue = statusText.text === offStr;
            statusText.setText(newValue ? onStr : offStr);
            statusText.setColor(newValue ? '#00ff88' : '#ff4444');
            onToggle(newValue);
        });
    }

    private createSensitivityControl(x: number, y: number): void {
        const i18n = LocalizationService.getInstance();
        this.add.text(x, y - 30, i18n.get('SETTINGS.SENSITIVITY'), {
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
