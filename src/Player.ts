import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Position, Positionable, Renderable, Updateable, Direction } from './types';
import { RectangleCollider } from './Collider';
import { CollisionSystem } from './CollisionSystem';

export enum PowerUpType {
    NONE = 'none',
    SPEED_BOOST = 'speed-boost',
    INVISIBILITY = 'invisibility'
}

export class Player implements Positionable, Renderable, Updateable {
    private x: number;
    private y: number;
    private collider: RectangleCollider;
    private collisionSystem: CollisionSystem;
    private direction: Direction = Direction.NONE;
    private pressedDirections: Direction[] = [];
    private baseSpeed: number = GAME_CONSTANTS.PLAYER_SPEED;
    private speed: number = GAME_CONSTANTS.PLAYER_SPEED;
    private maze: Maze;
    
    // Animation properties
    private mouthAngle: number = Math.PI / 4;
    private mouthAnimationSpeed: number = 0.2;
    private mouthOpeningState: boolean = false;
    private isMoving: boolean = false;
    
    // Power-up properties
    private activePowerUp: PowerUpType = PowerUpType.NONE;
    private powerUpTimeRemaining: number = 0;
    private powerUpBlinkState: boolean = false;
    private powerUpBlinkTimer: number = 0;

    constructor(maze: Maze) {
        this.maze = maze;
        // Start position will be set in reset()
        this.x = 0;
        this.y = 0;
        
        // Initialize collision system
        this.collisionSystem = new CollisionSystem(maze);
        
        // Initialize collider with dummy position (will be updated in reset)
        const size = GAME_CONSTANTS.PLAYER_SIZE - 4; // Slightly smaller than the visual size for better movement
        this.collider = new RectangleCollider(
            { x: this.x, y: this.y },
            size,
            size
        );
        
        this.reset();
    }

    public reset(): void {
        // Start from the center of the maze
        const centerX = Math.floor(GAME_CONSTANTS.GRID_COLS / 2);
        const centerY = Math.floor(GAME_CONSTANTS.GRID_ROWS / 2);

        // Check center and nearby positions for a clear starting spot
        const checkPositions = [
            { x: centerX, y: centerY },     // Center
            { x: centerX, y: centerY + 1 }, // Below center
            { x: centerX, y: centerY - 1 }, // Above center
            { x: centerX + 1, y: centerY }, // Right of center
            { x: centerX - 1, y: centerY }  // Left of center
        ];

        for (const pos of checkPositions) {
            const pixelX = pos.x * GAME_CONSTANTS.CELL_SIZE;
            const pixelY = pos.y * GAME_CONSTANTS.CELL_SIZE;
            
            if (!this.maze.isWall(pixelX, pixelY)) {
                // Position player at the center of the cell
                this.x = pixelX + GAME_CONSTANTS.CELL_SIZE / 2;
                this.y = pixelY + GAME_CONSTANTS.CELL_SIZE / 2;
                
                // Update collider position
                this.collider.updatePosition({ x: this.x, y: this.y });
                
                // Reset powerups
                this.resetPowerUps();
                return;
            }
        }

        // Fallback to searching the whole maze if center area is blocked
        for (let y = 1; y < GAME_CONSTANTS.GRID_ROWS - 1; y++) {
            for (let x = 1; x < GAME_CONSTANTS.GRID_COLS - 1; x++) {
                const pixelX = x * GAME_CONSTANTS.CELL_SIZE;
                const pixelY = y * GAME_CONSTANTS.CELL_SIZE;
                if (!this.maze.isWall(pixelX, pixelY)) {
                    this.x = pixelX + GAME_CONSTANTS.CELL_SIZE / 2;
                    this.y = pixelY + GAME_CONSTANTS.CELL_SIZE / 2;
                    
                    // Update collider position
                    this.collider.updatePosition({ x: this.x, y: this.y });
                    
                    // Reset powerups
                    this.resetPowerUps();
                    return;
                }
            }
        }
    }

    public update(deltaTime: number = 16): void {
        // Update power-up state if active
        this.updatePowerUp(deltaTime);

        // Track if the player is moving this frame
        this.isMoving = false;

        // Try each pressed direction in order
        for (const dir of this.pressedDirections) {
            if (this.collisionSystem.canMove(this.collider, dir, this.speed)) {
                // Move in this direction
                this.direction = dir;
                
                // Calculate movement based on direction
                let dx = 0;
                let dy = 0;
                const moveAmount = this.speed * (deltaTime / 16);

                switch (this.direction) {
                    case Direction.RIGHT:
                        dx = moveAmount;
                        break;
                    case Direction.LEFT:
                        dx = -moveAmount;
                        break;
                    case Direction.UP:
                        dy = -moveAmount;
                        break;
                    case Direction.DOWN:
                        dy = moveAmount;
                        break;
                }

                // Update position
                this.x += dx;
                this.y += dy;
                
                // Update collider position
                this.collider.updatePosition({ x: this.x, y: this.y });
                
                this.isMoving = true;
                break; // Only move in the first valid direction
            }
        }

        // Update mouth animation
        if (this.isMoving) {
            // Calculate new mouth angle
            if (this.mouthOpeningState) {
                this.mouthAngle += this.mouthAnimationSpeed * (deltaTime / 16);
                if (this.mouthAngle >= Math.PI / 4) {
                    this.mouthAngle = Math.PI / 4;
                    this.mouthOpeningState = false;
                }
            } else {
                this.mouthAngle -= this.mouthAnimationSpeed * (deltaTime / 16);
                if (this.mouthAngle <= 0) {
                    this.mouthAngle = 0;
                    this.mouthOpeningState = true;
                }
            }
        } else {
            // Reset mouth angle when not moving
            this.mouthAngle = Math.PI / 4;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Apply opacity for invisibility effect
        if (this.activePowerUp === PowerUpType.INVISIBILITY) {
            // Make player partially transparent when invisible
            // Blink near the end of the power-up
            if (this.powerUpTimeRemaining < GAME_CONSTANTS.POWER_UP.FADE_DURATION) {
                ctx.globalAlpha = this.powerUpBlinkState ? 
                    GAME_CONSTANTS.POWER_UP.INVISIBILITY_OPACITY : 0.8;
            } else {
                ctx.globalAlpha = GAME_CONSTANTS.POWER_UP.INVISIBILITY_OPACITY;
            }
        } else if (this.activePowerUp === PowerUpType.SPEED_BOOST && 
                  this.powerUpTimeRemaining < GAME_CONSTANTS.POWER_UP.FADE_DURATION) {
            // Visual indicator that speed boost is about to end
            ctx.globalAlpha = this.powerUpBlinkState ? 0.7 : 1.0;
        }
        
        // Choose color based on power-up
        if (this.activePowerUp === PowerUpType.SPEED_BOOST) {
            // Bright blue for speed boost
            ctx.fillStyle = '#00ffff';
        } else {
            // Regular yellow color
            ctx.fillStyle = 'yellow';
        }
        
        ctx.beginPath();
        
        // Use the animated mouth angle
        const startAngle = (this.direction * Math.PI / 180) + this.mouthAngle;
        const endAngle = (this.direction * Math.PI / 180) + (2 * Math.PI - this.mouthAngle);
        
        // Draw Pac-Man
        ctx.arc(
            this.x,
            this.y,
            GAME_CONSTANTS.CELL_SIZE / 2 - 2, // Slightly smaller than cell
            startAngle,
            endAngle
        );
        
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw collider for debugging (uncomment when debugging needed)
        // this.collider.drawDebug(ctx, 'rgba(255, 255, 0, 0.3)');
        
        ctx.restore();
    }

    public handleKeydown(e: KeyboardEvent): void {
        let requestedDirection: Direction = Direction.NONE;
        
        switch (e.key.toLowerCase()) {
            case 'arrowright':
            case 'd':
            case 'right':
                requestedDirection = Direction.RIGHT;
                break;
            case 'arrowleft':
            case 'a':
            case 'left':
                requestedDirection = Direction.LEFT;
                break;
            case 'arrowup':
            case 'w':
            case 'up':
                requestedDirection = Direction.UP;
                break;
            case 'arrowdown':
            case 's':
            case 'down':
                requestedDirection = Direction.DOWN;
                break;
        }

        // Add direction to array if it's not already there
        if (requestedDirection !== Direction.NONE && 
            !this.pressedDirections.includes(requestedDirection)) {
            this.pressedDirections.unshift(requestedDirection); // Add to front for priority
        }
    }

    public handleKeyup(e: KeyboardEvent): void {
        let releasedDirection: Direction = Direction.NONE;
        
        switch (e.key.toLowerCase()) {
            case 'arrowright':
            case 'd':
            case 'right':
                releasedDirection = Direction.RIGHT;
                break;
            case 'arrowleft':
            case 'a':
            case 'left':
                releasedDirection = Direction.LEFT;
                break;
            case 'arrowup':
            case 'w':
            case 'up':
                releasedDirection = Direction.UP;
                break;
            case 'arrowdown':
            case 's':
            case 'down':
                releasedDirection = Direction.DOWN;
                break;
        }

        // Remove direction from array when key is released
        if (releasedDirection !== Direction.NONE) {
            this.pressedDirections = this.pressedDirections.filter(d => d !== releasedDirection);
            if (this.direction === releasedDirection && this.pressedDirections.length > 0) {
                this.direction = this.pressedDirections[0]; // Switch to next pressed direction
            }
        }
    }
    
    /**
     * Legacy method retained for compatibility.
     * Delegates to the collision system's canMove method.
     */
    private canMove(direction: Direction): boolean {
        return this.collisionSystem.canMove(this.collider, direction, this.speed);
    }

    /**
     * Gets the player's collider for collision detection
     */
    public getCollider(): RectangleCollider {
        return this.collider;
    }

    public getPosition(): Position {
        return { x: this.x, y: this.y };
    }
    
    /**
     * Activates a random power-up when player eats a power pellet
     */
    public activateRandomPowerUp(): void {
        const powerUps = [PowerUpType.SPEED_BOOST, PowerUpType.INVISIBILITY];
        const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        this.activatePowerUp(randomPowerUp);
    }

    /**
     * Activates a specific power-up
     * @param powerUpType - Type of power-up to activate
     */
    public activatePowerUp(powerUpType: PowerUpType): void {
        this.activePowerUp = powerUpType;
        this.powerUpTimeRemaining = GAME_CONSTANTS.POWER_UP.DURATION;
        
        // Apply power-up effects
        if (powerUpType === PowerUpType.SPEED_BOOST) {
            this.speed = this.baseSpeed * GAME_CONSTANTS.POWER_UP.SPEED_BOOST_MULTIPLIER;
        }
    }
    
    /**
     * Updates the active power-up status
     * @param deltaTime - Time elapsed since last update in ms
     */
    private updatePowerUp(deltaTime: number): void {
        if (this.activePowerUp === PowerUpType.NONE) return;
        
        // Update power-up time remaining
        this.powerUpTimeRemaining -= deltaTime;
        
        // Handle power-up expiration
        if (this.powerUpTimeRemaining <= 0) {
            this.resetPowerUps();
            return;
        }
        
        // Handle blinking effect when power-up is about to expire
        this.powerUpBlinkTimer += deltaTime;
        if (this.powerUpBlinkTimer >= GAME_CONSTANTS.POWER_UP.INDICATOR_BLINK_RATE) {
            this.powerUpBlinkState = !this.powerUpBlinkState;
            this.powerUpBlinkTimer = 0;
        }
    }
    
    /**
     * Resets all power-up effects
     */
    private resetPowerUps(): void {
        this.activePowerUp = PowerUpType.NONE;
        this.powerUpTimeRemaining = 0;
        this.powerUpBlinkState = false;
        this.powerUpBlinkTimer = 0;
        this.speed = this.baseSpeed;
    }
    
    /**
     * Checks if the player is currently invisible
     */
    public isInvisible(): boolean {
        return this.activePowerUp === PowerUpType.INVISIBILITY;
    }
    
    /**
     * Gets the current active power-up
     */
    public getActivePowerUp(): PowerUpType {
        return this.activePowerUp;
    }
    
    /**
     * Gets the time remaining for the current power-up
     */
    public getPowerUpTimeRemaining(): number {
        return this.powerUpTimeRemaining;
    }
    
    /**
     * Gets the current speed of the player
     */
    public getSpeed(): number {
        return this.speed;
    }
}
