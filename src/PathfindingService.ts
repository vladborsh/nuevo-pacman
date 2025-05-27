import { GAME_CONSTANTS } from './constants';
import { GridPosition, MazeInterface, PathNode } from './types';

/**
 * A service class that handles pathfinding logic
 */
export class PathfindingService {
    private maze: MazeInterface;
    
    constructor(maze: MazeInterface) {
        this.maze = maze;
    }
    
    /**
     * Finds a path from start to target using A* algorithm
     * @param start - Starting grid position
     * @param target - Target grid position
     * @returns Array of grid positions representing the path
     */
    public findPath(start: GridPosition, target: GridPosition): GridPosition[] {
        const openSet: PathNode[] = [];
        const closedSet: Set<string> = new Set();
        
        // Initialize with starting node
        const startNode: PathNode = {
            position: start,
            g: 0,
            h: this.heuristic(start, target),
            f: 0
        };
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);
        
        // Process nodes until we find the target or exhaust all options
        while (openSet.length > 0) {
            // Find node with lowest f score
            let currentIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            
            const current = openSet[currentIndex];
            
            // Check if we reached the target
            if (current.position.x === target.x && current.position.y === target.y) {
                return this.reconstructPath(current);
            }
            
            // Move current node from open to closed set
            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.position.x},${current.position.y}`);
            
            // Check all neighbors
            const neighbors = this.getNeighbors(current.position);
            for (const neighbor of neighbors) {
                // Skip if in closed set
                const key = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(key)) {
                    continue;
                }
                
                // Calculate g score for this neighbor
                const gScore = current.g + 1;
                
                // Check if neighbor is in open set
                let inOpenSet = false;
                let openSetIndex = -1;
                
                for (let i = 0; i < openSet.length; i++) {
                    if (openSet[i].position.x === neighbor.x && openSet[i].position.y === neighbor.y) {
                        inOpenSet = true;
                        openSetIndex = i;
                        break;
                    }
                }
                
                // If we found a better path, update it
                if (inOpenSet && gScore < openSet[openSetIndex].g) {
                    openSet[openSetIndex].g = gScore;
                    openSet[openSetIndex].f = gScore + openSet[openSetIndex].h;
                    openSet[openSetIndex].parent = current;
                }
                // If not in open set, add it
                else if (!inOpenSet) {
                    const neighborNode: PathNode = {
                        position: neighbor,
                        g: gScore,
                        h: this.heuristic(neighbor, target),
                        f: 0,
                        parent: current
                    };
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openSet.push(neighborNode);
                }
            }
        }
        
        // No path found
        return [];
    }
    
    /**
     * Gets valid neighboring positions
     * @param position - Current grid position
     * @returns Array of valid neighbor positions
     */
    private getNeighbors(position: GridPosition): GridPosition[] {
        const neighbors: GridPosition[] = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];
        
        for (const dir of directions) {
            const x = position.x + dir.x;
            const y = position.y + dir.y;
            
            // Check if neighbor is valid (not a wall)
            const cellType = this.maze.getCellTypeAt(x, y);
            if (cellType !== null && cellType !== 'wall') {
                neighbors.push({ x, y });
            }
        }
        
        return neighbors;
    }
    
    /**
     * Calculates heuristic value (Manhattan distance)
     * @param a - First position
     * @param b - Second position
     * @returns Manhattan distance between positions
     */
    private heuristic(a: GridPosition, b: GridPosition): number {
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * 
               GAME_CONSTANTS.PATHFINDING_MANHATTAN_WEIGHT;
    }
    
    /**
     * Reconstructs the path from the goal node back to the start
     * @param endNode - The goal node
     * @returns Array of grid positions representing the path
     */
    private reconstructPath(endNode: PathNode): GridPosition[] {
        const path: GridPosition[] = [];
        let current: PathNode | undefined = endNode;
        
        while (current !== undefined) {
            path.unshift(current.position);
            current = current.parent;
        }
        
        // Remove the start position (we're already there)
        if (path.length > 0) {
            path.shift();
        }
        
        return path;
    }
    
    /**
     * Converts from pixel coordinates to grid coordinates
     * @param x - X pixel coordinate
     * @param y - Y pixel coordinate
     * @returns Grid coordinates
     */
    public pixelToGrid(x: number, y: number): GridPosition {
        const gridX = Math.floor(x / GAME_CONSTANTS.CELL_SIZE);
        const gridY = Math.floor(y / GAME_CONSTANTS.CELL_SIZE);
        return { x: gridX, y: gridY };
    }
    
    /**
     * Converts from grid coordinates to pixel coordinates (center of cell)
     * @param gridX - Grid X coordinate
     * @param gridY - Grid Y coordinate
     * @returns Pixel coordinates
     */
    public gridToPixel(gridX: number, gridY: number): { x: number, y: number } {
        const x = gridX * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
        const y = gridY * GAME_CONSTANTS.CELL_SIZE + GAME_CONSTANTS.CELL_SIZE / 2;
        return { x, y };
    }
}
