import { Brick } from './Brick';
import { BrickType } from '../types/GameTypes';
import { BRICK_WIDTH, BRICK_HEIGHT } from '@config/Constants';

/**
 * StandardBrick - Basic brick that breaks in one hit
 * Used in early levels
 */
export class StandardBrick extends Brick {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene,
            x,
            y,
            BRICK_WIDTH,
            BRICK_HEIGHT,
            BrickType.STANDARD,
            1, // health
            Brick.getPointsForType(BrickType.STANDARD)
        );
    }

    /**
     * Flash white when hit (will be destroyed immediately)
     */
    protected onHit(): void {
        this.flash(0xffffff, 50);
    }
}
