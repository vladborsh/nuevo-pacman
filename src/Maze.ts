import { GAME_CONSTANTS } from './constants';
import { MazeInterface } from './types';
import { AmbientShine } from './AmbientShine';

/**
 * Defines the different types of cells in the maze
 */
export enum CellType {
    WALL = 'wall',
    PATH = 'path',
    PELLET = 'pellet',
    POWER_PELLET = 'power-pellet',
    GHOST_HOUSE = 'ghost-house'
}

/**
 * Represents a cell position in the maze grid
 */
interface Cell {
    x: number;
    y: number;
}

/**
 * Represents a direction to move in the maze
 */
interface Direction {
    dx: number;
    dy: number;
}

/**
 * Represents the game maze, handling generation, rendering, and collision
 */
export class Maze implements MazeInterface {
    private grid: CellType[][];
    private readonly directions: Direction[] = [
        { dx: -2, dy: 0 },  // left
        { dx: 2, dy: 0 },   // right
        { dx: 0, dy: -2 },  // up
        { dx: 0, dy: 2 }    // down
    ];
    private pelletsCount = 0;
    private powerPelletShine: AmbientShine;

    constructor() {
        this.grid = this.generateMaze();
        this.countPellets();
        this.powerPelletShine = new AmbientShine(
            GAME_CONSTANTS.SHINE.PERIOD,
            GAME_CONSTANTS.SHINE.MIN_BRIGHTNESS,
            GAME_CONSTANTS.SHINE.MAX_BRIGHTNESS
        );
    }

    /**
     * Counts the total number of pellets in the maze
     */
    private countPellets(): void {
        this.pelletsCount = 0;
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
                if (this.grid[row][col] === CellType.PELLET || 
                    this.grid[row][col] === CellType.POWER_PELLET) {
                    this.pelletsCount++;
                }
            }
        }
    }

    /**
     * Returns the current pellet count
     */
    public getPelletsCount(): number {
        return this.pelletsCount;
    }

    /**
     * Generates the complete maze
     */
    private generateMaze(): CellType[][] {
        // Initialize grid with walls
        const grid: CellType[][] = Array(GAME_CONSTANTS.GRID_ROWS)
            .fill(null)
            .map(() => Array(GAME_CONSTANTS.GRID_COLS).fill(CellType.WALL));

        // Generate maze for the left half only
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        this.recursiveBacktracking(grid, midPoint);
        
        // Mirror the left half to create symmetrical design
        this.applySymmetry(grid);
        
        // Add ghost house
        this.addGhostHouse(grid);
        
        // Add additional paths to make the maze more playable
        this.addExtraPaths(grid);
        
        // Place pellets on paths
        this.placePellets(grid);

        return grid;
    }

    /**
     * Generates the maze using recursive backtracking algorithm
     */
    private recursiveBacktracking(grid: CellType[][], midPoint: number): void {
        const stack: Cell[] = [];
        const start: Cell = { x: 1, y: 1 };
        
        grid[start.y][start.x] = CellType.PATH;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current, grid, midPoint);

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Carve path
                grid[next.y][next.x] = CellType.PATH;
                grid[current.y + Math.floor((next.y - current.y) / 2)]
                     [current.x + Math.floor((next.x - current.x) / 2)] = CellType.PATH;
                
                stack.push(next);
            } else {
                stack.pop();
            }
        }
    }

    /**
     * Gets unvisited neighboring cells in the maze generation process
     */
    private getUnvisitedNeighbors(cell: Cell, grid: CellType[][], midPoint: number): Cell[] {
        const neighbors: Cell[] = [];

        for (const dir of this.directions) {
            const nx = cell.x + dir.dx;
            const ny = cell.y + dir.dy;

            if (this.isValidCell(nx, ny, midPoint) && grid[ny][nx] === CellType.WALL) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    /**
     * Checks if a cell is valid for maze generation
     */
    private isValidCell(x: number, y: number, midPoint: number): boolean {
        return x > 0 && x < midPoint && y > 0 && y < GAME_CONSTANTS.GRID_ROWS - 1;
    }

    /**
     * Adds extra paths to make the maze more playable
     */
    private addExtraPaths(grid: CellType[][]): void {
        // Add some random connections to make the maze more playable
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        
        for (let y = 2; y < GAME_CONSTANTS.GRID_ROWS - 2; y += 2) {
            for (let x = 2; x < midPoint - 1; x += 2) {
                if (Math.random() < 0.3) { // 30% chance to add an extra path
                    if (grid[y][x] === CellType.WALL) {
                        const validPath = (
                            grid[y-1][x] === CellType.PATH && grid[y+1][x] === CellType.PATH) ||
                            (grid[y][x-1] === CellType.PATH && grid[y][x+1] === CellType.PATH
                        );
                        if (validPath) {
                            grid[y][x] = CellType.PATH;
                        }
                    }
                }
            }
        }

        // Ensure there are escape routes from corners
        this.addEscapeRoutes(grid);
    }

    /**
     * Adds escape routes from corners
     */
    private addEscapeRoutes(grid: CellType[][]): void {
        grid[1][1] = CellType.PATH;
        grid[1][2] = CellType.PATH;
        grid[2][1] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 2][1] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 2][2] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 3][1] = CellType.PATH;
    }

    /**
     * Mirrors the left half of the maze to create symmetry
     */
    private applySymmetry(grid: CellType[][]): void {
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < midPoint; col++) {
                grid[row][GAME_CONSTANTS.GRID_COLS - 1 - col] = grid[row][col];
            }
        }
    }

    /**
     * Adds the ghost house to the center of the maze
     */
    private addGhostHouse(grid: CellType[][]): void {
        const centerY = Math.floor(GAME_CONSTANTS.GRID_ROWS / 2);
        const centerX = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        
        // Create ghost house walls
        for (let row = centerY - 1; row <= centerY + 1; row++) {
            for (let col = centerX - 2; col <= centerX + 2; col++) {
                grid[row][col] = CellType.GHOST_HOUSE;
            }
        }
    }

    /**
     * Places pellets on maze paths
     */
    private placePellets(grid: CellType[][]): void {
        for (let row = 1; row < GAME_CONSTANTS.GRID_ROWS - 1; row++) {
            for (let col = 1; col < GAME_CONSTANTS.GRID_COLS - 1; col++) {
                if (grid[row][col] === CellType.PATH) {
                    // Place power pellets in corners
                    if (this.isPowerPelletLocation(row, col)) {
                        grid[row][col] = CellType.POWER_PELLET;
                    } else {
                        grid[row][col] = CellType.PELLET;
                    }
                }
            }
        }
    }

    /**
     * Determines if a location should have a power pellet
     */
    private isPowerPelletLocation(row: number, col: number): boolean {
        return (row === 3 && (col === 1 || col === GAME_CONSTANTS.GRID_COLS - 2)) ||
               (row === GAME_CONSTANTS.GRID_ROWS - 4 && 
                (col === 1 || col === GAME_CONSTANTS.GRID_COLS - 2));
    }

    /**
     * Draws the maze on the canvas
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
                const x = col * GAME_CONSTANTS.CELL_SIZE;
                const y = row * GAME_CONSTANTS.CELL_SIZE;

                switch (this.grid[row][col]) {
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

    /**
     * Converts from pixel coordinates to grid coordinates
     */
    private pixelToGrid(x: number, y: number): { gridX: number, gridY: number } {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        return { gridX, gridY };
    }

    /**
     * Checks if a pixel position is within the grid bounds
     */
    private isInBounds(gridX: number, gridY: number): boolean {
        return gridX >= 0 && gridX < GAME_CONSTANTS.GRID_COLS &&
               gridY >= 0 && gridY < GAME_CONSTANTS.GRID_ROWS;
    }

    /**
     * Checks if a pixel position is a wall
     */
    public isWall(x: number, y: number): boolean {
        const { gridX, gridY } = this.pixelToGrid(x, y);
        
        if (!this.isInBounds(gridX, gridY)) {
            return true;
        }
        
        return this.grid[gridY][gridX] === CellType.WALL;
    }

    /**
     * Gets the type of pellet at a pixel position, if any
     */
    public getPelletAt(x: number, y: number): CellType | null {
        const { gridX, gridY } = this.pixelToGrid(x, y);
        
        if (!this.isInBounds(gridX, gridY)) {
            return null;
        }
        
        const cell = this.grid[gridY][gridX];
        return (cell === CellType.PELLET || cell === CellType.POWER_PELLET) ? cell : null;
    }

    /**
     * Removes a pellet from the maze at a pixel position
     */
    public removePellet(x: number, y: number): boolean {
        const { gridX, gridY } = this.pixelToGrid(x, y);
        
        if (!this.isInBounds(gridX, gridY)) {
            return false;
        }
        
        if (this.grid[gridY][gridX] === CellType.PELLET ||
            this.grid[gridY][gridX] === CellType.POWER_PELLET) {
            this.grid[gridY][gridX] = CellType.PATH;
            this.pelletsCount--;
            return true;
        }
        
        return false;
    }

    /**
     * Gets the cell type at a specific grid position
     * @param gridX - The grid x-coordinate
     * @param gridY - The grid y-coordinate
     * @returns The cell type at the specified position or null if out of bounds
     */
    public getCellTypeAt(gridX: number, gridY: number): CellType | null {
        if (!this.isInBounds(gridX, gridY)) {
            return null;
        }
        
        return this.grid[gridY][gridX];
    }
}
