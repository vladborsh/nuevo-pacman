import { CellType } from './Maze';
import { GAME_CONSTANTS } from './constants';
import { MazeInterface } from './types';
import { AmbientShine } from './AmbientShine';

/**
 * Handles all rendering logic for the maze
 */
export class MazeRenderer {
    private powerPelletShine: AmbientShine;

    constructor() {
        this.powerPelletShine = new AmbientShine(
            GAME_CONSTANTS.SHINE.PERIOD,
            GAME_CONSTANTS.SHINE.MIN_BRIGHTNESS,
            GAME_CONSTANTS.SHINE.MAX_BRIGHTNESS
        );
    }

    /**
     * Draws the maze on the canvas
     */
    public draw(ctx: CanvasRenderingContext2D, maze: MazeInterface): void {
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
                const x = col * GAME_CONSTANTS.CELL_SIZE;
                const y = row * GAME_CONSTANTS.CELL_SIZE;
                const cellType = maze.getCellTypeAt(col, row);

                if (cellType === null) continue;

                switch (cellType) {
                    case CellType.WALL:
                        this.drawWall(ctx, x, y);
                        break;
                        
                    case CellType.PELLET:
                        this.drawPellet(ctx, x, y);
                        break;
                        
                    case CellType.POWER_PELLET:
                        this.drawPowerPellet(ctx, x, y);
                        break;
                }
            }
        }
    }

    /**
     * Draws a wall cell
     */
    private drawWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = GAME_CONSTANTS.WALL_COLOR;
        ctx.fillRect(x, y, GAME_CONSTANTS.CELL_SIZE, GAME_CONSTANTS.CELL_SIZE);
    }

    /**
     * Draws a regular pellet
     */
    private drawPellet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = GAME_CONSTANTS.PELLET_COLOR;
        const pelletOffset = (GAME_CONSTANTS.CELL_SIZE - GAME_CONSTANTS.PELLET_SIZE) / 2;
        ctx.fillRect(
            x + pelletOffset,
            y + pelletOffset,
            GAME_CONSTANTS.PELLET_SIZE,
            GAME_CONSTANTS.PELLET_SIZE
        );
    }

    /**
     * Draws a power pellet
     */
    private drawPowerPellet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = GAME_CONSTANTS.PELLET_COLOR;
        this.powerPelletShine.update();
        this.powerPelletShine.draw(
            ctx,
            {
                x: x + GAME_CONSTANTS.CELL_SIZE / 2,
                y: y + GAME_CONSTANTS.CELL_SIZE / 2
            },
            GAME_CONSTANTS.POWER_PELLET_SIZE
        );
    }
}
