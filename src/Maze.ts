import { GAME_CONSTANTS } from './constants';
import { MazeInterface } from './types';

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
 * Represents the game maze, handling generation and state management
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
    private collectedPowerPellets: { x: number; y: number; timer: number }[] = [];
    private readonly POWER_PELLET_RESTORE_TIME = GAME_CONSTANTS.POWER_PELLET_RESTORE_TIME;

    constructor() {
        this.grid = this.generateMaze();
        this.countPellets();
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
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        
        // First pass: Break walls in long corridors
        for (let y = 2; y < GAME_CONSTANTS.GRID_ROWS - 2; y++) {
            for (let x = 2; x < midPoint - 1; x++) {
                // Check for horizontal corridors
                if (this.isLongCorridor(grid, x, y, true)) {
                    // Break the wall in the middle of the corridor
                    const wallX = x + 4;
                    if (Math.random() < 0.7) { // 70% chance to break the wall
                        if (grid[y-1][wallX] === CellType.WALL && grid[y+1][wallX] === CellType.WALL) {
                            if (grid[y][wallX] === CellType.WALL) {
                                grid[y][wallX] = CellType.PATH;
                            }
                        }
                    }
                }
                
                // Check for vertical corridors
                if (this.isLongCorridor(grid, x, y, false)) {
                    // Break the wall in the middle of the corridor
                    const wallY = y + 4;
                    if (Math.random() < 0.7) { // 70% chance to break the wall
                        if (grid[wallY][x-1] === CellType.WALL && grid[wallY][x+1] === CellType.WALL) {
                            if (grid[wallY][x] === CellType.WALL) {
                                grid[wallY][x] = CellType.PATH;
                            }
                        }
                    }
                }
            }
        }

        // Second pass: Add extra connections
        for (let y = 2; y < GAME_CONSTANTS.GRID_ROWS - 2; y += 2) {
            for (let x = 2; x < midPoint - 1; x += 2) {
                if (Math.random() < 0.3) { // 30% chance to add an extra path
                    if (grid[y][x] === CellType.WALL) {
                        const validPath = (
                            (grid[y-1][x] === CellType.PATH && grid[y+1][x] === CellType.PATH) ||
                            (grid[y][x-1] === CellType.PATH && grid[y][x+1] === CellType.PATH)
                        );
                        if (validPath) {
                            grid[y][x] = CellType.PATH;
                        }
                    }
                }
            }
        }

        // Ensure there are escape routes from corners and dead ends
        this.addEscapeRoutes(grid);

        // Third pass: Break remaining dead ends
        this.breakDeadEnds(grid, midPoint);
    }

    /**
     * Adds escape routes from corners and ensures no areas are completely blocked
     */
    private addEscapeRoutes(grid: CellType[][]): void {
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);

        // Add escape routes from corners
        // Top-left corner
        if (grid[1][1] === CellType.WALL) {
            grid[1][1] = CellType.PATH;
            grid[1][2] = CellType.PATH;
            grid[2][1] = CellType.PATH;
        }

        // Bottom-left corner
        if (grid[GAME_CONSTANTS.GRID_ROWS - 2][1] === CellType.WALL) {
            grid[GAME_CONSTANTS.GRID_ROWS - 2][1] = CellType.PATH;
            grid[GAME_CONSTANTS.GRID_ROWS - 2][2] = CellType.PATH;
            grid[GAME_CONSTANTS.GRID_ROWS - 3][1] = CellType.PATH;
        }

        // Ensure side passages near corners have escape routes
        for (let y = 3; y < GAME_CONSTANTS.GRID_ROWS - 3; y++) {
            // Check left side
            if (grid[y][1] === CellType.PATH && 
                grid[y-1][1] === CellType.WALL && 
                grid[y+1][1] === CellType.WALL) {
                // Create at least one escape route
                if (grid[y][2] === CellType.WALL) {
                    grid[y][2] = CellType.PATH;
                }
            }
        }

        // Mirror the escape routes to the right side
        for (let y = 1; y < GAME_CONSTANTS.GRID_ROWS - 1; y++) {
            grid[y][GAME_CONSTANTS.GRID_COLS - 2] = grid[y][1];
            grid[y][GAME_CONSTANTS.GRID_COLS - 3] = grid[y][2];
        }
    }

    /**
     * Checks if there's a long corridor (more than 5 cells) at the given position
     */
    private isLongCorridor(grid: CellType[][], x: number, y: number, horizontal: boolean): boolean {
        const minCorridorLength = 8; // Consider corridors longer than 8 cells

        if (horizontal) {
            // Check if we have enough space to check for a corridor
            if (x + minCorridorLength >= GAME_CONSTANTS.GRID_COLS) return false;

            // Check if we have a path here
            if (grid[y][x] !== CellType.PATH) return false;

            // Count consecutive path cells
            let length = 0;
            for (let i = 0; i < minCorridorLength; i++) {
                if (grid[y][x + i] === CellType.PATH && 
                    grid[y-1][x + i] === CellType.WALL && 
                    grid[y+1][x + i] === CellType.WALL) {
                    length++;
                } else {
                    break;
                }
            }
            return length >= minCorridorLength;
        } else {
            // Vertical corridor check
            if (y + minCorridorLength >= GAME_CONSTANTS.GRID_ROWS) return false;
            if (grid[y][x] !== CellType.PATH) return false;

            let length = 0;
            for (let i = 0; i < minCorridorLength; i++) {
                if (grid[y + i][x] === CellType.PATH && 
                    grid[y + i][x-1] === CellType.WALL && 
                    grid[y + i][x+1] === CellType.WALL) {
                    length++;
                } else {
                    break;
                }
            }
            return length >= minCorridorLength;
        }
    }

    /**
     * Breaks any remaining dead ends to ensure there are always multiple escape routes
     */
    private breakDeadEnds(grid: CellType[][], midPoint: number): void {
        for (let y = 2; y < GAME_CONSTANTS.GRID_ROWS - 2; y++) {
            for (let x = 2; x < midPoint - 1; x++) {
                if (grid[y][x] === CellType.PATH) {
                    // Count adjacent walls
                    let wallCount = 0;
                    if (grid[y-1][x] === CellType.WALL) wallCount++;
                    if (grid[y+1][x] === CellType.WALL) wallCount++;
                    if (grid[y][x-1] === CellType.WALL) wallCount++;
                    if (grid[y][x+1] === CellType.WALL) wallCount++;

                    // If this is a dead end (3 walls)
                    if (wallCount === 3 && Math.random() < 0.8) { // 80% chance to break dead end
                        // Try to break a wall in a random direction
                        let attempts = 0;
                        while (attempts < 4) {
                            const dir = Math.floor(Math.random() * 4);
                            const [dx, dy] = [
                                [0, -1], // up
                                [1, 0],  // right
                                [0, 1],  // down
                                [-1, 0]  // left
                            ][dir];

                            const newX = x + dx;
                            const newY = y + dy;

                            // Ensure we don't break boundary walls
                            if (newX > 1 && newX < midPoint - 1 && 
                                newY > 1 && newY < GAME_CONSTANTS.GRID_ROWS - 2 &&
                                grid[newY][newX] === CellType.WALL) {
                                grid[newY][newX] = CellType.PATH;
                                break;
                            }
                            attempts++;
                        }
                    }
                }
            }
        }
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
     * Updates the maze state, restoring power pellets after a certain time
     */
    public update(deltaTime: number): void {
        // Restore power pellets over time
        for (const powerPellet of this.collectedPowerPellets) {
            powerPellet.timer += deltaTime;
        }

        // Check if we can restore any power pellets
        if (this.collectedPowerPellets.length > 0 && 
            this.collectedPowerPellets[0].timer >= this.POWER_PELLET_RESTORE_TIME) {
            this.restorePowerPellet(this.collectedPowerPellets[0]);
        }
    }

    /**
     * Updates power pellet restoration timers
     * @param deltaTime - The time elapsed since the last update in milliseconds
     */
    public updatePowerPellets(deltaTime: number): void {
        for (let i = this.collectedPowerPellets.length - 1; i >= 0; i--) {
            const pellet = this.collectedPowerPellets[i];
            pellet.timer -= deltaTime;
            
            if (pellet.timer <= 0) {
                // Restore the power pellet
                const { x, y } = pellet;
                const { gridX, gridY } = this.pixelToGrid(x, y);
                if (this.grid[gridY][gridX] === CellType.PATH) {
                    this.grid[gridY][gridX] = CellType.POWER_PELLET;
                    this.pelletsCount++;
                }
                // Remove from tracking array
                this.collectedPowerPellets.splice(i, 1);
            }
        }
    }

    /**
     * Restores a power pellet at the given position
     */
    private restorePowerPellet(powerPellet: { x: number; y: number; timer: number }): void {
        const { x, y } = powerPellet;
        this.grid[y][x] = CellType.POWER_PELLET;
        powerPellet.timer = 0;
    }

    /**
     * Collects a power pellet at the given position
     */
    public collectPowerPellet(x: number, y: number): boolean {
        const { gridX, gridY } = this.pixelToGrid(x, y);
        
        if (!this.isInBounds(gridX, gridY)) {
            return false;
        }
        
        if (this.grid[gridY][gridX] === CellType.POWER_PELLET) {
            this.grid[gridY][gridX] = CellType.PATH;
            this.pelletsCount++;
            
            // Add to collected power pellets with a timer
            this.collectedPowerPellets.push({ x: gridX, y: gridY, timer: 0 });
            return true;
        }
        
        return false;
    }

    /**
     * Removes a pellet from the maze at a pixel position
     */
    public removePellet(x: number, y: number): boolean {
        const { gridX, gridY } = this.pixelToGrid(x, y);
        
        if (!this.isInBounds(gridX, gridY)) {
            return false;
        }
        
        const cellType = this.grid[gridY][gridX];
        if (cellType === CellType.PELLET || cellType === CellType.POWER_PELLET) {
            // If it's a power pellet, track it for restoration
            if (cellType === CellType.POWER_PELLET) {
                this.collectedPowerPellets.push({
                    x,
                    y,
                    timer: this.POWER_PELLET_RESTORE_TIME
                });
            }
            
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

    /**
     * Converts from pixel coordinates to grid coordinates
     */
    private pixelToGrid(x: number, y: number): { gridX: number, gridY: number } {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        return { gridX, gridY };
    }
}
