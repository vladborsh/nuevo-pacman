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
    ENEMY: {
        COUNT: 4,          // Number of enemies to spawn
        COLORS: ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'], // Red, Cyan, Pink, Orange
        SPEED: 1,        // Speed of enemies (pixels per frame)
        SIZE: 18,          // Size of enemy (slightly smaller than cell)
        EYE_RADIUS: 3,     // Radius of enemy eyes
        PUPIL_RADIUS: 1.5, // Radius of enemy pupils
        PATH_RECALC_INTERVAL: 500, // Time between path recalculations (ms)
        SPAWN_MIN_DISTANCE: 6,     // Minimum distance from center to spawn enemies
        SHINE: {
            START_DISTANCE: 150,    // Distance at which shine starts to appear
            MAX_INTENSITY: 0.9,     // Maximum shine intensity
            SIZE: 50,              // Size of the shine effect
            COLOR: '#ff0000'       // Red color for enemy shine
        }
    },
    
    // Player configuration
    PLAYER_SPEED: 2,         // Speed of player (pixels per frame)
    PLAYER_SIZE: 18,         // Size of player (slightly smaller than cell)
    
    // Collision detection
    COLLISION_TOLERANCE: 3,  // Tolerance for collision detection (pixels)
    
    // Pathfinding constants
    PATHFINDING_MANHATTAN_WEIGHT: 1,  // Weight for Manhattan distance in A* heuristic

    // Shine animation configuration
    SHINE: {
        PERIOD: 2000,           // Animation cycle duration in milliseconds
        MIN_BRIGHTNESS: 0.5,    // Minimum brightness level (0-1)
        MAX_BRIGHTNESS: 1,    // Maximum brightness level (can be > 1 for overbright)
        SIZE: 15,              // Size of the outer shine radius in pixels
    },
    
    // Particle system configuration
    PARTICLE: {
        // Timing
        PELLET_PARTICLE_LIFETIME: 300,      // Regular pellet particle lifetime in ms
        POWER_PELLET_PARTICLE_LIFETIME: 500, // Power pellet particle lifetime in ms
        
        // Counts
        PELLET_PARTICLE_COUNT: 6,           // Number of particles for regular pellets
        POWER_PELLET_PARTICLE_COUNT: 12,    // Number of particles for power pellets
        
        // Sizes and speeds
        PELLET_PARTICLE_SIZE: 1,            // Base size for regular pellet particles
        POWER_PELLET_PARTICLE_SIZE: 2,      // Base size for power pellet particles
        PELLET_PARTICLE_SPEED: 0.15,        // Base speed for regular pellet particles
        POWER_PELLET_PARTICLE_SPEED: 0.2,   // Base speed for power pellet particles
        
        // Multipliers and variations
        SIZE_START_MULTIPLIER: 3.0,         // Initial size multiplier
        SIZE_VARIATION: 1.0,                // Random variation in size
        SPEED_MIN_MULTIPLIER: 0.7,          // Minimum speed multiplier
        SPEED_VARIATION: 0.6,               // Random variation in speed
        ALPHA_DECAY_BASE: 0,                // Base alpha decay rate
        ALPHA_DECAY_VARIATION: 0.6,         // Random variation in alpha decay
        RADIUS_DECAY_BASE: 0.004,           // Base radius decay rate
        RADIUS_DECAY_VARIATION: 0.003,      // Random variation in radius decay
        
        // Colors
        REGULAR_PELLET_COLOR: '#ffffffb0',  // Regular pellet particle color
        POWER_PELLET_SATURATION: 100,       // Power pellet color saturation percentage
        POWER_PELLET_LIGHTNESS: 70         // Power pellet color lightness percentage
    }
} as const;

export { GAME_CONSTANTS };
