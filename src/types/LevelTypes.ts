import { BrickType } from './GameTypes';

/**
 * Single brick data in level configuration
 */
export interface BrickData {
    row: number;
    col: number;
    type: BrickType;
    health: number;
    points: number;
}

/**
 * Level configuration
 */
export interface LevelConfig {
    id: number;
    worldId: number;
    name: string;
    bricks: BrickData[];
    ballSpeed: number;
    paddleWidth: number;
    powerUpChance: number;
    background: string;
}

/**
 * World data containing multiple levels
 */
export interface WorldData {
    id: number;
    name: string;
    levels: number[]; // Array of level IDs
    unlockStars: number; // Stars required to unlock
    theme: string;
    description: string;
}

/**
 * Level statistics for star calculation
 */
export interface LevelStats {
    bricksDestroyed: number;
    totalBricks: number;
    livesRemaining: number;
    powerUpsUsed: number;
    timeElapsed: number; // in seconds
    maxCombo: number;
}
