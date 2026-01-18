import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './Constants';

// Import scenes (will be created in next phase)
import { BootScene } from '@scenes/BootScene';
import { TestScene } from '@scenes/TestScene';
// import { MenuScene } from '@scenes/MenuScene';
// import { WorldMapScene } from '@scenes/WorldMapScene';
// import { GameScene } from '@scenes/GameScene';
// import { PauseScene } from '@scenes/PauseScene';
// import { LevelCompleteScene } from '@scenes/LevelCompleteScene';
// import { GameOverScene } from '@scenes/GameOverScene';
// import { SettingsScene } from '@scenes/SettingsScene';

/**
 * Main Phaser game configuration
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 }, // No gravity for brick breaker
            debug: false, // Set to true for development
            enableSleeping: false,
        },
    },

    scene: [
        BootScene,
        TestScene,
        // Scenes will be added as they are created
        // MenuScene,
        // WorldMapScene,
        // GameScene,
        // PauseScene,
        // LevelCompleteScene,
        // GameOverScene,
        // SettingsScene,
    ],

    render: {
        pixelArt: false,
        antialias: true,
    },

    audio: {
        disableWebAudio: false,
    },
};
