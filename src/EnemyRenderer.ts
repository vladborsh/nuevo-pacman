import { GAME_CONSTANTS } from './constants';
import { EnemyRenderer } from './types';
import { Direction } from './Player';
import { Position } from './types';

/**
 * Handles rendering of enemies
 */
export class EnemyRendererService implements EnemyRenderer {
    private color: string;
    
    constructor(color: string) {
        this.color = color;
    }
    
    /**
     * Renders the enemy at the specified position with the given direction
     * @param ctx - Canvas rendering context
     * @param position - Enemy's position
     * @param direction - Enemy's direction of movement
     */
    public render(ctx: CanvasRenderingContext2D, position: Position, direction: Direction): void {
        ctx.save();
        
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
            GAME_CONSTANTS.ENEMY_SIZE / 2,
            Math.PI,
            0,
            false
        );
        
        // Draw the "skirt" (bottom part of ghost)
        const width = GAME_CONSTANTS.ENEMY_SIZE;
        const height = GAME_CONSTANTS.ENEMY_SIZE / 2;
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
        const eyeRadius = GAME_CONSTANTS.ENEMY_EYE_RADIUS;
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
        const pupilRadius = GAME_CONSTANTS.ENEMY_PUPIL_RADIUS;
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
}
