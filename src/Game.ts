import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Player, PowerUpType } from './Player';
import { Enemy } from './Enemy';
import { EnemyFactory } from './EnemyFactory';
import { Position } from './types';
import { ParticleSystem } from './Particle';
import { ScreenShake } from './ScreenShake';
import { PauseManager } from './PauseManager';

/**
 * Main game class that orchestrates gameplay
 */
export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private maze: Maze;
    private player: Player;
    private enemies: Enemy[] = [];
    private score: number = 0;
    private scoreElement: HTMLElement;
    private enemyFactory: EnemyFactory;
    private particleSystem: ParticleSystem;
    private screenShake: ScreenShake;
    private powerUpInfoElement: HTMLElement;
    private pauseManager: PauseManager;
    
    constructor() {
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
        
        // Only pass input to player if game is not paused
        if (!this.pauseManager.isPausedState()) {
            this.player.handleKeydown(e);
        }
    }
    
    /**
     * Main game loop
     */
    private gameLoop(timestamp: number) {
        // Calculate delta time in milliseconds
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.fillStyle = GAME_CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only update game state if not paused
        if (!this.pauseManager.isPausedState()) {
            this.update(deltaTime);
        }
        
        // Draw game
        this.draw();
        
        // Update power-up display
        this.updatePowerUpDisplay();
        
        // Draw pause overlay if needed
        this.pauseManager.draw(this.ctx);
        
        // Schedule next frame
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
        
        // Update player
        this.player.update(deltaTime);
        
        // Check for pellet collection
        const playerPos = this.player.getPosition();
        const pellet = this.maze.getPelletAt(playerPos.x, playerPos.y);
        if (pellet !== null) {
            this.maze.removePellet(playerPos.x, playerPos.y);
            const isPowerPellet = pellet === 'power-pellet';
            this.score += isPowerPellet ? 50 : 10;
            this.scoreElement.textContent = this.score.toString();
            
            // Create particle effect and shake screen for power pellet
            this.particleSystem.createPelletExplosion(playerPos, isPowerPellet);
            
            if (isPowerPellet) {
                this.screenShake.shake(200, 5); // 200ms duration, 5px magnitude
                
                // Activate a random power-up when eating a power pellet
                this.player.activateRandomPowerUp();
            }
        }
        
        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, playerPos);
            
            // Check for collision with the player
            const enemyPos = enemy.getPosition();
            const distance = this.calculateDistance(playerPos, enemyPos);
            
            // If collision occurs and player is not invisible
            if (distance < GAME_CONSTANTS.COLLISION_TOLERANCE + GAME_CONSTANTS.PLAYER_SIZE / 2) {
                if (!this.player.isInvisible()) {
                    // Shake the screen
                    this.screenShake.shake(300, 8); // 300ms duration, 8px magnitude
                    // Reset the game
                    this.resetGame();
                }
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
     * Draws all game entities
     */
    private draw() {
        // Apply screen shake effect
        const shakeOffset = this.screenShake.getOffset();
        this.ctx.save();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);

        // Clear canvas
        this.ctx.fillStyle = GAME_CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(
            -shakeOffset.x, 
            -shakeOffset.y, 
            this.canvas.width, 
            this.canvas.height
        );
        
        // Draw maze
        this.maze.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Draw particles
        this.particleSystem.draw(this.ctx);

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
}
