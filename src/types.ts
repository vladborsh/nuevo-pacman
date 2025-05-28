import { CellType } from './Maze';

/**
 * Direction enum for movement in the game
 */
export enum Direction {
    RIGHT = 0,
    DOWN = 90,
    LEFT = 180,
    UP = 270,
    NONE = -1
}

/**
 * Represents a 2D position in the game world
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Represents a position on the grid
 */
export interface GridPosition {
    x: number;
    y: number;
}

/**
 * Interface for entities that can be positioned in the game world
 */
export interface Positionable {
    getPosition(): Position;
}

/**
 * Interface for entities that can be rendered
 */
export interface Renderable {
    draw(ctx: CanvasRenderingContext2D): void;
}

/**
 * Interface for entities that can be updated
 */
export interface Updateable {
    update(deltaTime: number): void;
}

/**
 * Interface for enemy AI behavior
 */
export interface EnemyAI {
    calculateTargetPosition(currentPos: Position, playerPos: Position): Position;
    calculatePath(start: GridPosition, target: GridPosition): GridPosition[];
}

/**
 * Interface for an enemy renderer
 */
export interface EnemyRenderer {
    render(ctx: CanvasRenderingContext2D, position: Position, direction: Direction): void;
}

/**
 * Enemy behavior types
 */
export enum EnemyBehavior {
    DIRECT,    // Chases the player directly (red ghost behavior)
    INTERCEPT, // Tries to intercept the player (pink ghost behavior)
    PATROL,    // Patrols between corners (blue ghost behavior)
    RANDOM     // Moves semi-randomly (orange ghost behavior)
}

/**
 * Enemy creation parameters
 */
export interface EnemyParams {
    maze: MazeInterface;
    color: string;
    behavior: EnemyBehavior;
}

/**
 * Interface for maze functionalities needed by other components
 */
export interface MazeInterface {
    isWall(x: number, y: number): boolean;
    getCellTypeAt(gridX: number, gridY: number): CellType | null;
    getPelletAt(x: number, y: number): CellType | null;
    removePellet(x: number, y: number): boolean;
}

/**
 * Interface for a path node used in pathfinding
 */
export interface PathNode {
    position: GridPosition;
    g: number; // Cost from start to current node
    h: number; // Heuristic (estimated cost from current node to goal)
    f: number; // Total cost (g + h)
    parent?: PathNode; // Reference to parent node
}

/**
 * Type for CSS color strings
 */
export type CSSColor = string;
