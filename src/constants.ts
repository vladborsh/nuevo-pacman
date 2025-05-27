const GAME_CONSTANTS = {
    // Canvas dimensions
    CANVAS_WIDTH: 560,  // 28 * 20 pixels
    CANVAS_HEIGHT: 620, // 31 * 20 pixels
    
    // Maze configuration
    CELL_SIZE: 20,
    GRID_ROWS: 31,    // Classic Pac-Man maze height
    GRID_COLS: 28,    // Classic Pac-Man maze width
    
    // Colors
    WALL_COLOR: '#2121DE',    // Classic Pac-Man blue walls
    BACKGROUND_COLOR: '#000000',
    PELLET_COLOR: '#ffffff',  // White pellets
    
    // Game elements
    PELLET_SIZE: 4,          // Size of regular pellets
    POWER_PELLET_SIZE: 8,    // Size of power pellets
} as const;

export { GAME_CONSTANTS };
