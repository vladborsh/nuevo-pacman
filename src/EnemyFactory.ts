import { GAME_CONSTANTS } from './constants';
import { Enemy } from './Enemy';
import { EnemyBehavior, MazeInterface, GridPosition } from './types';

/**
 * Factory class to handle enemy creation and spawning
 */
export class EnemyFactory {
    private maze: MazeInterface;
    
    constructor(maze: MazeInterface) {
        this.maze = maze;
    }
    
    /**
     * Creates enemies based on the game configuration
     * @returns Array of enemies
     */
    public createEnemies(): Enemy[] {
        const enemies: Enemy[] = [];
        
        // Create enemies with different behaviors
        if (GAME_CONSTANTS.ENEMY_COUNT >= 1) {
            // Red ghost - direct chaser
            enemies.push(this.createEnemy(
                GAME_CONSTANTS.ENEMY_COLORS[0], 
                EnemyBehavior.DIRECT
            ));
        }
        
        if (GAME_CONSTANTS.ENEMY_COUNT >= 2) {
            // Cyan ghost - tries to ambush by targeting ahead of the player
            enemies.push(this.createEnemy(
                GAME_CONSTANTS.ENEMY_COLORS[1], 
                EnemyBehavior.INTERCEPT
            ));
        }
        
        if (GAME_CONSTANTS.ENEMY_COUNT >= 3) {
            // Pink ghost - patrols corners
            enemies.push(this.createEnemy(
                GAME_CONSTANTS.ENEMY_COLORS[2], 
                EnemyBehavior.PATROL
            ));
        }
        
        if (GAME_CONSTANTS.ENEMY_COUNT >= 4) {
            // Orange ghost - moves somewhat randomly
            enemies.push(this.createEnemy(
                GAME_CONSTANTS.ENEMY_COLORS[3], 
                EnemyBehavior.RANDOM
            ));
        }
        
        // Add any additional enemies with random behaviors
        for (let i = 4; i < GAME_CONSTANTS.ENEMY_COUNT; i++) {
            const color = GAME_CONSTANTS.ENEMY_COLORS[i % GAME_CONSTANTS.ENEMY_COLORS.length];
            const randomBehavior = Math.floor(Math.random() * 4);
            enemies.push(this.createEnemy(
                color, 
                randomBehavior as EnemyBehavior
            ));
        }
        
        return enemies;
    }
    
    /**
     * Creates a single enemy
     * @param color - Enemy color
     * @param behavior - Enemy behavior
     * @returns New enemy instance
     */
    public createEnemy(color: string, behavior: EnemyBehavior): Enemy {
        const enemy = new Enemy(this.maze, color, behavior);
        const spawnPosition = this.findSpawnPosition();
        
        if (spawnPosition) {
            enemy.setPosition(
                spawnPosition.x * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2,
                spawnPosition.y * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2
            );
        }
        
        return enemy;
    }
    
    /**
     * Finds a valid spawn position for an enemy
     * @returns Valid grid position, or null if none found
     */
    private findSpawnPosition(): GridPosition | null {
        const validPositions: GridPosition[] = [];
        
        for (let y = 1; y < GAME_CONSTANTS.GRID_ROWS - 1; y++) {
            for (let x = 1; x < GAME_CONSTANTS.GRID_COLS - 1; x++) {
                const cellType = this.maze.getCellTypeAt(x, y);
                // Make sure enemies don't spawn on walls
                if (cellType !== null && cellType !== 'wall') {
                    validPositions.push({ x, y });
                }
            }
        }
        
        if (validPositions.length === 0) {
            return null;
        }
        
        // Try to find positions far from center
        const centerX = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        const centerY = Math.floor(GAME_CONSTANTS.GRID_ROWS / 2);
        const minDistance = GAME_CONSTANTS.ENEMY_SPAWN_MIN_DISTANCE;
        
        const distantPositions = validPositions.filter(pos => {
            const distX = Math.abs(pos.x - centerX);
            const distY = Math.abs(pos.y - centerY);
            return Math.sqrt(distX * distX + distY * distY) >= minDistance;
        });
        
        // Use distant position if available, otherwise use any valid position
        const positionPool = distantPositions.length > 0 ? distantPositions : validPositions;
        
        // Return a random position from the pool
        return positionPool[Math.floor(Math.random() * positionPool.length)];
    }
}
