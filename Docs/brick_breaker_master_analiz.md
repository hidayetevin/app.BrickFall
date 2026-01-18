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
│   ├── main.ts
│   ├── config/
│   │   ├── GameConfig.ts
│   │   ├── AdConfig.ts
│   │   ├── Constants.ts
│   │   └── LevelData.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── WorldMapScene.ts
│   │   ├── GameScene.ts
│   │   ├── PauseScene.ts
│   │   ├── LevelCompleteScene.ts
│   │   ├── GameOverScene.ts
│   │   └── SettingsScene.ts
│   │
│   ├── systems/
│   │   ├── PaddleController.ts
│   │   ├── BallPhysics.ts
│   │   ├── BrickManager.ts
│   │   ├── PowerUpManager.ts
│   │   ├── LevelManager.ts
│   │   ├── ProgressionManager.ts
│   │   ├── StarManager.ts
│   │   ├── ThemeManager.ts
│   │   ├── AdManager.ts
│   │   ├── SoundManager.ts
│   │   ├── ParticleManager.ts
│   │   ├── HapticManager.ts
│   │   └── StorageManager.ts
│   │
│   ├── entities/
│   │   ├── Paddle.ts
│   │   ├── Ball.ts
│   │   ├── Brick.ts
│   │   ├── StandardBrick.ts
│   │   ├── StrongBrick.ts
│   │   ├── MetalBrick.ts
│   │   ├── MovingBrick.ts
│   │   └── PowerUp.ts
│   │
│   ├── ui/
│   │   ├── Button.ts
│   │   ├── StarDisplay.ts
│   │   ├── LivesDisplay.ts
│   │   ├── ScoreDisplay.ts
│   │   ├── LevelCard.ts
│   │   ├── WorldCard.ts
│   │   └── PowerUpIcon.ts
│   │
│   ├── types/
│   │   ├── GameTypes.ts
│   │   ├── LevelTypes.ts
│   │   └── SceneData.ts
│   │
│   └── assets/
│       ├── images/
│       ├── sounds/
│       ├── particles/
│       └── fonts/
│
├── public/
├── android/
├── ios/
├── tests/
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

## 🤖 AI PROMPTLARI

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
   - Path aliases: @/*, @scenes/*, @systems/*, @entities/*, @ui/*, @config/*

5. Create folder structure as outlined

6. Add scripts to package.json:
   - dev, build, preview, test
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

3. Configure capacitor.config.ts with iOS/Android settings

Provide complete capacitor.config.ts.
```

### PROMPT 1.3: ESLint + Prettier
```
Configure ESLint and Prettier for TypeScript:

1. Install all necessary dependencies
2. .eslintrc.json: TypeScript parser, complexity: 15, max line: 100
3. .prettierrc: Single quotes, 2 spaces, trailing comma es5

Provide both config files.
```

---

## PHASE 2: Core Game Mechanics

### PROMPT 2.1: Game Config & Constants
```
Create game configuration and constants:

FILE: src/config/GameConfig.ts
- Phaser config with Matter.js physics
- Canvas: 375x667
- Scenes array with all 8 scenes

FILE: src/config/Constants.ts
- GAME_WIDTH/HEIGHT = 375/667
- PADDLE_WIDTH = 100, HEIGHT = 15, SPEED = 400
- BALL_RADIUS = 8, BASE_SPEED = 300, MAX_SPEED = 800
- BRICK_WIDTH = 40, HEIGHT = 20, PADDING = 5
- BRICK_OFFSET_TOP = 100
- BRICK_ROWS = 8, COLS = 8
- INITIAL_LIVES = 3
- POWER_UP_DROP_CHANCE = 0.15, FALL_SPEED = 100
- STAR_THRESHOLDS with conditions
- WORLD_UNLOCK_REQUIREMENTS = [0, 10, 25, 40]

FILE: src/config/AdConfig.ts
- Test/prod AdMob IDs
- USE_TEST_ADS = true

Provide all three with TypeScript types.
```

### PROMPT 2.2: TypeScript Types
```
Create comprehensive type definitions:

FILE: src/types/GameTypes.ts
- GameData: highScores, levelStars, totalStars, unlockedWorlds, unlockedThemes, currentTheme, currentLevel, settings
- Settings: soundEnabled, hapticEnabled, darkMode, particlesEnabled
- Theme: id, name, colors, unlocked
- BrickType enum: STANDARD, STRONG, METAL, MOVING, EXPLOSIVE
- PowerUpType enum: MULTI_BALL, EXTEND_PADDLE, SLOW_BALL, FAST_BALL, STICKY_PADDLE, EXTRA_LIFE
- GameState type

FILE: src/types/LevelTypes.ts
- BrickData: row, col, type, health, points
- LevelConfig: id, worldId, name, bricks array, ballSpeed, paddleWidth, powerUpChance, background
- WorldData: id, name, levels array, unlockStars, theme

FILE: src/types/SceneData.ts
- GameSceneData, LevelCompleteData

Provide all files.
```

### PROMPT 2.3: Storage Manager
```
Create LocalStorage wrapper:

FILE: src/systems/StorageManager.ts

Requirements:
1. Singleton pattern
2. Methods:
   - saveGameData, loadGameData, resetGameData
   - saveLevelScore(levelId, score, stars)
   - getLevelScore, getLevelStars, getTotalStars
   - isWorldUnlocked, unlockWorld
   - isLevelUnlocked
3. Default data with world 1 unlocked
4. Error handling and versioning

Include JSDoc.
```

### PROMPT 2.4: Paddle Entity
```
Create paddle controller:

FILE: src/entities/Paddle.ts

Requirements:
1. Extend Phaser.GameObjects.Rectangle
2. Constructor: (scene, x, y, width, height)
3. Matter.js static body
4. Properties: defaultWidth, currentWidth, isSticky, attachedBalls
5. Methods:
   - moveLeft, moveRight, moveTo, stop
   - extend, shrink, reset
   - attachBall, releaseBalls
6. Screen boundary clamping
7. Smooth movement

TypeScript class with types.
```

### PROMPT 2.5: Ball Entity
```
Create ball with Matter.js physics:

FILE: src/entities/Ball.ts

Requirements:
1. Extend Phaser.Physics.Matter.Sprite
2. Constructor: (scene, x, y, radius)
3. Properties: radius, baseSpeed, currentSpeed, isLaunched, isStuck, trailEffect
4. Methods:
   - launch, setSpeed, increaseSpeed, decreaseSpeed
   - reset, attachToPaddle, bounce, destroy
5. Physics: circular body, no gravity, bounce: 1, friction: 0
6. Speed limiting
7. Trail effect
8. Angle constraints

Include physics constants.
```

---

## PHASE 3: Brick System

### PROMPT 3.1: Base Brick Class
```
Create base brick entity:

FILE: src/entities/Brick.ts

Requirements:
1. Extend Phaser.GameObjects.Rectangle
2. Abstract base class
3. Constructor: (scene, x, y, width, height, type)
4. Properties: type, health, maxHealth, points, color, isDestroyed
5. Methods:
   - hit(damage): boolean
   - destroy()
   - abstract onHit()
   - abstract getColor()
6. Matter.js static body
7. Visual feedback on hit
8. Event emission

Abstract class with TypeScript.
```

### PROMPT 3.2: Brick Variations
```
Create different brick types:

FILE: src/entities/StandardBrick.ts
- Health: 1, Points: 10
- One-hit destroy

FILE: src/entities/StrongBrick.ts
- Health: 2, Points: 20
- Visual crack after first hit

FILE: src/entities/MetalBrick.ts
- Health: 3, Points: 50
- Metallic color, spark particles

FILE: src/entities/MovingBrick.ts
- Health: 1, Points: 30
- Horizontal oscillation

Provide all four with inheritance.
```

### PROMPT 3.3: Brick Manager
```
Create brick management system:

FILE: src/systems/BrickManager.ts

Requirements:
1. Per-scene instance
2. Properties: scene, bricks array, bricksGroup, totalBricks, destroyedBricks
3. Methods:
   - createBricksFromLevel(levelConfig)
   - createBrick(data)
   - onBrickHit, onBrickDestroyed
   - getBricksRemaining, getDestructionPercent
   - clearAll, update
4. Factory pattern for brick creation
5. Collision handling
6. Power-up drop logic

Include grid utilities.
```

---

## PHASE 4: Power-Up System

### PROMPT 4.1: Power-Up Entity
```
Create power-up collectible:

FILE: src/entities/PowerUp.ts

Requirements:
1. Extend Phaser.GameObjects.Sprite
2. Constructor: (scene, x, y, type)
3. Properties: type, fallSpeed, isActive, duration
4. Methods: update (falling), collect, destroy, getIcon
5. Arcade physics with gravity
6. Auto-destroy off-screen
7. Icon with glow effect
8. Rotation animation

Different icons per type.
```

### PROMPT 4.2: Power-Up Manager
```
Create power-up management:

FILE: src/systems/PowerUpManager.ts

Requirements:
1. Per-scene instance
2. Properties: scene, paddle, ball(s), activePowerUps Map, powerUpsUsedCount
3. Methods:
   - spawnPowerUp(x, y)
   - checkPaddleCollision
   - activatePowerUp, deactivatePowerUp
   - update, clearAll
4. Power-up effects:
   - MULTI_BALL: spawn 2 extra balls
   - EXTEND_PADDLE: +30% width
   - SLOW_BALL: -40% speed
   - FAST_BALL: +40% speed
   - STICKY_PADDLE: ball sticks
   - EXTRA_LIFE: +1 life
5. Duration timers
6. Visual indicators
7. Prevent conflicts

Include probabilities and durations.
```

---

## PHASE 5: Level & Progression

### PROMPT 5.1: Level Data Configuration
```
Create level configurations:

FILE: src/config/LevelData.ts

Requirements:
1. Export WORLDS: WorldData[]
2. 4 worlds × 5 levels = 20 total

World 1 "Beginner's Lane" (Levels 1-5):
- Simple patterns (rows, pyramids)
- Only StandardBrick
- ballSpeed: 300-350
- Theme: Blue/Green

World 2 "Intermediate Zone" (Levels 6-10):
- Standard + Strong bricks
- Some gaps
- ballSpeed: 350-400
- Theme: Orange/Yellow

World 3 "Advanced Arena" (Levels 11-15):
- All types including Metal
- MovingBricks introduced
- Complex patterns
- ballSpeed: 400-500
- Theme: Purple/Pink

World 4 "Expert Challenge" (Levels 16-20):
- Dense metal patterns
- Multiple moving bricks
- ballSpeed: 500-600
- Theme: Red/Dark

3. Each level: unique layout, brick distribution, visual patterns

Provide complete data with 5+ distinct patterns.
```

### PROMPT 5.2: Level Manager
```
Create level loading system:

FILE: src/systems/LevelManager.ts

Requirements:
1. Singleton
2. Methods:
   - loadLevel(levelId)
   - getWorld(worldId)
   - isLevelUnlocked
   - getNextLevel, getPreviousLevel
   - getLevelsInWorld
3. Validation
4. StorageManager integration
5. Progression logic

Clean and maintainable.
```

### PROMPT 5.3: Progression Manager
```
Create progression and unlock system:

FILE: src/systems/ProgressionManager.ts

Requirements:
1. Singleton
2. Methods:
   - completeLevel(levelId, score, stats)
   - calculateStars(levelId, stats)
   - unlockNextLevel
   - checkWorldUnlock
   - getTotalStars
   - getWorldProgress
3. Star calculation logic (1-3 stars)
4. World unlock: World 2=10★, World 3=25★, World 4=40★
5. Achievement tracking
6. Save to StorageManager

Include validation.
```

---

## PHASE 6: UI/UX Implementation

### PROMPT 6.1: Menu Scene
```
Create main menu:

FILE: src/scenes/MenuScene.ts

Requirements:
1. Extend Phaser.Scene, Key: 'Menu'
2. UI Elements:
   - Game title/logo (animated)
   - "PLAY" button (large center)
   - "CONTINUE" button (if progress exists)
   - Settings button (top right)
   - Total stars display (top left)
   - Theme carousel (bottom)
   - "How to Play" button
3. Methods: create, startGame, continueGame, openSettings, showHowToPlay
4. Animations: title bounce, button hover, star count increment
5. Banner ad at bottom
6. Background particles

Modern colorful design.
```

### PROMPT 6.2: World Map Scene
```
Create world/level selection:

FILE: src/scenes/WorldMapScene.ts

Requirements:
1. Key: 'WorldMap'
2. UI Layout:
   - Scrollable vertical world map
   - 4 world cards
   - Each world: name, 5 level buttons, stars earned/total, lock icon
3. Level buttons: number, stars (1-3), high score, lock icon
4. Methods: create, selectLevel, scrollToWorld, updateStars
5. Visual feedback: completed=colored, current=pulsing, locked=grayscale
6. Back button

Map-like layout with connecting paths.
```

### PROMPT 6.3: Game Scene - Part 1 (Setup)
```
Create main game scene - Setup:

FILE: src/scenes/GameScene.ts

Requirements:
1. Key: 'Game'
2. Properties:
   - paddle, balls array, brickManager, powerUpManager
   - levelConfig, gameState, score, lives, combo, powerUpsUsed
3. Methods:
   - init(data: GameSceneData)
   - create()
4. Create method:
   - Load level config
   - Set background
   - Create paddle at bottom center
   - Create initial ball (attached to paddle)
   - Create bricks via BrickManager
   - Setup Matter.js collision detection
   - Create UI (score, lives, level name, pause button)
   - Setup touch/keyboard input
   - Setup collision events

Focus on setup only, no game loop yet.
```

### PROMPT 6.4: Game Scene - Part 2 (Game Loop)
```
Continue Game Scene - Game Loop:

Add to: src/scenes/GameScene.ts

Requirements:
1. Update method:
   - Update balls, paddle, brickManager, powerUpManager
   - Check ball boundaries (lose life if falls)
   - Update UI
   - Check win condition (all bricks destroyed)
2. Input handling:
   - Touch/mouse drag for paddle
   - Tap to launch ball if attached
   - Keyboard arrow keys
3. Collision callbacks:
   - Ball vs Brick: damage brick, increase score, combo, spawn power-up chance
   - Ball vs Paddle: bounce with angle based on hit position
   - Ball vs Wall: bounce
   - Paddle vs PowerUp: collect and activate
4. Life system:
   - onBallLost(): decrease life, reset ball, check game over
5. Win condition:
   - All destructible bricks destroyed → levelComplete()
6. Pause:
   - pauseGame(): launch PauseScene as overlay

Include combo multiplier logic and sound effects.
```

### PROMPT 6.5: Pause Scene
```
Create pause overlay:

FILE: src/scenes/PauseScene.ts

Requirements:
1. Key: 'Pause'
2. Overlay scene (doesn't stop GameScene)
3. UI:
   - Semi-transparent dark background
   - "PAUSED" title
   - "RESUME" button
   - "RESTART" button
   - "QUIT" button (return to WorldMap)
4. Methods:
   - resume(): close overlay, resume GameScene
   - restart(): reload GameScene
   - quit(): stop GameScene, go to WorldMapScene
5. Pause GameScene physics when overlay opens

Simple, centered layout.
```

### PROMPT 6.6: Level Complete Scene
```
Create level completion screen:

FILE: src/scenes/LevelCompleteScene.ts

Requirements:
1. Key: 'LevelComplete'
2. Receive data: LevelCompleteData (score, stars, stats)
3. UI:
   - "LEVEL COMPLETE!" title
   - Score display (large)
   - Stars earned (1-3 animated)
   - Stats: bricks destroyed, lives remaining, power-ups used
   - High score indicator (if new)
   - "NEXT LEVEL" button
   - "REPLAY" button
   - "WORLD MAP" button
4. Methods:
   - create(): animate UI elements
   - nextLevel(): load next level or go to WorldMap if last level
   - replay(): restart current level
   - worldMap(): return to WorldMapScene
5. Star animation: fade in one by one with haptic feedback
6. Save progress via ProgressionManager
7. Show interstitial ad before scene

Celebratory feel with confetti particles.
```

### PROMPT 6.7: Game Over Scene
```
Create game over screen:

FILE: src/scenes/GameOverScene.ts

Requirements:
1. Key: 'GameOver'
2. Receive data: { score, levelId, bricksDestroyed, totalBricks }
3. UI:
   - "GAME OVER" title
   - Final score
   - Progress: "X/Y bricks destroyed"
   - "TRY AGAIN" button
   - "WORLD MAP" button
4. Methods:
   - tryAgain(): restart level
   - worldMap(): return to WorldMapScene
5. Show interstitial ad
6. No progress saved (failed level)

Encouraging tone, suggest retry.
```

### PROMPT 6.8: Settings Scene
```
Create settings screen:

FILE: src/scenes/SettingsScene.ts

Requirements:
1. Key: 'Settings'
2. UI:
   - "SETTINGS" title
   - Sound toggle
   - Haptic toggle
   - Dark mode toggle
   - Particles toggle
   - "RESET PROGRESS" button (with confirmation)
   - "BACK" button
3. Methods:
   - toggleSound, toggleHaptic, toggleDarkMode, toggleParticles
   - resetProgress (with native confirm)
   - back
4. Visual feedback: highlight active toggles
5. Save to StorageManager

Clean, accessible design.
```

### PROMPT 6.9: Custom UI Components
```
Create reusable UI components:

FILE: src/ui/Button.ts
- Extend Container
- Constructor: (scene, x, y, text, onClick, color?)
- Touch-friendly (min 44x44px)
- Haptic on click, scale animation

FILE: src/ui/StarDisplay.ts
- Show 1-3 stars with fill/empty states
- Animated reveal
- Constructor: (scene, x, y, stars)
- Method: animateStars(onComplete)

FILE: src/ui/LivesDisplay.ts
- Show heart icons for remaining lives
- Constructor: (scene, x, y, lives)
- Methods: setLives(lives), animate loss

FILE: src/ui/ScoreDisplay.ts
- Animated score counter
- Constructor: (scene, x, y, initialScore)
- Methods: setScore(score), addScore(points)

FILE: src/ui/LevelCard.ts
- Level button for WorldMapScene
- Shows: number, stars, high score, lock
- Constructor: (scene, x, y, levelData, onSelect)

FILE: src/ui/WorldCard.ts
- World container for WorldMapScene
- Shows: name, level cards, total stars, lock
- Constructor: (scene, x, y, worldData)

FILE: src/ui/PowerUpIcon.ts
- Show active power-up with timer
- Constructor: (scene, x, y, type, duration)
- Method: updateTimer(remaining)

Provide all components with TypeScript.
```

---

## PHASE 7: Polish & Effects

### PROMPT 7.1: Particle Manager
```
Create particle effect system:

FILE: src/systems/ParticleManager.ts

Requirements:
1. Singleton
2. Particle effects:
   - brickDestroy(x, y, color): explosion particles
   - paddleHit(x, y): small sparks
   - powerUpCollect(x, y, type): glow effect
   - ballTrail(x, y): follow ball
   - levelComplete(): confetti burst
3. Methods:
   - init(scene)
   - createEffect(type, x, y, params)
   - clearAll()
4. Use Phaser.GameObjects.Particles.ParticleEmitter
5. Performance optimization: object pooling
6. Settings integration (can disable particles)

Include presets for each effect type.
```

### PROMPT 7.2: Sound Manager Enhancement
```
Enhance sound system:

FILE: src/systems/SoundManager.ts

Requirements:
1. Add game-specific sounds:
   - 'brick_hit': Different pitch per brick type
   - 'paddle_hit': Bounce sound
   - 'power_up': Collect sound
   - 'ball_lost': Sad tone
   - 'level_complete': Victory fanfare
   - 'combo': Increasing pitch for combo
2. Methods:
   - playBrickHit(brickType)
   - playCombo(comboCount)
   - playAmbient(track) // background music
   - stopAmbient()
3. Volume levels per category (sfx, music)
4. Settings integration

Use Web Audio API or Phaser sound with variations.
```

### PROMPT 7.3: Animation Polish
```
Add animations and juice:

Update multiple files to add:

1. Brick hit animation:
   - Flash white on hit
   - Shake effect
   - Scale tween
   - Particle burst

2. Paddle animations:
   - Squeeze effect on ball bounce
   - Glow when power-up active
   - Extend/shrink tween

3. Ball animations:
   - Trail effect (gradient fade)
   - Speed lines when fast
   - Glow when powered up

4. UI animations:
   - Score number popup on points
   - Lives heart beat on loss
   - Combo multiplier text grow
   - Power-up icon pulse

5. Screen shake on important events:
   - Ball lost
   - Brick destroyed (small)
   - Level complete (big)

Provide utility functions and integration examples.
```

### PROMPT 7.4: Theme Manager Enhancement
```
Enhance theme system with full themes:

FILE: src/systems/ThemeManager.ts

Requirements:
1. 5 complete themes (same as Dodge Game)
2. Each theme includes:
   - Background color/gradient
   - Paddle color
   - Ball color
   - Brick colors (per type)
   - UI colors
   - Particle colors
3. Methods:
   - getAllThemes()
   - getTheme(id)
   - getCurrentTheme()
   - setCurrentTheme(id)
   - isThemeUnlocked(id)
   - unlockTheme(id)
   - applyThemeToScene(scene)
4. Unlock costs:
   - Theme 1 (Classic): Free
   - Theme 2 (Ocean): 15 stars
   - Theme 3 (Sunset): 30 stars
   - Theme 4 (Forest): 45 stars
   - Theme 5 (Neon): 60 stars
5. Light/dark mode variants
6. StorageManager integration

Include smooth theme transition animations.
```

---

## PHASE 8: Testing & Optimization

### PROMPT 8.1: Unit Tests - Storage
```
Create unit tests for StorageManager:

FILE: tests/unit/StorageManager.test.ts

Use Vitest. Test cases:
- Save and load game data
-