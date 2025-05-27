import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { EnemyFactory } from './EnemyFactory';
import { Position } from './types';
import { ParticleSystem } from './Particle';

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
    
    constructor() {
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        
        // Set canvas size
        this.canvas.width = GAME_CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = GAME_CONSTANTS.CANVAS_HEIGHT;
        
        // Initialize game components
        this.maze = new Maze();
        this.player = new Player(this.maze);
        this.enemyFactory = new EnemyFactory(this.maze);
        this.particleSystem = new ParticleSystem();
        
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
        this.player.handleKeydown(e);
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
        
        // Update game state
        this.update(deltaTime);
        
        // Draw game
        this.draw();
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Updates all game entities
     */
    private update(deltaTime: number) {
        // Update player
        this.player.update();
        
        // Check for pellet collection
        const playerPos = this.player.getPosition();
        const pellet = this.maze.getPelletAt(playerPos.x, playerPos.y);
        if (pellet !== null) {
            this.maze.removePellet(playerPos.x, playerPos.y);
            const isPowerPellet = pellet === 'power-pellet';
            this.score += isPowerPellet ? 50 : 10;
            this.scoreElement.textContent = this.score.toString();
            
            // Create particle effect
            this.particleSystem.createPelletExplosion(playerPos, isPowerPellet);
        }
        
        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, playerPos);
            
            // Check for collision with the player
            const enemyPos = enemy.getPosition();
            const distance = this.calculateDistance(playerPos, enemyPos);
            
            // If collision occurs
            if (distance < GAME_CONSTANTS.COLLISION_TOLERANCE + GAME_CONSTANTS.PLAYER_SIZE / 2) {
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
     * Draws all game entities
     */
    private draw() {
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
