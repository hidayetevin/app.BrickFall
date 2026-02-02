import type { GameData, Settings } from '../types/GameTypes';
import { STORAGE_KEY, STORAGE_VERSION } from '@config/Constants';

/**
 * StorageManager - Singleton pattern for managing game data persistence
 * Handles save/load operations with localStorage
 */
export class StorageManager {
    private static instance: StorageManager;
    private data: GameData;

    private constructor() {
        this.data = this.loadGameData();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Get default game data
     */
    private getDefaultData(): GameData {
        return {
            highScores: {},
            levelStars: {},
            totalStars: 0,
            unlockedWorlds: [1], // World 1 unlocked by default
            unlockedThemes: ['default'],
            currentTheme: 'default',
            currentLevel: 1,
            settings: {
                soundEnabled: true,
                hapticEnabled: true,
                darkMode: true,
                particlesEnabled: true,
                tiltControlEnabled: false,
                sensitivity: 5,
            },
        };
    }

    /**
     * Load game data from localStorage
     */
    public loadGameData(): GameData {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                console.log('📦 No saved data found, using defaults');
                return this.getDefaultData();
            }

            const parsed = JSON.parse(stored);

            // Version check
            if (parsed.version !== STORAGE_VERSION) {
                console.log('📦 Data version mismatch, migrating...');
                // In future, handle migration here
                return this.getDefaultData();
            }

            console.log('📦 Game data loaded successfully');
            return parsed.data;
        } catch (error) {
            console.error('❌ Error loading game data:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Save game data to localStorage
     */
    public saveGameData(data?: GameData): void {
        try {
            const dataToSave = data || this.data;

            const wrapper = {
                version: STORAGE_VERSION,
                timestamp: Date.now(),
                data: dataToSave,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
            this.data = dataToSave;

            console.log('💾 Game data saved successfully');
        } catch (error) {
            console.error('❌ Error saving game data:', error);
        }
    }

    /**
     * Reset all game data to defaults
     */
    public resetGameData(): void {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.data = this.getDefaultData();
            this.saveGameData();
            console.log('🔄 Game data reset to defaults');
        }
    }

    /**
     * Save level completion data
     */
    public saveLevelScore(levelId: number, score: number, stars: number): void {
        const currentScore = this.data.highScores[levelId] || 0;
        const currentStars = this.data.levelStars[levelId] || 0;

        // Update only if new score/stars are better
        if (score > currentScore) {
            this.data.highScores[levelId] = score;
        }

        if (stars > currentStars) {
            const starDiff = stars - currentStars;
            this.data.levelStars[levelId] = stars;
            this.data.totalStars += starDiff;
        }

        this.saveGameData();
    }

    /**
     * Get high score for a level
     */
    public getLevelScore(levelId: number): number {
        return this.data.highScores[levelId] || 0;
    }

    /**
     * Get stars earned for a level
     */
    public getLevelStars(levelId: number): number {
        return this.data.levelStars[levelId] || 0;
    }

    /**
     * Get total stars across all levels
     */
    public getTotalStars(): number {
        return this.data.totalStars;
    }

    /**
     * Check if a world is unlocked
     */
    public isWorldUnlocked(worldId: number): boolean {
        return this.data.unlockedWorlds.includes(worldId);
    }

    /**
     * Unlock a world
     */
    public unlockWorld(worldId: number): void {
        if (!this.isWorldUnlocked(worldId)) {
            this.data.unlockedWorlds.push(worldId);
            this.saveGameData();
            console.log(`🔓 World ${worldId} unlocked!`);
        }
    }

    /**
     * Check if a level is unlocked
     * Level is unlocked if it's level 1, or the previous level has been completed
     */
    public isLevelUnlocked(levelId: number): boolean {
        if (levelId === 1) return true;

        // Check if previous level has been completed (has at least 1 star)
        return this.getLevelStars(levelId - 1) > 0;
    }

    /**
     * Get game settings
     */
    public getSettings(): Settings {
        return this.data.settings;
    }

    /**
     * Update game settings
     */
    public updateSettings(settings: Partial<Settings>): void {
        this.data.settings = { ...this.data.settings, ...settings };
        this.saveGameData();
        console.log('⚙️ Settings updated');
    }

    /**
     * Get current theme
     */
    public getCurrentTheme(): string {
        return this.data.currentTheme;
    }

    /**
     * Set current theme
     */
    public setCurrentTheme(themeId: string): void {
        if (this.data.unlockedThemes.includes(themeId)) {
            this.data.currentTheme = themeId;
            this.saveGameData();
        }
    }

    /**
     * Get current level
     */
    public getCurrentLevel(): number {
        return this.data.currentLevel;
    }

    /**
     * Set current level
     */
    public setCurrentLevel(levelId: number): void {
        this.data.currentLevel = levelId;
        this.saveGameData();
    }

    /**
     * Get all game data (for debugging)
     */
    public getData(): GameData {
        return { ...this.data };
    }
}
