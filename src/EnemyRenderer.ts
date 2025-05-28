import { GAME_CONSTANTS } from './constants';
import { EnemyRenderer, Direction, Position } from './types';
import { AmbientShine } from './AmbientShine';

/**
 * Handles rendering of enemies
 */
export class EnemyRendererService implements EnemyRenderer {
    private color: string;
    private shine: AmbientShine;
    
    constructor(color: string) {
        this.color = color;
        this.shine = new AmbientShine(
            GAME_CONSTANTS.SHINE.PERIOD,
            GAME_CONSTANTS.SHINE.MIN_BRIGHTNESS,
            GAME_CONSTANTS.SHINE.MAX_BRIGHTNESS,
            GAME_CONSTANTS.ENEMY.SHINE.COLOR
        );
    }
    
    /**
     * Renders the enemy at the specified position with the given direction
     * @param ctx - Canvas rendering context
     * @param position - Enemy's position
     * @param direction - Enemy's direction of movement
     * @param playerDistance - Distance to the player (for shine effect)
     */
    public render(
        ctx: CanvasRenderingContext2D, 
        position: Position, 
        direction: Direction,
        playerDistance?: number
    ): void {
        ctx.save();
        
        // Draw shine effect if close to player
        if (playerDistance !== undefined && 
            playerDistance < GAME_CONSTANTS.ENEMY.SHINE.START_DISTANCE) {
            // Calculate shine intensity based on distance
            const intensity = Math.max(0, 1 - (playerDistance / GAME_CONSTANTS.ENEMY.SHINE.START_DISTANCE));
            this.shine.update();
            this.shine.draw(
                ctx,
                position,
                GAME_CONSTANTS.ENEMY.SHINE.SIZE,
                intensity * GAME_CONSTANTS.ENEMY.SHINE.MAX_INTENSITY
            );
        }
        
        // Draw body with the enemy's color
        ctx.fillStyle = this.color;
        
        this.drawBody(ctx, position);
        this.drawEyes(ctx, position, direction);
        
        ctx.restore();
    }
    
    /**
     * Draws the enemy's body
     * @param ctx - Canvas rendering context
     * @param position - Enemy's position
     */
    private drawBody(ctx: CanvasRenderingContext2D, position: Position): void {
        const { x, y } = position;
        
        // Draw semi-circle top
        ctx.beginPath();
        ctx.arc(
            x,
            y - 2,
            GAME_CONSTANTS.ENEMY.SIZE / 2,
            Math.PI,
            0,
            false
        );
        
        // Draw the "skirt" (bottom part of ghost)
        const width = GAME_CONSTANTS.ENEMY.SIZE;
        const height = GAME_CONSTANTS.ENEMY.SIZE / 2;
        const startX = x - width / 2;
        const startY = y - 2;
        
        ctx.lineTo(startX + width, startY);
        
        // Create wavy bottom
        const segments = 3;
        const segmentWidth = width / segments;
        
        for (let i = 0; i < segments; i++) {
            ctx.lineTo(
                startX + width - i * segmentWidth - segmentWidth / 2,
                startY + height
            );
            ctx.lineTo(
                startX + width - (i + 1) * segmentWidth,
                startY
            );
        }
        
        ctx.fill();
    }
    
    /**
     * Draws the enemy's eyes
     * @param ctx - Canvas rendering context
     * @param position - Enemy's position
     * @param direction - Enemy's direction of movement
     */
    private drawEyes(ctx: CanvasRenderingContext2D, position: Position, direction: Direction): void {
        const { x, y } = position;
        const eyeRadius = GAME_CONSTANTS.ENEMY.EYE_RADIUS;
        const eyeOffsetX = 5;
        const eyeOffsetY = -5;
        
        // Draw white parts of eyes
        ctx.fillStyle = 'white';
        
        // Left eye
        ctx.beginPath();
        ctx.arc(x - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils based on direction
        ctx.fillStyle = 'black';
        const pupilRadius = GAME_CONSTANTS.ENEMY.PUPIL_RADIUS;
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        // Set pupil position based on direction
        switch (direction) {
            case Direction.LEFT:
                pupilOffsetX = -1.5;
                break;
            case Direction.RIGHT:
                pupilOffsetX = 1.5;
                break;
            case Direction.UP:
                pupilOffsetY = -1.5;
                break;
            case Direction.DOWN:
                pupilOffsetY = 1.5;
                break;
        }
        
        // Left pupil
        ctx.beginPath();
        ctx.arc(
            x - eyeOffsetX + pupilOffsetX,
            y + eyeOffsetY + pupilOffsetY,
            pupilRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Right pupil
        ctx.beginPath();
        ctx.arc(
            x + eyeOffsetX + pupilOffsetX,
            y + eyeOffsetY + pupilOffsetY,
            pupilRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    /**
     * Gets the enemy's color
     * @returns Enemy color as a string
     */
    public getColor(): string {
        return this.color;
    }
}
