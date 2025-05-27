import { GAME_CONSTANTS } from './constants';
import { Position, GridPosition, EnemyAI, EnemyBehavior } from './types';
import { PathfindingService } from './PathfindingService';
import { MazeInterface } from './types';

/**
 * Factory to create AI strategies based on enemy behavior type
 */
export class EnemyAIFactory {
    /**
     * Creates an enemy AI strategy based on the behavior type
     */
    public static createAI(behavior: EnemyBehavior, maze: MazeInterface): EnemyAI {
        const pathfinding = new PathfindingService(maze);
        
        switch (behavior) {
            case EnemyBehavior.DIRECT:
                return new DirectChaserAI(pathfinding);
            case EnemyBehavior.INTERCEPT:
                return new InterceptorAI(pathfinding);
            case EnemyBehavior.PATROL:
                return new PatrolAI(pathfinding);
            case EnemyBehavior.RANDOM:
                return new RandomMovementAI(pathfinding);
            default:
                return new DirectChaserAI(pathfinding);
        }
    }
}

/**
 * Base class for AI strategies
 */
abstract class BaseEnemyAI implements EnemyAI {
    protected pathfinding: PathfindingService;
    
    constructor(pathfinding: PathfindingService) {
        this.pathfinding = pathfinding;
    }
    
    /**
     * Calculates the target position for the enemy to move toward
     * @param currentPos - Current position of the enemy
     * @param playerPos - Current position of the player
     */
    abstract calculateTargetPosition(currentPos: Position, playerPos: Position): Position;
    
    /**
     * Calculates path to the target
     * @param start - Starting grid position
     * @param target - Target grid position
     * @returns Array of grid positions representing the path
     */
    public calculatePath(start: GridPosition, target: GridPosition): GridPosition[] {
        return this.pathfinding.findPath(start, target);
    }
    
    /**
     * Ensures the position is within the game grid
     */
    protected boundPosition(x: number, y: number): Position {
        const boundedX = Math.max(0, Math.min(GAME_CONSTANTS.CANVAS_WIDTH, x));
        const boundedY = Math.max(0, Math.min(GAME_CONSTANTS.CANVAS_HEIGHT, y));
        return { x: boundedX, y: boundedY };
    }
}

/**
 * AI that directly chases the player
 */
class DirectChaserAI extends BaseEnemyAI {
    calculateTargetPosition(currentPos: Position, playerPos: Position): Position {
        // Simply return the player's position
        return { ...playerPos };
    }
}

/**
 * AI that tries to intercept the player by predicting movement
 */
class InterceptorAI extends BaseEnemyAI {
    calculateTargetPosition(currentPos: Position, playerPos: Position): Position {
        // Tries to predict where the player is going
        // For simplicity, just aim ahead of the player in a sinusoidal pattern
        const lookAheadDistance = 4 * GAME_CONSTANTS.CELL_SIZE;
        const time = Date.now() / 1000; // Use time for varied movement
        
        const offsetX = lookAheadDistance * Math.cos(time);
        const offsetY = lookAheadDistance * Math.sin(time);
        
        return this.boundPosition(
            playerPos.x + offsetX,
            playerPos.y + offsetY
        );
    }
}

/**
 * AI that patrols between predefined corners
 */
class PatrolAI extends BaseEnemyAI {
    private currentCorner: number = 0;
    private readonly patrolPoints: GridPosition[] = [
        { x: 1, y: 1 },
        { x: GAME_CONSTANTS.GRID_COLS - 2, y: 1 },
        { x: GAME_CONSTANTS.GRID_COLS - 2, y: GAME_CONSTANTS.GRID_ROWS - 2 },
        { x: 1, y: GAME_CONSTANTS.GRID_ROWS - 2 }
    ];
    
    calculateTargetPosition(currentPos: Position, playerPos: Position): Position {
        const currentPatrolPoint = this.patrolPoints[this.currentCorner];
        const targetPixels = this.pathfinding.gridToPixel(currentPatrolPoint.x, currentPatrolPoint.y);
        
        // If we're close to the current patrol point, move to next one
        const distanceToPoint = Math.sqrt(
            Math.pow(currentPos.x - targetPixels.x, 2) + 
            Math.pow(currentPos.y - targetPixels.y, 2)
        );
        
        if (distanceToPoint < GAME_CONSTANTS.CELL_SIZE) {
            this.currentCorner = (this.currentCorner + 1) % this.patrolPoints.length;
            const nextPoint = this.patrolPoints[this.currentCorner];
            const nextPixels = this.pathfinding.gridToPixel(nextPoint.x, nextPoint.y);
            return nextPixels;
        }
        
        return targetPixels;
    }
}

/**
 * AI that moves somewhat randomly but occasionally chases the player
 */
class RandomMovementAI extends BaseEnemyAI {
    private lastTargetChangeTime: number = 0;
    private targetPosition: Position = { x: 0, y: 0 };
    private readonly changeInterval: number = 2000; // Change direction every 2 seconds
    
    calculateTargetPosition(currentPos: Position, playerPos: Position): Position {
        const currentTime = Date.now();
        
        // Change target periodically or if no target is set
        if (currentTime - this.lastTargetChangeTime > this.changeInterval) {
            // 30% chance to chase player directly, otherwise pick random position
            if (Math.random() < 0.3) {
                this.targetPosition = { ...playerPos };
            } else {
                // Choose a random valid position in the grid
                const randomGridX = Math.floor(Math.random() * GAME_CONSTANTS.GRID_COLS);
                const randomGridY = Math.floor(Math.random() * GAME_CONSTANTS.GRID_ROWS);
                this.targetPosition = this.pathfinding.gridToPixel(randomGridX, randomGridY);
            }
            
            this.lastTargetChangeTime = currentTime;
        }
        
        return this.targetPosition;
    }
}
