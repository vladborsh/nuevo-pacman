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
    POWER_PELLET_RESTORE_TIME: 15000, // Time in ms before a power pellet respawns
    
    // Timing and effects
    GAME_EVENTS: {
        DEATH_SHAKE_DURATION: 300,    // Duration of screen shake on death (ms)
        DEATH_SHAKE_MAGNITUDE: 8,     // Magnitude of screen shake on death (pixels)
        WIN_RESET_DELAY: 5000,        // Delay before resetting game after win (ms)
        WIN_SHAKE_DURATION: 500,      // Duration of screen shake on win (ms)
        WIN_SHAKE_MAGNITUDE: 5        // Magnitude of screen shake on win (pixels)
    },

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
            MAX_INTENSITY: 0.8,     // Maximum shine intensity
            SIZE: 100,              // Size of the shine effect
            COLOR: '#ff0000'       // Red color for enemy shine
        },
        TRAIL: {
            PARTICLE_COUNT: 0.1,        // Number of particles to emit per frame
            PARTICLE_SIZE: 3,         // Size of trail particles
            LIFETIME: 1000,           // Lifetime of trail particles in ms
            ALPHA_DECAY: 1,      // Rate of alpha decay
            RADIUS_DECAY: 0.002,     // Rate of radius decay
            COLOR_SATURATION: 80,    // Saturation of trail particle color
            COLOR_LIGHTNESS: 80      // Lightness of trail particle color
        }
    },
    
    // Player configuration
    PLAYER: {
        INITIAL_LIVES: 10,
        SIZE: 18,
        SPEED: 2,
        LIVES_DISPLAY: {
            RADIUS: 8,
            SPACING: 25,
            X_START: 30,
            Y_OFFSET: 20,
            COLOR: 'yellow',
            MOUTH_START_ANGLE: 0.25,
            MOUTH_END_ANGLE: 1.75
        }
    },
    
    // Power-up configuration
    POWER_UP: {
        DURATION: 5000,      // Duration of power-up effects in milliseconds
        SPEED_BOOST_MULTIPLIER: 1.7,  // Multiplier for player speed when boosted
        INVISIBILITY_OPACITY: 0.3,    // Player opacity when invisible
        INDICATOR_BLINK_RATE: 500,    // Blink rate for power-up indicator in ms
        FADE_DURATION: 1000,         // Duration of fade effect at end of power-up
    },
    
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
        
        // Death explosion configuration
        DEATH_PARTICLE: {
            COUNT: 40,                    // Number of particles for death explosion
            BASE_RADIUS: 4,              // Base size of death particles
            LIFETIME: 800,               // Lifetime in milliseconds
            BASE_SPEED: 0.3,             // Base movement speed
            SPEED_MIN_MULTIPLIER: 0.8,   // Minimum speed multiplier
            SPEED_VARIATION: 0.4,        // Random variation in speed
            SIZE_MIN_MULTIPLIER: 0.8,    // Minimum size multiplier
            SIZE_VARIATION: 0.4,         // Random variation in size
            ALPHA_DECAY_BASE: 0.001,     // Base alpha decay rate
            ALPHA_DECAY_VARIATION: 0.002, // Random variation in alpha decay
            RADIUS_DECAY_BASE: 0.0005,   // Base radius decay rate
            RADIUS_DECAY_VARIATION: 0.001,// Random variation in radius decay
            COLORS: [                    // Color palette for death particles
                '#FFD700',              // Gold
                '#FFA500',              // Orange
                '#FF4500',              // Red-Orange
                '#FF0000'               // Red
            ]
        },
        
        // Colors
        REGULAR_PELLET_COLOR: '#ffffffb0',  // Regular pellet particle color
        POWER_PELLET_SATURATION: 100,       // Power pellet color saturation percentage
        POWER_PELLET_LIGHTNESS: 70,         // Power pellet color lightness percentage

        // Firework particle settings
        FIREWORK: {
            COUNT: 30,               // Number of particles per firework
            LIFETIME: 1000,         // Lifetime in milliseconds
            BASE_RADIUS: 2,         // Base particle size
            BASE_SPEED: 0.3,        // Base particle speed
            SPEED_VARIATION: 0.2,   // Random speed variation
            GRAVITY: 0.0003,        // Gravity effect
            ALPHA_DECAY: 0.002,     // Alpha decay rate
            RADIUS_DECAY: 0.001     // Size decay rate
        }
    },

    // Countdown configuration
    COUNTDOWN: {
        START_SIZE: 48,           // Starting font size
        MAX_SIZE: 160,           // Maximum font size
        MIN_ALPHA: 0.1,          // Minimum opacity
        MAX_ALPHA: 0.5,          // Maximum opacity
        ANIMATION_DURATION: 1000, // Duration per number in ms
        GLOW_BLUR: 20,           // Shadow blur amount
        CIRCLE_SCALE: 0.8,       // Circle size relative to font size
        OUTER_GLOW_SCALE: 1.5,   // Outer glow size relative to circle size
        INNER_GLOW_ALPHA: 0.3,   // Inner glow opacity
        OUTER_GLOW_ALPHA: 0.1,   // Outer glow opacity
        COLOR: '#ffff00',        // Yellow base color
    },

    // Temporary enemy spawning
    TEMP_ENEMY: {
        SPAWN_INTERVAL: 30000,  // Time between spawns in milliseconds (30 seconds)
        LIFESPAN: 15000,       // How long temp enemies live in milliseconds (15 seconds)
    },

    // Scene glow configuration
    SCENE_GLOW: {
        COLORS: ['#2121ff', '#00ffff', '#00ff00'], // blue, cyan, green
        COLOR_TRANSITION_DURATION: 3000,  // Duration to transition between colors in ms
        GLOW_PERIOD: 4000,               // Period of the glow pulsing animation
        MIN_BRIGHTNESS: 0,             // Minimum brightness of the glow
        MAX_BRIGHTNESS: 0.3,             // Maximum brightness of the glow
        MIN_ALPHA: 0.2,                 // Minimum alpha for color transition
        MAX_ALPHA: 0.8                  // Maximum alpha for color transition
    },

    // Canvas neon glow effect
    CANVAS_GLOW: {
        COLORS: ['#2121ff', '#ff00ff', '#00ffff'], // blue, magenta, cyan
        TRANSITION_DURATION: 4000,    // Duration to transition between colors in ms
        BLUR_RADIUS: '35px',          // Shadow blur radius
        SPREAD_RADIUS: '5px',         // Shadow spread radius
        MIN_OPACITY: 0.4,             // Minimum shadow opacity
        MAX_OPACITY: 0.8,             // Maximum shadow opacity
        PULSE_DURATION: 1500          // Duration of the pulse animation in ms
    },

    // Timer configuration
    TIMER: {
        CONTAINER_ID: 'game-timer',
        UPDATE_INTERVAL: 1000, // Update timer every second
        FONT_FAMILY: 'Arial',
        FONT_SIZE: '24px',
        TEXT_COLOR: '#ffffff',
        POSITION: {
            TOP: '10px',
            RIGHT: '10px'
        }
    },
} as const;

export { GAME_CONSTANTS };
