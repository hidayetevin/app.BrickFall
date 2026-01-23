import Phaser from 'phaser';
import { Brick } from '@entities/Brick';
import { StandardBrick } from '@entities/StandardBrick';
import { StrongBrick } from '@entities/StrongBrick';
import { MetalBrick } from '@entities/MetalBrick';
import { MovingBrick } from '@entities/MovingBrick';
import { BrickType } from '../types/GameTypes';
import type { BrickData } from '../types/LevelTypes';
import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP } from '@config/Constants';

/**
 * BrickManager - Manages brick creation, updates, and destruction
 */
export class BrickManager {
    private scene: Phaser.Scene;
    private bricks: Brick[] = [];
    private totalBricks: number = 0;
    private destroyedBricks: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Listen for brick destruction events
        this.scene.events.on('brickDestroyed', this.onBrickDestroyed, this);
    }

    /**
     * Create bricks from level data
     */
    public createBricksFromLevel(level: any): void {
        this.clearAll();

        const brickData = level.bricks as BrickData[];
        brickData.forEach((data) => {
            const brick = this.createBrick(data);
            if (brick) {
                this.bricks.push(brick);
            }
        });

        this.totalBricks = this.bricks.length;
        this.destroyedBricks = 0;

        console.log(`🧱 Created ${this.totalBricks} bricks for level ${level.id}`);
    }

    /**
     * Create bricks in a grid pattern (for testing)
     */
    public createBrickGrid(
        rows: number,
        cols: number,
        offsetX: number = 0,
        offsetY: number = BRICK_OFFSET_TOP,
        brickType: BrickType = BrickType.STANDARD
    ): void {
        this.clearAll();

        const totalWidth = cols * (BRICK_WIDTH + BRICK_PADDING);
        const startX = (this.scene.cameras.main.width - totalWidth) / 2 + offsetX;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_WIDTH / 2;
                const y = offsetY + row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_HEIGHT / 2;

                const data: BrickData = {
                    row,
                    col,
                    type: brickType,
                    health: this.getHealthForType(brickType),
                    points: Brick.getPointsForType(brickType),
                };

                const brick = this.createBrick(data, x, y);
                if (brick) {
                    this.bricks.push(brick);
                }
            }
        }

        this.totalBricks = this.bricks.length;
        this.destroyedBricks = 0;

        console.log(`🧱 Created ${this.totalBricks} bricks in ${rows}x${cols} grid`);
    }

    /**
     * Create a mixed brick pattern for testing
     */
    public createMixedPattern(rows: number, cols: number): void {
        this.clearAll();

        const totalWidth = cols * (BRICK_WIDTH + BRICK_PADDING);
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;
        const startY = BRICK_OFFSET_TOP;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_WIDTH / 2;
                const y = startY + row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_HEIGHT / 2;

                // Determine brick type based on position
                let type: BrickType;
                if (row === 0) {
                    type = BrickType.METAL;
                } else if (row === 1) {
                    type = BrickType.STRONG;
                } else if (col % 3 === 0) {
                    type = BrickType.MOVING;
                } else {
                    type = BrickType.STANDARD;
                }

                const data: BrickData = {
                    row,
                    col,
                    type,
                    health: this.getHealthForType(type),
                    points: Brick.getPointsForType(type),
                };

                const brick = this.createBrick(data, x, y);
                if (brick) {
                    this.bricks.push(brick);
                }
            }
        }

        this.totalBricks = this.bricks.length;
        this.destroyedBricks = 0;

        console.log(`🧱 Created mixed pattern with ${this.totalBricks} bricks`);
    }

    /**
     * Factory method to create specific brick type
     */
    private createBrick(data: BrickData, x?: number, y?: number): Brick | null {
        // Calculate position if not provided
        if (x === undefined || y === undefined) {
            const pos = this.calculatePosition(data.row, data.col);
            x = pos.x;
            y = pos.y;
        }

        switch (data.type) {
            case BrickType.STANDARD:
                return new StandardBrick(this.scene, x, y);

            case BrickType.STRONG:
                return new StrongBrick(this.scene, x, y);

            case BrickType.METAL:
                return new MetalBrick(this.scene, x, y);

            case BrickType.MOVING:
                return new MovingBrick(this.scene, x, y);

            default:
                console.warn(`Unknown brick type: ${data.type}`);
                return null;
        }
    }

    /**
     * Calculate brick position from row/col
     */
    private calculatePosition(row: number, col: number): { x: number; y: number } {
        const totalWidth = 8 * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING;
        const startX = (this.scene.cameras.main.width - totalWidth) / 2;

        const x = startX + col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_WIDTH / 2;
        const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_HEIGHT / 2;
        return { x, y };
    }

    /**
     * Get default health for brick type
     */
    private getHealthForType(type: BrickType): number {
        const healthMap: Record<BrickType, number> = {
            [BrickType.STANDARD]: 1,
            [BrickType.STRONG]: 2,
            [BrickType.METAL]: 3,
            [BrickType.MOVING]: 1,
        };
        return healthMap[type] || 1;
    }

    /**
     * Handle brick destruction event
     */
    private onBrickDestroyed(data: any): void {
        this.destroyedBricks++;

        // Remove from array
        const index = this.bricks.indexOf(data.brick);
        if (index > -1) {
            this.bricks.splice(index, 1);
        }

        // Emit power-up spawn event (PowerUpManager will handle the random chance)
        this.scene.events.emit('spawnPowerUp', { x: data.x, y: data.y });

        console.log(`💥 Brick destroyed! (${this.destroyedBricks}/${this.totalBricks})`);

        // Check if all bricks destroyed
        if (this.destroyedBricks === this.totalBricks) {
            this.scene.events.emit('allBricksDestroyed');
            console.log('🎉 All bricks destroyed!');
        }
    }

    /**
     * Update all bricks (mainly for moving bricks)
     */
    public update(): void {
        this.bricks.forEach((brick) => {
            if (brick instanceof MovingBrick) {
                brick.update();
            }
        });
    }

    /**
     * Get remaining bricks count
     */
    public getBricksRemaining(): number {
        return this.bricks.length;
    }

    /**
     * Get destroyed bricks count
     */
    public getBricksDestroyed(): number {
        return this.destroyedBricks;
    }

    /**
     * Get total bricks count
     */
    public getTotalBricksCount(): number {
        return this.totalBricks;
    }

    /**
     * Get destruction percentage
     */
    public getDestructionPercent(): number {
        if (this.totalBricks === 0) return 0;
        return (this.destroyedBricks / this.totalBricks) * 100;
    }

    /**
     * Clear all bricks
     */
    public clearAll(): void {
        this.bricks.forEach((brick) => {
            if (!brick.isDestroyed) {
                brick.destroy();
            }
        });
        this.bricks = [];
        this.totalBricks = 0;
        this.destroyedBricks = 0;
    }

    /**
     * Cleanup
     */
    public destroy(): void {
        this.clearAll();
        this.scene.events.off('brickDestroyed', this.onBrickDestroyed, this);
    }
}
