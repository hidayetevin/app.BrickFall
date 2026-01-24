import Phaser from 'phaser';
import { gameConfig } from '@config/GameConfig';
import { AdMobManager } from './services/AdMobManager';

/**
 * Main entry point for Brick Breaker game
 */

// Remove loading indicator
const loading = document.getElementById('loading');
if (loading) {
    loading.style.display = 'none';
}

// Initialize AdMob
AdMobManager.getInstance().initialize();

// Initialize Phaser game
const game = new Phaser.Game(gameConfig);

// Expose game instance for debugging (optional, remove in production)
if (import.meta.env.DEV) {
    (window as any).game = game;
}

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.refresh();
});

// Prevent default touch behaviors on mobile
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

console.log('🎮 Brick Breaker initialized!');
