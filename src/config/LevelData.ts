import { LevelConfig, WorldData, BrickData } from '../types/LevelTypes';
import { BrickType } from '../types/GameTypes';


/**
 * Utility to generate a grid of bricks
 */
function createGrid(rows: number, cols: number, type: BrickType, health: number = 1): BrickData[] {
    const bricks: BrickData[] = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            bricks.push({
                row,
                col,
                type,
                health,
                points: 10
            });
        }
    }
    return bricks;
}

/**
 * World definitions
 */
export const WORLDS: WorldData[] = [
    {
        id: 1,
        name: "Beginner's Lane",
        levels: [1, 2, 3, 4, 5],
        unlockStars: 0,
        theme: 'blue-green',
        description: 'Perfect for starting your journey.'
    },
    {
        id: 2,
        name: "Intermediate Zone",
        levels: [6, 7, 8, 9, 10],
        unlockStars: 10,
        theme: 'orange-yellow',
        description: 'A bit more challenge, stronger bricks.'
    },
    {
        id: 3,
        name: "Advanced Arena",
        levels: [11, 12, 13, 14, 15],
        unlockStars: 25,
        theme: 'purple-pink',
        description: 'Moving targets and metallic defenses.'
    },
    {
        id: 4,
        name: "Expert Challenge",
        levels: [16, 17, 18, 19, 20],
        unlockStars: 40,
        theme: 'red-dark',
        description: 'Only the best can survive these patterns.'
    }
];

/**
 * Level configurations
 */
export const LEVELS: Record<number, LevelConfig> = {
    // World 1: Levels 1-5
    1: {
        id: 1,
        worldId: 1,
        name: "First Steps",
        bricks: createGrid(3, 8, BrickType.STANDARD),
        ballSpeed: 160,
        paddleWidth: 100,
        powerUpChance: 0.15,
        background: 'bg_world1'
    },
    2: {
        id: 2,
        worldId: 1,
        name: "The Pyramid",
        bricks: [
            ...createGrid(1, 8, BrickType.STANDARD),
            { row: 1, col: 1, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 1, col: 2, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 1, col: 3, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 1, col: 4, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 1, col: 5, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 1, col: 6, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 2, col: 3, type: BrickType.STANDARD, health: 1, points: 10 },
            { row: 2, col: 4, type: BrickType.STANDARD, health: 1, points: 10 },
        ],
        ballSpeed: 170,
        paddleWidth: 100,
        powerUpChance: 0.15,
        background: 'bg_world1'
    },
    3: {
        id: 3,
        worldId: 1,
        name: "Checkerboard",
        bricks: (() => {
            const b: BrickData[] = [];
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 8; c++) {
                    if ((r + c) % 2 === 0) b.push({ row: r, col: c, type: BrickType.STANDARD, health: 1, points: 10 });
                }
            }
            return b;
        })(),
        ballSpeed: 180,
        paddleWidth: 100,
        powerUpChance: 0.15,
        background: 'bg_world1'
    },
    4: {
        id: 4,
        worldId: 1,
        name: "Double Trouble",
        bricks: createGrid(4, 8, BrickType.STANDARD),
        ballSpeed: 190,
        paddleWidth: 90,
        powerUpChance: 0.15,
        background: 'bg_world1'
    },
    5: {
        id: 5,
        worldId: 1,
        name: "Wall of Fate",
        bricks: createGrid(5, 8, BrickType.STANDARD),
        ballSpeed: 200,
        paddleWidth: 90,
        powerUpChance: 0.15,
        background: 'bg_world1'
    },

    // World 2: Levels 6-10
    6: {
        id: 6,
        worldId: 2,
        name: "Stone Wall",
        bricks: [
            ...createGrid(2, 8, BrickType.STRONG, 2),
            ...createGrid(2, 8, BrickType.STANDARD, 1)
        ],
        ballSpeed: 220,
        paddleWidth: 90,
        powerUpChance: 0.12,
        background: 'bg_world2'
    },
    7: {
        id: 7,
        worldId: 2,
        name: "The Tunnel",
        bricks: (() => {
            const b: BrickData[] = [];
            for (let r = 0; r < 6; r++) {
                for (let c = 0; c < 8; c++) {
                    if (c === 0 || c === 7 || r === 0) b.push({ row: r, col: c, type: BrickType.STRONG, health: 2, points: 20 });
                    else if (r > 2) b.push({ row: r, col: c, type: BrickType.STANDARD, health: 1, points: 10 });
                }
            }
            return b;
        })(),
        ballSpeed: 230,
        paddleWidth: 85,
        powerUpChance: 0.12,
        background: 'bg_world2'
    },
    8: {
        id: 8,
        worldId: 2,
        name: "Core Breach",
        bricks: createGrid(6, 8, BrickType.STRONG, 2),
        ballSpeed: 240,
        paddleWidth: 85,
        powerUpChance: 0.12,
        background: 'bg_world2'
    },
    9: {
        id: 9,
        worldId: 2,
        name: "Fortress",
        bricks: [
            ...createGrid(1, 8, BrickType.STRONG, 3), // Metal-ish via high health or STRONG
            ...createGrid(3, 8, BrickType.STRONG, 2),
            ...createGrid(2, 8, BrickType.STANDARD, 1)
        ],
        ballSpeed: 250,
        paddleWidth: 80,
        powerUpChance: 0.12,
        background: 'bg_world2'
    },
    10: {
        id: 10,
        worldId: 2,
        name: "The Gatekeeper",
        bricks: createGrid(7, 8, BrickType.STRONG, 2),
        ballSpeed: 260,
        paddleWidth: 80,
        powerUpChance: 0.12,
        background: 'bg_world2'
    },

    // World 3: Levels 11-15
    11: {
        id: 11,
        worldId: 3,
        name: "Metallic Heart",
        bricks: [
            ...createGrid(2, 8, BrickType.METAL, 3),
            ...createGrid(2, 8, BrickType.STRONG, 2),
            ...createGrid(2, 8, BrickType.STANDARD, 1)
        ],
        ballSpeed: 280,
        paddleWidth: 80,
        powerUpChance: 0.10,
        background: 'bg_world3'
    },
    12: {
        id: 12,
        worldId: 3,
        name: "Moving Target",
        bricks: [
            ...createGrid(1, 8, BrickType.MOVING, 1),
            ...createGrid(2, 8, BrickType.STRONG, 2),
            ...createGrid(2, 8, BrickType.STANDARD, 1)
        ],
        ballSpeed: 290,
        paddleWidth: 75,
        powerUpChance: 0.10,
        background: 'bg_world3'
    },
    13: {
        id: 13,
        worldId: 3,
        name: "Iron Curtain",
        bricks: createGrid(5, 8, BrickType.METAL, 3),
        ballSpeed: 300,
        paddleWidth: 70,
        powerUpChance: 0.10,
        background: 'bg_world3'
    },
    14: {
        id: 14,
        worldId: 3,
        name: "Oscillation",
        bricks: [
            ...createGrid(2, 8, BrickType.MOVING, 1),
            ...createGrid(3, 8, BrickType.METAL, 3)
        ],
        ballSpeed: 320,
        paddleWidth: 70,
        powerUpChance: 0.10,
        background: 'bg_world3'
    },
    15: {
        id: 15,
        worldId: 3,
        name: "The Gauntlet",
        bricks: createGrid(6, 8, BrickType.METAL, 3),
        ballSpeed: 340,
        paddleWidth: 65,
        powerUpChance: 0.10,
        background: 'bg_world3'
    },

    // World 4: Levels 16-20
    16: {
        id: 16,
        worldId: 4,
        name: "Dark Matter",
        bricks: createGrid(5, 8, BrickType.METAL, 3),
        ballSpeed: 380,
        paddleWidth: 65,
        powerUpChance: 0.08,
        background: 'bg_world4'
    },
    17: {
        id: 17,
        worldId: 4,
        name: "Hyper Speed",
        bricks: [
            ...createGrid(2, 8, BrickType.MOVING, 1),
            ...createGrid(4, 8, BrickType.METAL, 3)
        ],
        ballSpeed: 420,
        paddleWidth: 60,
        powerUpChance: 0.08,
        background: 'bg_world4'
    },
    18: {
        id: 18,
        worldId: 4,
        name: "Unbreakable",
        bricks: createGrid(7, 8, BrickType.METAL, 3),
        ballSpeed: 450,
        paddleWidth: 60,
        powerUpChance: 0.08,
        background: 'bg_world4'
    },
    19: {
        id: 19,
        worldId: 4,
        name: "Chaos Theory",
        bricks: [
            ...createGrid(4, 8, BrickType.MOVING, 1),
            ...createGrid(4, 8, BrickType.METAL, 3)
        ],
        ballSpeed: 480,
        paddleWidth: 55,
        powerUpChance: 0.08,
        background: 'bg_world4'
    },
    20: {
        id: 20,
        worldId: 4,
        name: "The Final Stand",
        bricks: createGrid(8, 8, BrickType.METAL, 3),
        ballSpeed: 500,
        paddleWidth: 50,
        powerUpChance: 0.05,
        background: 'bg_world4'
    }
};
