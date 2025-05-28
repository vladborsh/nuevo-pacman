import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Player, PowerUpType } from './Player';
import { Enemy } from './Enemy';
import { EnemyFactory } from './EnemyFactory';
import { Position, Direction } from './types';
import { ParticleSystem } from './Particle';
import { ScreenShake } from './ScreenShake';
import { PauseManager } from './PauseManager';
import { CircleCollider } from './Collider';
import { CollisionSystem } from './CollisionSystem';
import { MazeRenderer } from './MazeRenderer';
import { WinManager } from './WinManager';
import { PowerUpInfoManager } from './PowerUpInfoManager';
import { PelletManager } from './PelletManager';
import { DebugRenderer } from './DebugRenderer';
import { SpawnCountdownManager } from './SpawnCountdownManager';

/**
 * Main game class that orchestrates gameplay
 */
export class Game {
    private static instance: Game;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private maze: Maze;
    private mazeRenderer: MazeRenderer;
    private player: Player;
    private enemies: Enemy[] = [];
    private enemyFactory: EnemyFactory;
    private particleSystem: ParticleSystem;
    private screenShake: ScreenShake;
    private pauseManager: PauseManager;
    private collisionSystem: CollisionSystem;
    private debugMode: boolean = false;
    private winManager: WinManager;
    private powerUpInfoManager: PowerUpInfoManager;
    private pelletManager: PelletManager;
    private debugRenderer: DebugRenderer;
    private lastTempEnemySpawn: number = 0;
    private readonly TEMP_ENEMY_SPAWN_INTERVAL = 30000; // 30 seconds
    private readonly TEMP_ENEMY_LIFESPAN = 15000; // 15 seconds
    private spawnCountdownManager: SpawnCountdownManager;

    constructor() {
        Game.instance = this;

        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Set canvas size
        this.canvas.width = GAME_CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = GAME_CONSTANTS.CANVAS_HEIGHT;
        
        // Initialize game components
        this.maze = new Maze();
        this.mazeRenderer = new MazeRenderer();
        this.collisionSystem = new CollisionSystem(this.maze);
        this.player = new Player(this.maze);
        this.enemyFactory = new EnemyFactory(this.maze);
        this.particleSystem = new ParticleSystem();
        this.screenShake = new ScreenShake();
        this.pauseManager = new PauseManager();
        this.winManager = new WinManager(this.particleSystem);
        this.powerUpInfoManager = new PowerUpInfoManager(this.player);
        this.spawnCountdownManager = new SpawnCountdownManager();
        this.pelletManager = new PelletManager(this.maze, this.collisionSystem, this.particleSystem, this.player);
        this.debugRenderer = new DebugRenderer(this.ctx, this.player, this.collisionSystem);
        
        // Create enemies
        this.spawnEnemies();
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Spawns enemies in the maze with different behaviors
     */
    private spawnEnemies(): void {
        this.enemies = this.enemyFactory.createEnemies();
    }
    
    /**
     * Handles keyboard input
     */
    private handleKeydown(e: KeyboardEvent): void {
        // Handle pause input through pause manager
        if (this.pauseManager.handleKeydown(e)) {
            return;
        }
        
        // Toggle debug mode with 'D' key
        if (e.key === 'D' || e.key === 'd') {
            if (e.ctrlKey || e.metaKey) {
                this.debugMode = !this.debugMode;
                console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
                return;
            }
        }
        
        // Only pass input to player if game is not paused
        if (!this.pauseManager.isPausedState()) {
            this.player.handleKeydown(e);
        }
    }
    
    /**
     * The main game loop
     */
    private gameLoop(currentTime: number): void {
        // Calculate delta time in milliseconds
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Clear canvas
        this.ctx.fillStyle = GAME_CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only update game state if not paused
        if (!this.pauseManager.isPausedState()) {
            this.update(deltaTime);
        }
        
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Updates the power-up info display
     */
    private updatePowerUpDisplay(): void {
        // Just let the manager handle the update
        this.powerUpInfoManager.update();
    }
    
    /**
     * Updates all game entities
     */
    private update(deltaTime: number) {
        // Update screen shake
        this.screenShake.update(deltaTime);
        
        // Update maze power pellets
        this.maze.updatePowerPellets(deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update power-up display
        this.updatePowerUpDisplay();
        
        // Check for pellet collection using player's position
        const playerPos = this.player.getPosition();
        this.pelletManager.checkPelletCollection(playerPos.x, playerPos.y);

        // Update countdown and spawn temporary enemies
        const countdownActive = this.spawnCountdownManager.update(deltaTime);
        
        // Only update spawn timer when countdown is not active
        if (!countdownActive) {
            this.lastTempEnemySpawn += deltaTime;
            // Check if it's time to spawn a new enemy and no countdown is running
            if (this.lastTempEnemySpawn >= this.TEMP_ENEMY_SPAWN_INTERVAL) {
                // Start the countdown and reset the timer
                this.lastTempEnemySpawn = 0;
                this.spawnCountdownManager.startCountdown(() => {
                    // 50% chance to spawn two enemies
                    const spawnCount = Math.random() < 0.5 ? 2 : 1;
                    
                    for (let i = 0; i < spawnCount; i++) {
                        const tempEnemy = this.enemyFactory.createTemporaryChaser(this.TEMP_ENEMY_LIFESPAN);
                        this.enemies.push(tempEnemy);
                        // Create a spawn particle effect
                        const pos = tempEnemy.getPosition();
                        this.particleSystem.createDeathExplosion(pos);
                    }
                });
            }
        }
        
        // Check win condition after pellet collection
        if (this.pelletManager.checkWinCondition()) {
            // Show win overlay
            this.winManager.show();
            
            // Shake the screen for victory effect
            this.screenShake.shake(GAME_CONSTANTS.GAME_EVENTS.WIN_SHAKE_DURATION, 
                                 GAME_CONSTANTS.GAME_EVENTS.WIN_SHAKE_MAGNITUDE);

            // Reset the game after a delay
            setTimeout(() => {
                this.winManager.hide();
                this.resetGame();
            }, GAME_CONSTANTS.GAME_EVENTS.WIN_RESET_DELAY);
            return;
        }
        
        // Update enemies and handle player collisions
        this.enemies = this.enemies.filter(enemy => {
            const isAlive = enemy.update(deltaTime, playerPos);
            
            if (!isAlive) {
                // Create despawn burst effect
                const pos = enemy.getPosition();
                this.particleSystem.createDeathExplosion(pos);
                return false;
            }

            // Check for collision with the player using the player's collider
            const playerCollider = this.player.getCollider();
            const enemyPos = enemy.getPosition();
            
            // Create a temporary enemy collider for collision detection
            const enemyCollider = new CircleCollider(
                enemyPos, 
                GAME_CONSTANTS.ENEMY.SIZE / 2
            );
            
            // Use collision system to check for intersection
            const collision = this.collisionSystem.checkCollision(playerCollider, enemyCollider);
            
            // If collision occurs and player is not invisible
            if (collision && !this.player.isInvisible()) {
                // Create death explosion at player's position
                this.particleSystem.createDeathExplosion(playerPos);
                
                // Shake the screen
                this.screenShake.shake(GAME_CONSTANTS.GAME_EVENTS.DEATH_SHAKE_DURATION,
                                     GAME_CONSTANTS.GAME_EVENTS.DEATH_SHAKE_MAGNITUDE);
                
                // Reset the game
                this.resetGame();
            }
            
            return true;
        });
        
        // Update particle system
        this.particleSystem.update(deltaTime);
    }
    
    /**
     * Calculates the distance between two positions
     */
    private calculateDistance(pos1: Position, pos2: Position): number {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2)
        );
    }
    
    /**
     * Draws the game state
     */
    private draw(): void {
        this.ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        this.ctx.fillStyle = GAME_CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        
        // Apply screen shake effect
        const shakeOffset = this.screenShake.getOffset();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);
        
        // Draw game elements
        this.mazeRenderer.draw(this.ctx, this.maze);
        this.particleSystem.draw(this.ctx); // Draw particles first (including enemy trails)
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx)); // Draw enemies on top of their trails
        
        // Reset screen shake translation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw countdown overlay
        this.spawnCountdownManager.draw(this.ctx);

        // Draw win overlay on top if active
        this.winManager.draw(this.ctx);

        // Draw pause overlay if game is paused
        this.pauseManager.draw(this.ctx);
        
        // Draw debug information if debug mode is active
        if (this.debugMode) {
            this.debugRenderer.drawDebugInfo();
            this.debugRenderer.drawColliders(this.enemies);
        }
    }

    /**
     * Resets the game state
     */
    private resetGame(): void {
        // Reset player
        this.player.reset();
        
        // Reset enemies and find new spawn positions for each
        for (const enemy of this.enemies) {
            enemy.reset();
            this.enemyFactory.resetEnemyPosition(enemy);
        }
        
        // Remove any temporary enemies
        this.enemies = this.enemies.filter(enemy => enemy.getLifespan() === null);
        
        // Respawn regular enemies if needed to maintain count
        if (this.enemies.length < GAME_CONSTANTS.ENEMY.COUNT) {
            this.spawnEnemies();
        }
    }
    
    /**
     * Helper method for collision detection
     */
    public checkCollision(x: number, y: number): boolean {
        return this.maze.isWall(x, y);
    }

    public static getInstance(): Game {
        return Game.instance;
    }

    public getParticleSystem(): ParticleSystem {
        return this.particleSystem;
    }
}
