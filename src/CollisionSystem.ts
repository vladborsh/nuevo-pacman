import { Collider, CircleCollider } from './Collider';
import { MazeInterface, Position, Direction } from './types';
import { GAME_CONSTANTS } from './constants';

/**
 * Manages collision detection between game objects
 */
export class CollisionSystem {
    private maze: MazeInterface;
    
    constructor(maze: MazeInterface) {
        this.maze = maze;
    }
    
    /**
     * Checks if two colliders are intersecting
     * @param colliderA - First collider
     * @param colliderB - Second collider
     * @returns True if colliders are intersecting
     */
    public checkCollision(colliderA: Collider, colliderB: Collider): boolean {
        return colliderA.intersects(colliderB);
    }
    
    /**
     * Checks if a collider intersects with any walls in the maze
     * @param collider - The collider to check
     * @returns True if collider intersects with a wall
     */
    public checkWallCollision(collider: Collider): boolean {
        // For now, use a simple point check at the position of the collider
        const pos = collider.getPosition();
        return this.maze.isWall(pos.x, pos.y);
    }
    
    /**
     * Determines if a move in a specific direction is valid (does not collide with walls)
     * @param collider - The collider to check
     * @param direction - Direction to check for movement
     * @param speed - Movement speed
     * @returns True if the move is valid
     */
    public canMove(collider: Collider, direction: Direction, speed: number): boolean {
        const currentPos = collider.getPosition();
        let testX = currentPos.x;
        let testY = currentPos.y;
        
        // Get collider radius for circular colliders or use a default value
        const collisionOffset = GAME_CONSTANTS.COLLISION_TOLERANCE;
        let checkDistance: number = collisionOffset;
        
        if (collider instanceof CircleCollider) {
            checkDistance = (collider as CircleCollider).getRadius();
        }

        // Calculate the position to check based on direction
        switch (direction) {
            case Direction.RIGHT:
                testX += checkDistance;
                break;
            case Direction.LEFT:
                testX -= checkDistance;
                break;
            case Direction.UP:
                testY -= checkDistance;
                break;
            case Direction.DOWN:
                testY += checkDistance;
                break;
            case Direction.NONE:
                return true; // Not moving
        }

        return !this.maze.isWall(testX, testY);
    }
    
    /**
     * Checks collision between a moving collider and walls,
     * returning the adjusted position if a collision occurs
     * @param collider - The collider to move
     * @param direction - Movement direction
     * @param speed - Movement speed
     * @param deltaTime - Time elapsed since last update
     * @returns The adjusted position after collision resolution
     */
    public moveWithCollision(
        collider: Collider, 
        direction: Direction, 
        speed: number, 
        deltaTime: number
    ): Position {
        const currentPos = collider.getPosition();
        let newX = currentPos.x;
        let newY = currentPos.y;
        
        // Calculate intended new position
        switch (direction) {
            case Direction.RIGHT:
                newX += speed * (deltaTime / 16);
                break;
            case Direction.LEFT:
                newX -= speed * (deltaTime / 16);
                break;
            case Direction.UP:
                newY -= speed * (deltaTime / 16);
                break;
            case Direction.DOWN:
                newY += speed * (deltaTime / 16);
                break;
            case Direction.NONE:
                return currentPos; // Not moving
        }
        
        // Get collider radius for circular colliders
        let checkDistance:number = GAME_CONSTANTS.COLLISION_TOLERANCE;
        if (collider instanceof CircleCollider) {
            checkDistance = (collider as CircleCollider).getRadius();
        }
        
        // Check if the new position would cause a wall collision
        let collision = false;
        
        // Check horizontal collision
        if (direction === Direction.RIGHT || direction === Direction.LEFT) {
            const testX = direction === Direction.RIGHT ? newX + checkDistance : newX - checkDistance;
            if (this.maze.isWall(testX, newY)) {
                collision = true;
                // Instead of snapping to grid, just don't allow movement in this direction
                return currentPos; // Return original position without movement
            }
        }
        
        // Check vertical collision
        if (direction === Direction.UP || direction === Direction.DOWN) {
            const testY = direction === Direction.DOWN ? newY + checkDistance : newY - checkDistance;
            if (this.maze.isWall(newX, testY)) {
                collision = true;
                // Instead of snapping to grid, just don't allow movement in this direction
                return currentPos; // Return original position without movement
            }
        }
        
        return { x: newX, y: newY };
    }
    
    /**
     * Calculates the distance between two positions
     * @param pos1 - First position
     * @param pos2 - Second position
     * @returns Distance between positions
     */
    public calculateDistance(pos1: Position, pos2: Position): number {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2)
        );
    }
}
