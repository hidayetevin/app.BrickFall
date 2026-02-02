/**
 * Game data stored in localStorage
 */
export interface GameData {
    highScores: Record<number, number>; // levelId -> score
    levelStars: Record<number, number>; // levelId -> stars (1-3)
    totalStars: number;
    unlockedWorlds: number[];
    unlockedThemes: string[];
    currentTheme: string;
    currentLevel: number;
    settings: Settings;
}

/**
 * Game settings
 */
export interface Settings {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    darkMode: boolean;
    particlesEnabled: boolean;
    tiltControlEnabled: boolean; // Device tilting control
    sensitivity: number; // 1 to 10 scale
}

/**
 * Visual theme configuration
 */
export interface Theme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        paddle: string;
        ball: string;
    };
    unlocked: boolean;
}

/**
 * Types of bricks in the game
 */
export enum BrickType {
    STANDARD = 'STANDARD',
    STRONG = 'STRONG',
    METAL = 'METAL',
    MOVING = 'MOVING',
}

/**
 * Types of power-ups
 */
export enum PowerUpType {
    MULTI_BALL = 'MULTI_BALL',
    EXTEND_PADDLE = 'EXTEND_PADDLE',
    SLOW_BALL = 'SLOW_BALL',
    FAST_BALL = 'FAST_BALL',
    STICKY_PADDLE = 'STICKY_PADDLE',
    EXTRA_LIFE = 'EXTRA_LIFE',
}

/**
 * Game states
 */
export type GameState =
    | 'IDLE'
    | 'PLAYING'
    | 'PAUSED'
    | 'LEVEL_COMPLETE'
    | 'GAME_OVER';

/**
 * Power-up configuration
 */
export interface PowerUpConfig {
    type: PowerUpType;
    duration: number; // in milliseconds (0 for permanent)
    probability: number; // 0-1
    icon: string;
    name: string;
    description: string;
}
