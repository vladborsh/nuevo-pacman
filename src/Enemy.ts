import { GAME_CONSTANTS } from './constants';
import { Direction } from './Player';
import { Game } from './Game';
import { MazeInterface, Position, GridPosition, EnemyAI, EnemyBehavior, Positionable, Renderable, Updateable } from './types';
import { EnemyAIFactory } from './EnemyAI';
import { EnemyRendererService } from './EnemyRenderer';
import { PathfindingService } from './PathfindingService';
import { CircleCollider } from './Collider';
import { CollisionSystem } from './CollisionSystem';

/**
 * Represents an enemy that hunts the player
 */
export class Enemy implements Positionable, Renderable, Updateable {
    private x: number = 0;
    private y: number = 0;
    private targetX: number = 0;
    private targetY: number = 0;
    private direction: Direction = Direction.NONE;
    private speed: number = GAME_CONSTANTS.ENEMY.SPEED;
    private maze: MazeInterface;
    private ai: EnemyAI;
    private renderer: EnemyRendererService;
    private pathfinding: PathfindingService;
    private lastPathfindingTime: number = 0;
    private path: GridPosition[] = [];
    private distanceToPlayer: number = Infinity;
    private collider: CircleCollider;
    private collisionSystem: CollisionSystem;
    
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
        this.collisionSystem = new CollisionSystem(maze);
        
        // Initialize collider with a dummy position (will be updated later)
        this.collider = new CircleCollider(
            { x: 0, y: 0 },
            GAME_CONSTANTS.ENEMY.SIZE / 2
        );
    }
    
    /**
     * Sets the position of the enemy
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        
        // Update collider position
        this.collider.updatePosition({ x, y });
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

        // Calculate distance to player
        this.distanceToPlayer = Math.sqrt(
            Math.pow(this.x - playerPosition.x, 2) + 
            Math.pow(this.y - playerPosition.y, 2)
        );
        
        // Recalculate path periodically
        this.lastPathfindingTime += deltaTime;
        if (this.lastPathfindingTime >= GAME_CONSTANTS.ENEMY.PATH_RECALC_INTERVAL) {
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
        
        // Move towards the next position using collision system
        if (this.collisionSystem.canMove(this.collider, this.direction, this.speed)) {
            // Use collision system to get new position
            const newPosition = this.collisionSystem.moveWithCollision(
                this.collider,
                this.direction,
                this.speed,
                16 // Using a fixed deltaTime for simplicity
            );
            
            // Update enemy position
            this.x = newPosition.x;
            this.y = newPosition.y;
            
            // Update collider position
            this.collider.updatePosition({ x: this.x, y: this.y });

            // Create trail particles
            const particleSystem = Game.getInstance().getParticleSystem();
            if (particleSystem) {
                particleSystem.createEnemyTrail(
                    { x: this.x, y: this.y },
                    this.renderer.getColor()
                );
            }
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
     * @param debugMode - Whether to display collision boundaries
     */
    public draw(ctx: CanvasRenderingContext2D, debugMode: boolean = false): void {
        this.renderer.render(
            ctx, 
            { x: this.x, y: this.y }, 
            this.direction,
            this.distanceToPlayer
        );
        
        // Draw collider when in debug mode
        if (debugMode) {
            this.collider.drawDebug(ctx, 'rgba(255, 0, 0, 0.3)');
        }
    }
    
    /**
     * Resets the enemy to its initial state
     */
    public reset(): void {
        this.path = [];
        this.lastPathfindingTime = 0;
        this.direction = Direction.NONE;
        this.distanceToPlayer = Infinity;
        
        // Make sure collider position is updated when the enemy is reset
        // The actual position will be set by EnemyFactory after reset is called
        this.collider.updatePosition({ x: this.x, y: this.y });
    }
    
    /**
     * Gets the collider for this enemy
     * @returns The enemy's collider
     */
    public getCollider(): CircleCollider {
        return this.collider;
    }
}
