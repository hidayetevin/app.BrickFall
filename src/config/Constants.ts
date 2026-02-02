/**
 * Game constants and configuration values
 */

// Canvas dimensions
export const GAME_WIDTH = 375;
export const GAME_HEIGHT = 667;

// Paddle configuration
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 22;
export const PADDLE_SPEED = 576; // Increased by 20% for better responsiveness
export const PADDLE_Y_OFFSET = 150; // Distance from bottom (increased so it's not hidden by finger)

// Ball configuration
export const BALL_RADIUS = 8;
export const BALL_BASE_SPEED = 10;
export const BALL_MAX_SPEED = 48;
export const BALL_MIN_SPEED = 10;
export const BALL_SPEED_INCREMENT = 0.1; // Speed increase per brick hit

// Brick configuration
export const BRICK_WIDTH = 40;
export const BRICK_HEIGHT = 20;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 100;
export const BRICK_ROWS = 8;
export const BRICK_COLS = 8;

// Gameplay
export const INITIAL_LIVES = 3;
export const MAX_LIVES = 5;

// Power-ups
export const POWER_UP_DROP_CHANCE = 0.10; // 10% chance per brick destroyed (was 0.15)
export const POWER_UP_FALL_SPEED = 100;
export const POWER_UP_DURATION = 10000; // 10 seconds
export const POWER_UP_EXTEND_MULTIPLIER = 1.3;
export const POWER_UP_SPEED_MULTIPLIER = 0.6; // For SLOW_BALL
export const POWER_UP_FAST_MULTIPLIER = 1.4; // For FAST_BALL

// Star thresholds
export const STAR_THRESHOLDS = {
    ONE: {
        bricksPercent: 100,
        livesMin: 1,
    },
    TWO: {
        bricksPercent: 80,
        livesMin: 2,
    },
    THREE: {
        bricksPercent: 100,
        livesMin: 3,
        powerUpsMin: 2,
    },
};

// World unlock requirements (stars needed)
export const WORLD_UNLOCK_REQUIREMENTS = [0, 10, 25, 40];

// Physics
export const GRAVITY = 0;
export const BOUNCE = 1.0;
export const FRICTION = 0;
export const RESTITUTION = 1.0;

// Scoring
export const SCORE_MULTIPLIER = {
    STANDARD: 10,
    STRONG: 20,
    METAL: 50,
    MOVING: 30,
};

export const COMBO_MULTIPLIER = 1.5;
export const COMBO_TIMEOUT = 2000; // Time window for combo in ms

// Colors
export const COLORS = {
    BACKGROUND: 0x1a1a2e,
    PADDLE: 0x00d9ff, // Bright cyan for visibility
    BALL: 0xffffff,
    UI_PRIMARY: 0x0f3460,
    UI_SECONDARY: 0x16213e,
    TEXT: 0xffffff,
    SUCCESS: 0x00ff88,
    DANGER: 0xff0044,
    WARNING: 0xffaa00,
};

// Storage keys
export const STORAGE_KEY = 'brick_breaker_data';
export const STORAGE_VERSION = '1.0.0';
