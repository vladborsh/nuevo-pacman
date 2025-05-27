import { GAME_CONSTANTS } from './constants';

// Define cell types for better readability
enum CellType {
    WALL = 'wall',
    PATH = 'path',
    PELLET = 'pellet',
    POWER_PELLET = 'power-pellet',
    GHOST_HOUSE = 'ghost-house'
}

interface Cell {
    x: number;
    y: number;
}

export class Maze {
    private grid: CellType[][];

    constructor() {
        this.grid = this.generateMaze();
    }

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

    private getUnvisitedNeighbors(cell: Cell, grid: CellType[][], midPoint: number): Cell[] {
        const neighbors: Cell[] = [];
        const directions = [
            { dx: -2, dy: 0 },
            { dx: 2, dy: 0 },
            { dx: 0, dy: -2 },
            { dx: 0, dy: 2 }
        ];

        for (const dir of directions) {
            const nx = cell.x + dir.dx;
            const ny = cell.y + dir.dy;

            if (nx > 0 && nx < midPoint && ny > 0 && ny < GAME_CONSTANTS.GRID_ROWS - 1 
                && grid[ny][nx] === CellType.WALL) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

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
        grid[1][1] = CellType.PATH;
        grid[1][2] = CellType.PATH;
        grid[2][1] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 2][1] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 2][2] = CellType.PATH;
        grid[GAME_CONSTANTS.GRID_ROWS - 3][1] = CellType.PATH;
    }

    private applySymmetry(grid: CellType[][]): void {
        const midPoint = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < midPoint; col++) {
                grid[row][GAME_CONSTANTS.GRID_COLS - 1 - col] = grid[row][col];
            }
        }
    }

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

    private placePellets(grid: CellType[][]): void {
        for (let row = 1; row < GAME_CONSTANTS.GRID_ROWS - 1; row++) {
            for (let col = 1; col < GAME_CONSTANTS.GRID_COLS - 1; col++) {
                if (grid[row][col] === CellType.PATH) {
                    // Place power pellets in corners
                    if ((row === 3 && (col === 1 || col === GAME_CONSTANTS.GRID_COLS - 2)) ||
                        (row === GAME_CONSTANTS.GRID_ROWS - 4 && 
                         (col === 1 || col === GAME_CONSTANTS.GRID_COLS - 2))) {
                        grid[row][col] = CellType.POWER_PELLET;
                    } else {
                        grid[row][col] = CellType.PELLET;
                    }
                }
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
            for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
                const x = col * GAME_CONSTANTS.CELL_SIZE;
                const y = row * GAME_CONSTANTS.CELL_SIZE;

                switch (this.grid[row][col]) {
                    case CellType.WALL:
                        ctx.fillStyle = GAME_CONSTANTS.WALL_COLOR;
                        ctx.fillRect(x, y, GAME_CONSTANTS.CELL_SIZE, GAME_CONSTANTS.CELL_SIZE);
                        break;
                        
                    case CellType.PELLET:
                        ctx.fillStyle = GAME_CONSTANTS.PELLET_COLOR;
                        const pelletOffset = (GAME_CONSTANTS.CELL_SIZE - GAME_CONSTANTS.PELLET_SIZE) / 2;
                        ctx.fillRect(
                            x + pelletOffset,
                            y + pelletOffset,
                            GAME_CONSTANTS.PELLET_SIZE,
                            GAME_CONSTANTS.PELLET_SIZE
                        );
                        break;
                        
                    case CellType.POWER_PELLET:
                        ctx.fillStyle = GAME_CONSTANTS.PELLET_COLOR;
                        const powerPelletOffset = (GAME_CONSTANTS.CELL_SIZE - GAME_CONSTANTS.POWER_PELLET_SIZE) / 2;
                        ctx.beginPath();
                        ctx.arc(
                            x + GAME_CONSTANTS.CELL_SIZE / 2,
                            y + GAME_CONSTANTS.CELL_SIZE / 2,
                            GAME_CONSTANTS.POWER_PELLET_SIZE / 2,
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                        break;
                }
            }
        }
    }

    public isWall(x: number, y: number): boolean {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        
        if (gridX < 0 || gridX >= GAME_CONSTANTS.GRID_COLS ||
            gridY < 0 || gridY >= GAME_CONSTANTS.GRID_ROWS) {
            return true;
        }
        
        return this.grid[gridY][gridX] === CellType.WALL;
    }

    public getPelletAt(x: number, y: number): CellType | null {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        
        if (gridX < 0 || gridX >= GAME_CONSTANTS.GRID_COLS ||
            gridY < 0 || gridY >= GAME_CONSTANTS.GRID_ROWS) {
            return null;
        }
        
        const cell = this.grid[gridY][gridX];
        return (cell === CellType.PELLET || cell === CellType.POWER_PELLET) ? cell : null;
    }

    public removePellet(x: number, y: number): void {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        
        if (gridX >= 0 && gridX < GAME_CONSTANTS.GRID_COLS &&
            gridY >= 0 && gridY < GAME_CONSTANTS.GRID_ROWS) {
            if (this.grid[gridY][gridX] === CellType.PELLET ||
                this.grid[gridY][gridX] === CellType.POWER_PELLET) {
                this.grid[gridY][gridX] = CellType.PATH;
            }
        }
    }
}
