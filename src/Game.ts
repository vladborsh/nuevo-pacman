import { GAME_CONSTANTS } from './constants';
import { Maze, CellType } from './Maze';
import { Player, PowerUpType, Direction } from './Player';
import { Enemy } from './Enemy';
import { EnemyFactory } from './EnemyFactory';
import { Position } from './types';
import { ParticleSystem } from './Particle';
import { ScreenShake } from './ScreenShake';
import { PauseManager } from './PauseManager';
import { CircleCollider } from './Collider';
import { CollisionSystem } from './CollisionSystem';
import { MazeRenderer } from './MazeRenderer';

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
    private score: number = 0;
    private scoreElement: HTMLElement;
    private enemyFactory: EnemyFactory;
    private particleSystem: ParticleSystem;
    private screenShake: ScreenShake;
    private powerUpInfoElement: HTMLElement;
    private pauseManager: PauseManager;
    private collisionSystem: CollisionSystem;
    private debugMode: boolean = false;
    
    constructor() {
        Game.instance = this;

        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        
        // Create or get the power-up info element
        this.powerUpInfoElement = document.getElementById('powerup-info') || this.createPowerUpInfoElement();
        
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
        
        // Create enemies
        this.spawnEnemies();
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Creates a power-up info element to display active power-up
     */
    private createPowerUpInfoElement(): HTMLElement {
        const gameInfo = document.getElementById('game-info')!;
        const powerUpInfo = document.createElement('div');
        powerUpInfo.id = 'powerup-info';
        powerUpInfo.style.marginLeft = '20px';
        powerUpInfo.style.display = 'inline';
        gameInfo.appendChild(powerUpInfo);
        return powerUpInfo;
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
        const powerUp = this.player.getActivePowerUp();
        let displayText = '';
        
        if (powerUp !== PowerUpType.NONE) {
            const timeRemaining = Math.ceil(this.player.getPowerUpTimeRemaining() / 1000);
            
            if (powerUp === PowerUpType.SPEED_BOOST) {
                displayText = `Speed Boost: ${timeRemaining}s`;
                this.powerUpInfoElement.style.color = '#00ffff'; // Cyan
            } else if (powerUp === PowerUpType.INVISIBILITY) {
                displayText = `Invisibility: ${timeRemaining}s`;
                this.powerUpInfoElement.style.color = '#aaaaff'; // Light blue
            }
        }
        
        this.powerUpInfoElement.textContent = displayText;
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
        
        // Check for pellet collection using player's position
        const playerPos = this.player.getPosition();
        this.checkPelletCollection(playerPos.x, playerPos.y);
        
        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, playerPos);
            
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
                this.screenShake.shake(300, 8); // 300ms duration, 8px magnitude
                // Reset the game
                this.resetGame();
            }
        }
        
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements
        this.ctx.save();
        if (this.screenShake.isShaking()) {
            const offset = this.screenShake.getOffset();
            this.ctx.translate(offset.x, offset.y);
        }

        this.mazeRenderer.draw(this.ctx, this.maze);
        this.player.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        this.pauseManager.draw(this.ctx);
        this.ctx.restore();
    }
    
    /**
     * Draws all colliders for debugging purposes
     * This is only used during development and can be toggled
     */
    private drawColliders(): void {
        // Draw player collider
        const playerCollider = this.player.getCollider();
        playerCollider.drawDebug(this.ctx, 'rgba(255, 255, 0, 0.5)');
        
        // Draw enemy colliders
        for (const enemy of this.enemies) {
            const enemyCollider = enemy.getCollider();
            enemyCollider.drawDebug(this.ctx, 'rgba(255, 0, 0, 0.5)');
        }
    }
    
    /**
     * Displays debug information on screen
     */
    private drawDebugInfo(): void {
        if (!this.debugMode) return;

        const playerPos = this.player.getPosition();
        const playerCollider = this.player.getCollider();
        const playerSpeed = this.player.getSpeed();
        
        // Direction is now imported at the top of the file
        
        const canMoveRight = this.collisionSystem.canMove(playerCollider, Direction.RIGHT, playerSpeed);
        const canMoveLeft = this.collisionSystem.canMove(playerCollider, Direction.LEFT, playerSpeed);
        const canMoveUp = this.collisionSystem.canMove(playerCollider, Direction.UP, playerSpeed);
        const canMoveDown = this.collisionSystem.canMove(playerCollider, Direction.DOWN, playerSpeed);

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 250, 100);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Position: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`, 15, 25);
        this.ctx.fillText(`Cell: (${Math.floor(playerPos.x / GAME_CONSTANTS.CELL_SIZE)}, ${Math.floor(playerPos.y / GAME_CONSTANTS.CELL_SIZE)})`, 15, 45);
        this.ctx.fillText(`Can move: R:${canMoveRight ? 'Y' : 'N'} L:${canMoveLeft ? 'Y' : 'N'} U:${canMoveUp ? 'Y' : 'N'} D:${canMoveDown ? 'Y' : 'N'}`, 15, 65);
        this.ctx.fillText('Toggle debug mode: Ctrl+D / Cmd+D', 15, 85);
        this.ctx.restore();
    }
    
    /**
     * Resets the game state
     */
    private resetGame(): void {
        // Reset player
        this.player.reset();
        
        // Reset enemies
        for (const enemy of this.enemies) {
            enemy.reset();
        }
        
        // Respawn enemies
        this.spawnEnemies();
    }
    
    /**
     * Helper method for collision detection
     */
    public checkCollision(x: number, y: number): boolean {
        return this.maze.isWall(x, y);
    }
    
    /**
     * Checks for pellet collection around the player position
     * @param x - Player x position
     * @param y - Player y position
     */
    private checkPelletCollection(x: number, y: number): void {
        // Get the cell coordinates from the player position
        const cellX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const cellY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        
        // Define a small area around the player to check for pellets
        // This creates a more forgiving collision detection for pellet collection
        const checkRadius = 1; // Check adjacent cells
        
        for (let offsetY = -checkRadius; offsetY <= checkRadius; offsetY++) {
            for (let offsetX = -checkRadius; offsetX <= checkRadius; offsetX++) {
                const checkX = cellX + offsetX;
                const checkY = cellY + offsetY;
                
                // Convert to pixel coordinates (center of cell)
                const pelletX = (checkX * GAME_CONSTANTS.CELL_SIZE) + (GAME_CONSTANTS.CELL_SIZE / 2);
                const pelletY = (checkY * GAME_CONSTANTS.CELL_SIZE) + (GAME_CONSTANTS.CELL_SIZE / 2);
                
                // Check if there's a pellet at this position
                const pellet = this.maze.getPelletAt(pelletX, pelletY);
                
                if (pellet !== null) {
                    // Create a temporary collider for the pellet
                    const pelletSize = pellet === CellType.POWER_PELLET ? 
                        GAME_CONSTANTS.POWER_PELLET_SIZE : 
                        GAME_CONSTANTS.PELLET_SIZE;
                    
                    const pelletCollider = new CircleCollider(
                        { x: pelletX, y: pelletY },
                        pelletSize
                    );
                    
                    // Check if player's collider intersects with pellet's collider
                    const playerCollider = this.player.getCollider();
                    
                    if (this.collisionSystem.checkCollision(playerCollider, pelletCollider)) {
                        // Collect the pellet
                        this.maze.removePellet(pelletX, pelletY);
                        const isPowerPellet = pellet === CellType.POWER_PELLET;
                        this.score += isPowerPellet ? 50 : 10;
                        this.scoreElement.textContent = this.score.toString();
                        
                        // Create particle effect
                        this.particleSystem.createPelletExplosion(
                            { x: pelletX, y: pelletY }, 
                            isPowerPellet
                        );
                        
                        // Handle power pellet effects
                        if (isPowerPellet) {
                            this.screenShake.shake(200, 5); // 200ms duration, 5px magnitude
                            this.player.activateRandomPowerUp();
                        }
                        
                        // Only collect one pellet per frame to avoid multiple collections at intersections
                        return;
                    }
                }
            }
        }
    }

    public static getInstance(): Game {
        return Game.instance;
    }

    public getParticleSystem(): ParticleSystem {
        return this.particleSystem;
    }
}
