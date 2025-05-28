import { GAME_CONSTANTS } from './constants';
import { CircleCollider } from './Collider';
import { CollisionSystem } from './CollisionSystem';
import { Maze, CellType } from './Maze';
import { ParticleSystem } from './Particle';
import { Player } from './Player';
import { Position } from './types';
import { AudioManager } from './AudioManager';

export class PelletManager {
    private maze: Maze;
    private collisionSystem: CollisionSystem;
    private particleSystem: ParticleSystem;
    private player: Player;
    private score: number = 0;
    private scoreElement: HTMLElement;
    private audioManager: AudioManager;

    constructor(maze: Maze, collisionSystem: CollisionSystem, particleSystem: ParticleSystem, player: Player) {
        this.maze = maze;
        this.collisionSystem = collisionSystem;
        this.particleSystem = particleSystem;
        this.player = player;
        this.scoreElement = document.getElementById('score')!;
        this.audioManager = AudioManager.getInstance();
    }

    public checkPelletCollection(x: number, y: number): void {
        // Get the cell coordinates from the player position
        const cellX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const cellY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        
        // Define a small area around the player to check for pellets
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
                        
                        // Play sound effect
                        this.audioManager.playSound(isPowerPellet ? 'POWER_PELLET' : 'PELLET');
                        
                        // Create particle effect
                        this.particleSystem.createPelletExplosion(
                            { x: pelletX, y: pelletY }, 
                            isPowerPellet
                        );
                        
                        // Activate power-up if it's a power pellet
                        if (isPowerPellet) {
                            this.player.activateRandomPowerUp();
                        }
                        
                        // Only collect one pellet per frame to avoid multiple collections at intersections
                        return;
                    }
                }
            }
        }
    }

    public getScore(): number {
        return this.score;
    }

    public checkWinCondition(): boolean {
        return this.maze.getRegularPelletsCount() === 0;
    }
}
