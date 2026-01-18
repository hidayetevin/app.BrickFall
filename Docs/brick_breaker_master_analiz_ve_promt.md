# BRICK BREAKER - Uçtan Uca AI ile Geliştirme Kılavuzu

## 📋 İçindekiler
1. [Proje Özeti](#proje-özeti)
2. [Teknik Stack](#teknik-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Geliştirme Adımları](#geliştirme-adımları)
5. [AI Promptları](#ai-promptları)
6. [Deployment](#deployment)

---

## 🎮 Proje Özeti

### Oyun Konsepti
- **Tür**: Casual Arcade Brick Breaker
- **Platform**: iOS, Android, Web, PWA
- **Oyun Süresi**: 2-5 dakika/seviye
- **Kontrol**: Tek parmak (touch/drag paddle)
- **Monetization**: AdMob reklamları
- **Hedef**: Play Store + App Store + Web yayını

### Oyun Mekanikleri
- **Paddle (Raket)**: Ekranın altında, touch ile hareket eden platform
- **Ball (Top)**: Sürekli hareket eden, paddle ve tuğlalardan sekiyor
- **Bricks (Tuğlalar)**: Ekranın üst kısmında dizilmiş hedefler
- **Power-ups**: Düşen bonus öğeler (multi-ball, extend paddle, slow ball, etc.)
- **Lives (Can)**: 3 can ile başla, top düşerse can kaybet
- **Levels (Seviyeler)**: 20+ farklı tuğla düzeni

### Oyun Döngüsü
```
Uygulama Açılış → Menü → Seviye Seçimi → Oyun → Level Complete/Game Over → Yıldız → Reklam → Menü
```

### Yıldız Sistemi
- **1 Yıldız**: Seviyeyi tamamla (minimum)
- **2 Yıldız**: 80%+ tuğla imha + 2+ can kaldı
- **3 Yıldız**: Tüm tuğlaları kır + 3 can kaldı + 2+ power-up kullan

Yıldızlar yeni seviyelerin ve temaların kilidini açar.

### Progresyon Sistemi
- **World 1**: 5 seviye (tuğla düzenleri kolay)
- **World 2**: 5 seviye (orta zorluk, hareketli tuğlalar)
- **World 3**: 5 seviye (zor düzenler, metal tuğlalar)
- **World 4**: 5 seviye (expert, çok hızlı top)
- Her world için minimum yıldız gereksinimi

### Zorluk Algoritması
```typescript
ballSpeed = baseSpeed + (worldLevel * 50) + (bricksDestroyed * 2)
paddleWidth = basePaddleWidth - (worldLevel * 10) // Raket küçülür
powerUpChance = 0.15 - (worldLevel * 0.02) // Power-up düşme şansı azalır
```

---

## 🛠 Teknik Stack

### Framework & Runtime
- **Phaser.js v3.80+**: 2D oyun motoru
  - Matter.js Physics (arcade physics yerine - daha gerçekçi top fiziği)
  - Scene management
  - Tween animation system
  - Particle effects
  
- **Capacitor v5+**: Native wrapper
  - iOS + Android bridge
  - Web compatibility
  - Plugin ecosystem

### Programlama & Build
- **TypeScript v5.0+**: Strict mode
- **Vite v5.0+**: Build tool
  - Fast HMR
  - PWA plugin

### Kod Kalitesi
- **ESLint**: TypeScript linting
- **Prettier**: Code formatting
- **Vitest**: Unit testing

### Storage & State
- **LocalStorage**: 
  - Seviye ilerlemesi
  - Yıldız verileri
  - High scores per level
  - Unlocked worlds/themes
  - Settings

### Plugins (Capacitor)
- **@capacitor/admob**: Reklam entegrasyonu
- **@capacitor/haptics**: Titreşim feedback
- **@capacitor/status-bar**: Status bar kontrolü
- **@capacitor/splash-screen**: Açılış ekranı

### PWA Features
- **Service Worker**: Offline support
- **Web Manifest**: Install prompt
- **Cache API**: Asset caching

---

## 📁 Proje Yapısı

```
brick-breaker/
├── src/
│   ├── main.ts                    # Entry point
│   ├── config/
│   │   ├── GameConfig.ts          # Phaser config
│   │   ├── AdConfig.ts            # AdMob IDs
│   │   ├── Constants.ts           # Game constants
│   │   └── LevelData.ts           # Seviye düzenleri
│   │
│   ├── scenes/
│   │   ├── BootScene.ts           # Asset loading
│   │   ├── MenuScene.ts           # Ana menü
│   │   ├── WorldMapScene.ts       # Dünya/seviye seçimi
│   │   ├── GameScene.ts           # Oyun sahnesi
│   │   ├── PauseScene.ts          # Pause overlay
│   │   ├── LevelCompleteScene.ts  # Seviye tamamlama
│   │   ├── GameOverScene.ts       # Can bitti ekranı
│   │   └── SettingsScene.ts       # Ayarlar
│   │
│   ├── systems/
│   │   ├── PaddleController.ts    # Raket kontrolü
│   │   ├── BallPhysics.ts         # Top fiziği
│   │   ├── BrickManager.ts        # Tuğla yönetimi
│   │   ├── PowerUpManager.ts      # Power-up sistemi
│   │   ├── LevelManager.ts        # Seviye yükleme
│   │   ├── ProgressionManager.ts  # İlerleme/unlock
│   │   ├── StarManager.ts         # Yıldız hesaplama
│   │   ├── ThemeManager.ts        # Tema sistemi
│   │   ├── AdManager.ts           # Reklam yönetimi
│   │   ├── SoundManager.ts        # Ses yönetimi
│   │   ├── ParticleManager.ts     # Partikül efektleri
│   │   ├── HapticManager.ts       # Titreşim
│   │   └── StorageManager.ts      # LocalStorage wrapper
│   │
│   ├── entities/
│   │   ├── Paddle.ts              # Raket entity
│   │   ├── Ball.ts                # Top entity
│   │   ├── Brick.ts               # Tuğla base class
│   │   ├── StandardBrick.ts       # Normal tuğla (1 hit)
│   │   ├── StrongBrick.ts         # Güçlü tuğla (2 hit)
│   │   ├── MetalBrick.ts          # Metal tuğla (3 hit)
│   │   ├── MovingBrick.ts         # Hareketli tuğla
│   │   └── PowerUp.ts             # Power-up entity
│   │
│   ├── ui/
│   │   ├── Button.ts              # Custom button
│   │   ├── StarDisplay.ts         # Yıldız gösterimi
│   │   ├── LivesDisplay.ts        # Can gösterimi
│   │   ├── ScoreDisplay.ts        # Skor gösterimi
│   │   ├── LevelCard.ts           # Seviye kartı
│   │   ├── WorldCard.ts           # Dünya kartı
│   │   └── PowerUpIcon.ts         # Aktif power-up gösterimi
│   │
│   ├── types/
│   │   ├── GameTypes.ts           # Type definitions
│   │   ├── LevelTypes.ts          # Level data types
│   │   └── SceneData.ts           # Scene data interfaces
│   │
│   └── assets/
│       ├── images/
│       │   ├── paddle/            # Raket sprite'ları
│       │   ├── balls/             # Top sprite'ları
│       │   ├── bricks/            # Tuğla sprite'ları
│       │   ├── powerups/          # Power-up ikonları
│       │   └── ui/                # UI elementleri
│       ├── sounds/
│       │   ├── brick_hit.mp3
│       │   ├── paddle_hit.mp3
│       │   ├── power_up.mp3
│       │   ├── ball_lost.mp3
│       │   └── level_complete.mp3
│       ├── particles/             # Partikül sprite'ları
│       └── fonts/                 # Custom fontlar
│
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icon-192.png
│   ├── icon-512.png
│   └── robots.txt
│
├── android/                       # Capacitor Android
├── ios/                           # Capacitor iOS
│
├── tests/
│   └── unit/                      # Vitest testleri
│
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Geliştirme Adımları

### PHASE 1: Proje Setup (1-2 saat)
### PHASE 2: Core Game Mechanics (4-5 saat)
### PHASE 3: Brick System (2-3 saat)
### PHASE 4: Power-Up System (2-3 saat)
### PHASE 5: Level & Progression (3-4 saat)
### PHASE 6: UI/UX Implementation (3-4 saat)
### PHASE 7: Polish & Effects (2-3 saat)
### PHASE 8: Testing & Optimization (2-3 saat)
### PHASE 9: Deployment (2-3 saat)

**Toplam Tahmini Süre**: 21-30 saat

---

## 🤖 AI Promptları

---

## PHASE 1: Proje Setup

### PROMPT 1.1: Proje İnit
```
Create a new Vite + TypeScript + Phaser.js project for a Brick Breaker game:

1. Initialize Vite project with TypeScript template
2. Install dependencies:
   - phaser@^3.80.0
   - typescript@^5.0.0
   - vite@^5.0.0
   - @capacitor/core@^5.0.0
   - @capacitor/cli@^5.0.0

3. Configure vite.config.ts:
   - Base path: './'
   - Build target: ES2020
   - Output dir: 'dist'
   - Asset handling for Phaser
   - PWA plugin configuration

4. Configure tsconfig.json:
   - Strict mode: true
   - Target: ES2020
   - Path aliases:
     - @/* -> ./src/*
     - @scenes/* -> ./src/scenes/*
     - @systems/* -> ./src/systems/*
     - @entities/* -> ./src/entities/*
     - @ui/* -> ./src/ui/*
     - @config/* -> ./src/config/*

5. Create folder structure as outlined above

6. Add scripts to package.json:
   - dev: vite
   - build: tsc && vite build
   - preview: vite preview
   - test: vitest
   - android: cap sync android && cap open android
   - ios: cap sync ios && cap open ios

Provide all configuration files.
```

### PROMPT 1.2: Capacitor Setup
```
Set up Capacitor for iOS and Android:

1. Initialize Capacitor:
   - App name: "Brick Breaker"
   - App ID: "com.yourstudio.brickbreaker"
   - Web dir: "dist"

2. Install plugins:
   - @capacitor/admob@^5.0.0
   - @capacitor/haptics@^5.0.0
   - @capacitor/status-bar@^5.0.0
   - @capacitor/splash-screen@^5.0.0

3. Configure capacitor.config.ts:
   - Server URL for dev mode
   - iOS settings (minimum iOS 13)
   - Android settings (minimum SDK 22)
   - Enable live reload
   - Orientation: portrait

Provide complete capacitor.config.ts.
```

### PROMPT 1.3: ESLint + Prettier
```
Configure ESLint and Prettier:

1. Install:
   - eslint
   - @typescript-eslint/parser
   - @typescript-eslint/eslint-plugin
   - eslint-config-prettier
   - prettier

2. .eslintrc.json:
   - TypeScript parser
   - Recommended rules
   - Complexity: 15 (brick breaker has more complex logic)
   - Max line length: 100

3. .prettierrc:
   - Single quotes
   - 2 spaces
   - Trailing comma: es5
   - Print width: 100

Provide both config files.
```

---

## PHASE 2: Core Game Mechanics

### PROMPT 2.1: Game Config & Constants
```
Create game configuration and constants:

FILE: src/config/GameConfig.ts
- Phaser.Types.Core.GameConfig
- Type: Phaser.AUTO
- Canvas: 375x667 (mobile portrait)
- Parent: 'game-container'
- Scale: FIT
- Physics: Matter.js (for realistic ball physics)
- Background: #1a1a2e
- Scenes: [BootScene, MenuScene, WorldMapScene, GameScene, PauseScene, LevelCompleteScene, GameOverScene, SettingsScene]

FILE: src/config/Constants.ts
- GAME_WIDTH = 375
- GAME_HEIGHT = 667
- PADDLE_WIDTH = 100
- PADDLE_HEIGHT = 15
- PADDLE_SPEED = 400
- BALL_RADIUS = 8
- BALL_BASE_SPEED = 300
- BALL_MAX_SPEED = 800
- BRICK_WIDTH = 40
- BRICK_HEIGHT = 20
- BRICK_PADDING = 5
- BRICK_OFFSET_TOP = 100
- BRICK_ROWS = 8
- BRICK_COLS = 8
- INITIAL_LIVES = 3
- POWER_UP_DROP_CHANCE = 0.15
- POWER_UP_FALL_SPEED = 100
- STAR_THRESHOLDS = { 
    ONE: { bricksPercent: 100, livesMin: 1 },
    TWO: { bricksPercent: 80, livesMin: 2 },
    THREE: { bricksPercent: 100, livesMin: 3, powerUpsMin: 2 }
  }
- WORLD_UNLOCK_REQUIREMENTS = [0, 10, 25, 40] // stars needed

FILE: src/config/AdConfig.ts
- Test/production AdMob IDs
- Banner + Interstitial
- USE_TEST_ADS = true

Provide all three files with TypeScript types.
```

### PROMPT 2.2: TypeScript Types
```
Create comprehensive type definitions:

FILE: src/types/GameTypes.ts
- Interface: GameData {
    highScores: Record<number, number>, // levelId -> score
    levelStars: Record<number, number>, // levelId -> stars (1-3)
    totalStars: number,
    unlockedWorlds: number[],
    unlockedThemes: string[],
    currentTheme: string,
    currentLevel: number,
    settings: Settings
  }
- Interface: Settings { soundEnabled, hapticEnabled, darkMode, particlesEnabled }
- Interface: Theme { id, name, colors, unlocked }
- Enum: BrickType { STANDARD, STRONG, METAL, MOVING, EXPLOSIVE }
- Enum: PowerUpType { MULTI_BALL, EXTEND_PADDLE, SLOW_BALL, FAST_BALL, STICKY_PADDLE, EXTRA_LIFE }
- Type: GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER'

FILE: src/types/LevelTypes.ts
- Interface: BrickData { row, col, type: BrickType, health, points }
- Interface: LevelConfig {
    id: number,
    worldId: number,
    name: string,
    bricks: BrickData[],
    ballSpeed: number,
    paddleWidth: number,
    powerUpChance: number,
    background: string
  }
- Interface: WorldData { id, name, levels: number[], unlockStars, theme }

FILE: src/types/SceneData.ts
- Interface: GameSceneData { levelId, theme }
- Interface: LevelCompleteData { levelId, score, stars, bricksDestroyed, totalBricks, lives, powerUpsUsed }

Provide all files with complete types.
```

### PROMPT 2.3: Storage Manager
```
Create LocalStorage wrapper with level progression:

FILE: src/systems/StorageManager.ts

Requirements:
1. Singleton pattern
2. Methods:
   - saveGameData(data: GameData): void
   - loadGameData(): GameData
   - resetGameData(): void
   - saveLevelScore(levelId, score, stars): void
   - getLevelScore(levelId): number
   - getLevelStars(levelId): number
   - getTotalStars(): number
   - isWorldUnlocked(worldId): boolean
   - unlockWorld(worldId): void
   - isLevelUnlocked(levelId): boolean
3. Default data with world 1 unlocked
4. Error handling
5. Versioning for future updates

Include JSDoc comments.
```

### PROMPT 2.4: Paddle Entity
```
Create the paddle controller:

FILE: src/entities/Paddle.ts

Requirements:
1. Extend Phaser.GameObjects.Rectangle (or Sprite later)
2. Constructor: (scene, x, y, width, height)
3. Matter.js physics body (static body, no gravity)
4. Properties:
   - defaultWidth: number
   - currentWidth: number
   - isSticky: boolean (for sticky power-up)
   - attachedBalls: Ball[]
5. Methods:
   - moveLeft(): void
   - moveRight(): void
   - moveTo(x: number): void (for touch control)
   - stop(): void
   - extend(): void (power-up)
   - shrink(): void
   - reset(): void
   - attachBall(ball: Ball): void
   - releaseBalls(): void
6. Screen boundary clamping
7. Smooth movement with velocity
8. Collision detection preparation

TypeScript class with proper types.
```

### PROMPT 2.5: Ball Entity
```
Create the ball with Matter.js physics:

FILE: src/entities/Ball.ts

Requirements:
1. Extend Phaser.Physics.Matter.Sprite
2. Constructor: (scene, x, y, radius)
3. Properties:
   - radius: number
   - baseSpeed: number
   - currentSpeed: number
   - isLaunched: boolean
   - isStuck: boolean (attached to paddle)
   - trailEffect: Phaser.GameObjects.Graphics (optional)
4. Methods:
   - launch(angle?: number): void
   - setSpeed(speed: number): void
   - increaseSpeed(amount: number): void
   - decreaseSpeed(amount: number): void
   - reset(x, y): void
   - attachToPaddle(paddle: Paddle): void
   - bounce(surface: 'paddle' | 'brick' | 'wall'): void
   - destroy(): void
5. Physics:
   - Circular body
   - No gravity
   - Bounce: 1 (perfect elastic collision)
   - Friction: 0
   - Restitution: 1
6. Speed limiting (min/max)
7. Trail effect rendering
8. Angle constraints (prevent horizontal bounces)

Include physics constants and collision handling.
```

---

## PHASE 3: Brick System

### PROMPT 3.1: Base Brick Class
```
Create the base brick entity:

FILE: src/entities/Brick.ts

Requirements:
1. Extend Phaser.GameObjects.Rectangle (or Sprite)
2. Abstract base class
3. Constructor: (scene, x, y, width, height, type: BrickType)
4. Properties:
   - type: BrickType
   - health: number
   - maxHealth: number
   - points: number
   - color: number
   - isDestroyed: boolean
5. Methods:
   - hit(damage: number): boolean // returns true if destroyed
   - destroy(): void
   - abstract onHit(): void // for particle effects
   - abstract getColor(): number
6. Matter.js static body (no movement unless MovingBrick)
7. Visual feedback on hit (flash, color change)
8. Emit events for scoring and destruction

Provide abstract class with TypeScript.
```

### PROMPT 3.2: Brick Variations
```
Create different brick types:

FILE: src/entities/StandardBrick.ts
- Extends Brick
- Health: 1
- Points: 10
- Color: Based on row/theme
- Destroyed in one hit

FILE: src/entities/StrongBrick.ts
- Extends Brick
- Health: 2
- Points: 20
- Color: Darker shade, cracks appear after first hit
- Visual state change on damage

FILE: src/entities/MetalBrick.ts
- Extends Brick
- Health: 3
- Points: 50
- Color: Metallic silver/gray
- Particle spark effect on hit
- Cannot be destroyed by explosive power-ups

FILE: src/entities/MovingBrick.ts
- Extends Brick
- Health: 1
- Points: 30
- Horizontal movement (tween or physics)
- Movement bounds
- Speed: slow oscillation

Provide all four classes with proper inheritance and effects.
```

### PROMPT 3.3: Brick Manager
```
Create brick spawning and management system:

FILE: src/systems/BrickManager.ts

Requirements:
1. Class (no singleton, per-scene instance)
2. Properties:
   - scene: Phaser.Scene
   - bricks: Brick[]
   - bricksGroup: Phaser.GameObjects.Group
   - totalBricks: number
   - destroyedBricks: number
3. Methods:
   - createBricksFromLevel(levelConfig: LevelConfig): void
   - createBrick(data: BrickData): Brick
   - onBrickHit(brick: Brick, ball: Ball): void
   - onBrickDestroyed(brick: Brick): void
   - getBricksRemaining(): number
   - getDestructionPercent(): number
   - clearAll(): void
   - update(delta: number): void // for moving bricks
4. Factory pattern for creating different brick types
5. Collision handling integration
6. Event emission for scoring
7. Power-up drop logic on brick destruction

Include grid calculation utilities.
```

---

## PHASE 4: Power-Up System

### PROMPT 4.1: Power-Up Entity
```
Create the power-up collectible:

FILE: src/entities/PowerUp.ts

Requirements:
1. Extend Phaser.GameObjects.Sprite
2. Constructor: (scene, x, y, type: PowerUpType)
3. Properties:
   - type: PowerUpType
   - fallSpeed: number
   - isActive: boolean
   - duration: number (for timed power-ups)
4. Methods:
   - update(delta: number): void // falling
   - collect(): void
   - destroy(): void
   - getIcon(): string // sprite key based on type
5. Arcade physics body (gravity)
6. Auto-destroy when off-screen
7. Visual: Icon with glow effect
8. Rotation animation while falling

Different icons for each power-up type.
```

### PROMPT 4.2: Power-Up Manager
```
Create power-up management system:

FILE: src/systems/PowerUpManager.ts

Requirements:
1. Class (per-scene instance)
2. Properties:
   - scene: Phaser.Scene
   - paddle: Paddle
   - ball: Ball (or balls array)
   - activePowerUps: Map<PowerUpType, Timer>
   - powerUpsUsedCount: number
3. Methods:
   - spawnPowerUp(x, y): void // random type
   - checkPaddleCollision(powerUp: PowerUp): void
   - activatePowerUp(type: PowerUpType): void
   - deactivatePowerUp(type: PowerUpType): void
   - update(delta: number): void
   - clearAll(): void
4. Power-up effects:
   - MULTI_BALL: Spawn 2 extra balls
   - EXTEND_PADDLE: Increase paddle width by 30%
   - SLOW_BALL: Reduce ball speed by 40%
   - FAST_BALL: Increase ball speed by 40%
   - STICKY_PADDLE: Ball sticks, tap to launch
   - EXTRA_LIFE: Add 1 life
5. Duration timers (except EXTRA_LIFE and MULTI_BALL)
6. Visual indicators for active power-ups
7. Prevent conflicting power-ups (slow/fast ball)

Include power-up probabilities and durations.
```

---

## PHASE 5: Level & Progression

### PROMPT 5.1: Level Data Configuration
```
Create level configurations:

FILE: src/config/LevelData.ts

Requirements:
1. Export const WORLDS: WorldData[]
2. Define 4 worlds, each with 5 levels (20 total)

World 1 - "Beginner's Lane":
- Levels 1-5
- Simple brick patterns (rows, pyramids)
- Only StandardBrick
- ballSpeed: 300-350
- Theme: Blue/Green

World 2 - "Intermediate Zone":
- Levels 6-10
- Mixed brick types (Standard + Strong)
- Some gaps in patterns
- ballSpeed: 350-400
- Theme: Orange/Yellow

World 3 - "Advanced Arena":
- Levels 11-15
- All brick types (including Metal)
- MovingBricks introduced
- Complex patterns
- ballSpeed: 400-500
- Theme: Purple/Pink

World 4 - "Expert Challenge":
- Levels 16-20
- Dense metal brick patterns
- Multiple moving bricks
- Minimal Standard bricks
- ballSpeed: 500-600
- Theme: Red/Dark

3. Each level should have:
   - Unique brick layout (grid positions)
   - Brick type distribution
   - Difficulty curve
   - Visually interesting patterns

Provide complete level data with at least 5 distinct patterns.
```

### PROMPT 5.2: Level Manager
```
Create level loading and management:

FILE: src/systems/LevelManager.ts

Requirements:
1. Singleton class
2. Methods:
   - loadLevel(levelId: number): LevelConfig
   - getWorld(worldId: number): WorldData
   - isLevelUnlocked(levelId: number): boolean
   - getNextLevel(currentLevelId: number): number | null
   - getPreviousLevel(currentLevelId: number): number | null
   - getLevelsInWorld(worldId: number): LevelConfig[]
3. Validation:
   - Level ID exists
   - World unlock requirements met
4. Integration with StorageManager
5. Level progression logic
6. World map data generation

Keep it clean and maintainable.
```

### PROMPT 5.3: Progression Manager
```
Create progression and unlock system:

FILE: src/systems/ProgressionManager.ts

Requirements:
1. Singleton class
2. Methods:
   - completeLevel(levelId, score, stats): void
   - calculateStars(levelId, stats): number
   - unlockNextLevel(): void
   - checkWorldUnlock(): void
   - getTotalStars(): number
   - getWorldProgress(worldId): { completed, total, stars }
3. Star calculation logic:
   - 1 star: Complete level
   - 2 stars: 80%+ bricks destroyed + 2+ lives remaining
   - 3 stars: 100% bricks destroyed + 3 lives remaining + 2+ power-ups used
4. World unlock logic:
   - World 2: 10 stars
   - World 3: 25 stars
   - World 4: 40 stars
5. Achievement tracking (future)
6. Save progress to StorageManager

Include validation and edge case handling.
```

---

## PHASE 6: UI/UX Implementation

### PROMPT 6.1: Menu Scene
```
Create the main menu:

FILE: src/scenes/MenuScene.ts

Requirements:
1. Extend Phaser.Scene
2. Key: 'Menu'
3. UI Elements:
   - Game title/logo (large, animated)
   - "PLAY" button (large, center)
   - "CONTINUE" button (if progress exists)
   - Settings button (top right)
   - Total stars display (top left with icon)
   - Theme selector (bottom carousel)
   - "How to Play" button
4. Methods:
   - create(): Setup UI
   - startGame(): Go to WorldMapScene
   - continueGame(): Resume last level
   - openSettings(): Launch SettingsScene
   - showHowToPlay(): Show tutorial overlay
5. Animations:
   - Title bounce/pulse
   - Button hover effects
   - Star count increment animation
6. Banner ad at bottom
7. Background particles (theme-based)

Modern, colorful design with good spacing.
```

### PROMPT 6.2: World Map Scene
```
Create world/level selection screen:

FILE: src/scenes/WorldMapScene.ts

Requirements:
1. Extend Phaser.Scene
2. Key: 'WorldMap'
3. UI Layout:
   - Scrollable world map (vertical scroll)
   - 4 world cards
   - Each world shows:
     - World name
     - 5 level buttons
     - Stars earned / total stars possible
     - Lock icon if not unlocked
4. Level buttons show:
   - Level number
   - Stars earned (1-3 or empty)
   - High score
   - Lock icon if not unlocked
5. Methods:
   - create(): Build world map
   - selectLevel(levelId): Launch GameScene
   - scrollToWorld(worldId): Auto-scroll animation
   - updateStars(): Refresh star displays
6. Visual feedback:
   - Completed levels: colored/highlighted
   - Current level: pulsing glow
   - Locked levels: grayscale
7. Back button to MenuScene

Clean, map-like layout with path connecting levels.
```

### PROMPT 6.3: Game Scene - Part 1 (Setup)
```
Create the main game scene - Part 1:

FILE: src/scenes/GameScene.ts

Requirements for setup:
1. Extend Phaser.Scene
2. Key: 'Game'
3. Properties:
   - paddle: Paddle
   - balls: Ball[]
   - brickManager: BrickManager
   - powerUpManager: PowerUpManager
   - levelConfig: LevelConfig
   - gameState: GameState
   - score: number
   - lives: number
   - combo: number
   - powerUpsUsed: