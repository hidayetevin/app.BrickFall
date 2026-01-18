/**
 * Data passed to GameScene
 */
export interface GameSceneData {
    levelId: number;
    theme?: string;
}

/**
 * Data passed to LevelCompleteScene
 */
export interface LevelCompleteData {
    levelId: number;
    score: number;
    stars: number;
    bricksDestroyed: number;
    totalBricks: number;
    lives: number;
    powerUpsUsed: number;
    isNewHighScore: boolean;
    nextLevelId?: number;
}

/**
 * Data passed to GameOverScene
 */
export interface GameOverData {
    levelId: number;
    score: number;
    bricksDestroyed: number;
    totalBricks: number;
}
