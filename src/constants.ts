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

    // Particle system configuration
    PARTICLE: {
        // Timing
        PELLET_PARTICLE_LIFETIME: 300,      // Regular pellet particle lifetime in ms
        POWER_PELLET_PARTICLE_LIFETIME: 500, // Power pellet particle lifetime in ms
        
        // Counts
        PELLET_PARTICLE_COUNT: 6,           // Number of particles for regular pellets
        POWER_PELLET_PARTICLE_COUNT: 12,    // Number of particles for power pellets
        
        // Sizes and speeds
        PELLET_PARTICLE_SIZE: 2,            // Base size for regular pellet particles
        POWER_PELLET_PARTICLE_SIZE: 3,      // Base size for power pellet particles
        PELLET_PARTICLE_SPEED: 0.15,        // Base speed for regular pellet particles
        POWER_PELLET_PARTICLE_SPEED: 0.2,   // Base speed for power pellet particles
        
        // Multipliers and variations
        SIZE_START_MULTIPLIER: 2.5,         // Initial size multiplier
        SIZE_VARIATION: 0.5,                // Random variation in size
        SPEED_MIN_MULTIPLIER: 0.8,          // Minimum speed multiplier
        SPEED_VARIATION: 0.4,               // Random variation in speed
        ALPHA_DECAY_BASE: 0,                // Base alpha decay rate
        ALPHA_DECAY_VARIATION: 0.5,         // Random variation in alpha decay
        RADIUS_DECAY_BASE: 0.004,           // Base radius decay rate
        RADIUS_DECAY_VARIATION: 0.002,      // Random variation in radius decay
        
        // Colors
        REGULAR_PELLET_COLOR: '#ffffff90',  // Regular pellet particle color
        POWER_PELLET_SATURATION: 100,       // Power pellet color saturation percentage
        POWER_PELLET_LIGHTNESS: 70         // Power pellet color lightness percentage
    }
} as const;

export { GAME_CONSTANTS };
