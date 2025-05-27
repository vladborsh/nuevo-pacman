import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Position, Positionable, Renderable, Updateable } from './types';

export enum Direction {
    RIGHT = 0,
    DOWN = 90,
    LEFT = 180,
    UP = 270,
    NONE = -1
}

export class Player implements Positionable, Renderable, Updateable {
    private x: number;
    private y: number;
    private direction: Direction = Direction.NONE;
    private nextDirection: Direction = Direction.NONE;
    private speed: number = GAME_CONSTANTS.PLAYER_SPEED;
    private maze: Maze;

    constructor(maze: Maze) {
        this.maze = maze;
        // Start position will be set in reset()
        this.x = 0;
        this.y = 0;
        this.reset();
    }

    public reset(): void {
        // Find a valid starting position (not on a wall)
        for (let y = 1; y < GAME_CONSTANTS.GRID_ROWS - 1; y++) {
            for (let x = 1; x < GAME_CONSTANTS.GRID_COLS - 1; x++) {
                if (!this.maze.isWall(x * GAME_CONSTANTS.CELL_SIZE, y * GAME_CONSTANTS.CELL_SIZE)) {
                    this.x = x * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
                    this.y = y * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
                    return;
                }
            }
        }
    }

    public update(): void {
        // Try to turn if there's a queued direction
        if (this.nextDirection !== Direction.NONE) {
            if (this.canMove(this.nextDirection)) {
                this.direction = this.nextDirection;
                this.nextDirection = Direction.NONE;
            }
        }

        // Move in current direction if possible
        if (this.direction !== Direction.NONE && this.canMove(this.direction)) {
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
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        
        // Calculate mouth angle based on direction and animation
        const mouthAngle = Math.PI / 4; // 45 degrees
        
        // Draw Pac-Man
        ctx.arc(
            this.x,
            this.y,
            GAME_CONSTANTS.CELL_SIZE / 2 - 2, // Slightly smaller than cell
            (this.direction * Math.PI / 180) + mouthAngle,
            (this.direction * Math.PI / 180) + (2 * Math.PI - mouthAngle)
        );
        
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    public handleKeydown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowRight':
            case 'd':
                this.nextDirection = Direction.RIGHT;
                break;
            case 'ArrowLeft':
            case 'a':
                this.nextDirection = Direction.LEFT;
                break;
            case 'ArrowUp':
            case 'w':
                this.nextDirection = Direction.UP;
                break;
            case 'ArrowDown':
            case 's':
                this.nextDirection = Direction.DOWN;
                break;
        }
    }

    private canMove(direction: Direction): boolean {
        const offset = GAME_CONSTANTS.CELL_SIZE / 2 - 1;
        let testX = this.x;
        let testY = this.y;

        switch (direction) {
            case Direction.RIGHT:
                testX += offset;
                break;
            case Direction.LEFT:
                testX -= offset;
                break;
            case Direction.UP:
                testY -= offset;
                break;
            case Direction.DOWN:
                testY += offset;
                break;
        }

        return !this.maze.isWall(testX, testY);
    }

    public getPosition(): Position {
        return { x: this.x, y: this.y };
    }
}
