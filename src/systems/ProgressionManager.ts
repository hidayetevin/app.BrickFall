import { LevelStats } from '../types/LevelTypes';
import { StorageManager } from './StorageManager';
import { LevelManager } from './LevelManager';

/**
 * ProgressionManager - Handles star calculation and progression logic
 */
export class ProgressionManager {
    private static instance: ProgressionManager;
    private storage: StorageManager;
    private levelManager: LevelManager;

    private constructor() {
        this.storage = StorageManager.getInstance();
        this.levelManager = LevelManager.getInstance();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): ProgressionManager {
        if (!ProgressionManager.instance) {
            ProgressionManager.instance = new ProgressionManager();
        }
        return ProgressionManager.instance;
    }

    /**
     * Calculate stars earned based on level performance
     */
    public calculateStars(stats: LevelStats): number {
        const { bricksDestroyed, totalBricks, livesRemaining, powerUpsUsed } = stats;
        const bricksPercent = (bricksDestroyed / totalBricks) * 100;

        // 3 Stars: 100% bricks + 3 lives + 2+ power-ups
        if (bricksPercent >= 100 && livesRemaining >= 3 && powerUpsUsed >= 2) {
            return 3;
        }

        // 2 Stars: 80%+ bricks + 2+ lives
        if (bricksPercent >= 80 && livesRemaining >= 2) {
            return 2;
        }

        // 1 Star: Minimum completion (1+ brick destroyed)
        if (bricksDestroyed > 0) {
            return 1;
        }

        return 0;
    }

    /**
     * Complete a level, calculate stars/score, and save progress
     */
    public completeLevel(levelId: number, score: number, stats: LevelStats): { stars: number, unlockedWorld: number[] } {
        // Calculate stars
        const stars = this.calculateStars(stats);

        // Save progress
        this.storage.saveLevelScore(levelId, score, stars);

        // Update current level in storage if this was the latest level
        if (levelId >= this.storage.getCurrentLevel()) {
            const nextId = this.levelManager.getNextLevelId(levelId);
            if (nextId) {
                this.storage.setCurrentLevel(nextId);
            }
        }

        // Check for world unlocks
        const unlockedWorld = this.levelManager.checkWorldUnlocks();

        return {
            stars,
            unlockedWorld
        };
    }

    /**
     * Get total stars needed for next world
     */
    public getStarsToNextWorld(): { worldName: string, starsNeeded: number } | null {
        const totalStars = this.storage.getTotalStars();

        // Find the first locked world
        const worlds = [1, 2, 3, 4]; // World IDs
        for (const id of worlds) {
            if (!this.storage.isWorldUnlocked(id)) {
                const worldData = this.levelManager.getWorldData(id);
                if (worldData) {
                    return {
                        worldName: worldData.name,
                        starsNeeded: Math.max(0, worldData.unlockStars - totalStars)
                    };
                }
            }
        }

        return null;
    }
}
