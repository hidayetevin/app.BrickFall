import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './Constants';

// Import scenes
import { BootScene } from '@scenes/BootScene';
import { MenuScene } from '@scenes/MenuScene';
import { WorldMapScene } from '@scenes/WorldMapScene';
import { GameScene } from '@scenes/GameScene';
import { LevelCompleteScene } from '@scenes/LevelCompleteScene';
import { GameOverScene } from '@scenes/GameOverScene';
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

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
        TestScene // Keep Test for now just in case
    ],

    render: {
        pixelArt: false,
        antialias: true,
    },

    audio: {
        disableWebAudio: false,
    },
};
