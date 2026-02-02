import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './Constants';

// Import scenes
import { BootScene } from '@scenes/BootScene';
import { MenuScene } from '@scenes/MenuScene';
import { WorldMapScene } from '@scenes/WorldMapScene';
import { GameScene } from '@scenes/GameScene';
import { LevelCompleteScene } from '@scenes/LevelCompleteScene';
import { GameOverScene } from '@scenes/GameOverScene';
import { SettingsScene } from '@scenes/SettingsScene';
import { TestScene } from '@scenes/TestScene';

/**
 * Main Phaser game configuration
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    // Use native device resolution for maximum sharpness
    // @ts-ignore
    resolution: window.devicePixelRatio || 1,

    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        autoRound: true,
    },

    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 },
            debug: false,
            enableSleeping: false,
        },
    },

    scene: [
        BootScene,
        MenuScene,
        WorldMapScene,
        GameScene,
        LevelCompleteScene,
        GameOverScene,
        SettingsScene,
        TestScene // Keep Test for now just in case
    ],

    render: {
        pixelArt: false,
        antialias: false,
        antialiasGL: false,
        roundPixels: true, // Force integer pixel drawing for maximum sharpness
        // @ts-ignore
        resolution: window.devicePixelRatio || 1,
        powerPreference: 'high-performance',
        batchSize: 4096,
    },

    audio: {
        disableWebAudio: false,
    },
};
