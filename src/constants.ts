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
    
    // Enemy configuration
    ENEMY_COUNT: 4,          // Number of enemies to spawn
    ENEMY_COLORS: ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'], // Red, Cyan, Pink, Orange
    ENEMY_SPEED: 1.5,        // Speed of enemies (pixels per frame)
    ENEMY_SIZE: 18,          // Size of enemy (slightly smaller than cell)
    ENEMY_EYE_RADIUS: 3,     // Radius of enemy eyes
    ENEMY_PUPIL_RADIUS: 1.5, // Radius of enemy pupils
    ENEMY_PATH_RECALC_INTERVAL: 500, // Time between path recalculations (ms)
    ENEMY_SPAWN_MIN_DISTANCE: 6,     // Minimum distance from center to spawn enemies
    
    // Player configuration
    PLAYER_SPEED: 2,         // Speed of player (pixels per frame)
    PLAYER_SIZE: 18,         // Size of player (slightly smaller than cell)
    
    // Collision detection
    COLLISION_TOLERANCE: 3,  // Tolerance for collision detection (pixels)
    
    // Pathfinding constants
    PATHFINDING_MANHATTAN_WEIGHT: 1,  // Weight for Manhattan distance in A* heuristic
} as const;

export { GAME_CONSTANTS };
