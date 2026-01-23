import { LEVELS, WORLDS } from '../config/LevelData';
import { LevelConfig, WorldData } from '../types/LevelTypes';
import { StorageManager } from './StorageManager';

/**
 * LevelManager - Singleton class for managing level loading and progression
 * Coordinates between static level data and persistent storage
 */
export class LevelManager {
    private static instance: LevelManager;
    private storage: StorageManager;

    private constructor() {
        this.storage = StorageManager.getInstance();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): LevelManager {
        if (!LevelManager.instance) {
            LevelManager.instance = new LevelManager();
        }
        return LevelManager.instance;
    }

    /**
     * Load configuration for a specific level
     */
    public getLevelConfig(levelId: number): LevelConfig | null {
        return LEVELS[levelId] || null;
    }

    /**
     * Get data for a specific world
     */
    public getWorldData(worldId: number): WorldData | null {
        return WORLDS.find(w => w.id === worldId) || null;
    }

    /**
     * Check if a level is unlocked
     */
    public isLevelUnlocked(levelId: number): boolean {
        const config = this.getLevelConfig(levelId);
        if (!config) return false;

        // Check if world is unlocked
        if (!this.storage.isWorldUnlocked(config.worldId)) {
            return false;
        }

        // Check if level itself is unlocked
        return this.storage.isLevelUnlocked(levelId);
    }

    /**
     * Get the next level ID
     */
    public getNextLevelId(currentLevelId: number): number | null {
        const nextId = currentLevelId + 1;
        return LEVELS[nextId] ? nextId : null;
    }

    /**
     * Get all levels in a specific world
     */
    public getLevelsInWorld(worldId: number): LevelConfig[] {
        return Object.values(LEVELS).filter(l => l.worldId === worldId);
    }

    /**
     * Get the world object for a given level
     */
    public getWorldForLevel(levelId: number): WorldData | null {
        const level = this.getLevelConfig(levelId);
        if (!level) return null;
        return this.getWorldData(level.worldId);
    }

    /**
     * Check and unlock new worlds based on star count
     */
    public checkWorldUnlocks(): number[] {
        const totalStars = this.storage.getTotalStars();
        const newlyUnlocked: number[] = [];

        WORLDS.forEach(world => {
            if (!this.storage.isWorldUnlocked(world.id) && totalStars >= world.unlockStars) {
                this.storage.unlockWorld(world.id);
                newlyUnlocked.push(world.id);
            }
        });

        return newlyUnlocked;
    }

    /**
     * Get progress summary for a world
     */
    public getWorldProgress(worldId: number) {
        const levels = this.getLevelsInWorld(worldId);
        let completed = 0;
        let stars = 0;

        levels.forEach(l => {
            const s = this.storage.getLevelStars(l.id);
            if (s > 0) completed++;
            stars += s;
        });

        return {
            completed,
            total: levels.length,
            stars,
            maxStars: levels.length * 3
        };
    }
}
