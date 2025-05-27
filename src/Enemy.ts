import { GAME_CONSTANTS } from './constants';
import { Direction } from './Player';
import { MazeInterface, Position, GridPosition, EnemyAI, EnemyBehavior, Positionable, Renderable, Updateable } from './types';
import { EnemyAIFactory } from './EnemyAI';
import { EnemyRendererService } from './EnemyRenderer';
import { PathfindingService } from './PathfindingService';

/**
 * Represents an enemy that hunts the player
 */
export class Enemy implements Positionable, Renderable, Updateable {
    private x: number = 0;
    private y: number = 0;
    private targetX: number = 0;
    private targetY: number = 0;
    private direction: Direction = Direction.NONE;
    private speed: number = GAME_CONSTANTS.ENEMY_SPEED;
    private maze: MazeInterface;
    private ai: EnemyAI;
    private renderer: EnemyRendererService;
    private pathfinding: PathfindingService;
    private lastPathfindingTime: number = 0;
    private path: GridPosition[] = [];
    
    /**
     * Creates a new enemy
     * @param maze - The maze instance
     * @param color - Enemy color
     * @param behavior - Enemy behavior type
     */
    constructor(maze: MazeInterface, color: string, behavior: EnemyBehavior) {
        this.maze = maze;
        this.pathfinding = new PathfindingService(maze);
        this.ai = EnemyAIFactory.createAI(behavior, maze);
        this.renderer = new EnemyRendererService(color);
    }
    
    /**
     * Sets the position of the enemy
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Gets the current position of the enemy
     * @returns Object containing x and y coordinates
     */
    public getPosition(): Position {
        return { x: this.x, y: this.y };
    }
    
    /**
     * Updates the enemy's position and behavior
     * @param deltaTime - Time elapsed since last update in ms
     * @param playerPosition - Current position of the player
     */
    public update(deltaTime: number, playerPosition?: Position): void {
        if (!playerPosition) {
            return;
        }
        
        // Update target position based on AI
        const target = this.ai.calculateTargetPosition(
            { x: this.x, y: this.y },
            playerPosition
        );
        
        this.targetX = target.x;
        this.targetY = target.y;
        
        // Recalculate path periodically
        this.lastPathfindingTime += deltaTime;
        if (this.lastPathfindingTime >= GAME_CONSTANTS.ENEMY_PATH_RECALC_INTERVAL) {
            this.calculatePath();
            this.lastPathfindingTime = 0;
        }
        
        // Move along the calculated path
        this.moveAlongPath();
    }
    
    /**
     * Calculates a path to the target
     */
    private calculatePath(): void {
        // Convert current position to grid coordinates
        const startPos = this.pathfinding.pixelToGrid(this.x, this.y);
        const targetPos = this.pathfinding.pixelToGrid(this.targetX, this.targetY);
        
        // Use AI to calculate path
        this.path = this.ai.calculatePath(startPos, targetPos);
    }
    
    /**
     * Moves the enemy along the calculated path
     */
    private moveAlongPath(): void {
        if (this.path.length === 0) {
            return;
        }
        
        // Get the next position in the path
        const nextPos = this.path[0];
        const nextX = nextPos.x * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
        const nextY = nextPos.y * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
        
        // Calculate direction to move
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        
        // Determine direction
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
        } else {
            this.direction = dy > 0 ? Direction.DOWN : Direction.UP;
        }
        
        // Move towards the next position
        switch (this.direction) {
            case Direction.RIGHT:
                this.x += this.speed;
                break;
            case Direction.LEFT:
                this.x -= this.speed;
                break;
            case Direction.UP:
                this.y -= this.speed;
                break;
            case Direction.DOWN:
                this.y += this.speed;
                break;
        }
        
        // Check if we've reached the next position
        const tolerance = this.speed + GAME_CONSTANTS.COLLISION_TOLERANCE;
        if (Math.abs(this.x - nextX) < tolerance && Math.abs(this.y - nextY) < tolerance) {
            this.path.shift(); // Remove the position we've reached
        }
    }
    
    /**
     * Draws the enemy on the canvas
     * @param ctx - Canvas rendering context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        this.renderer.render(ctx, { x: this.x, y: this.y }, this.direction);
    }
    
    /**
     * Resets the enemy to its initial state
     */
    public reset(): void {
        this.path = [];
        this.lastPathfindingTime = 0;
        this.direction = Direction.NONE;
    }
}
