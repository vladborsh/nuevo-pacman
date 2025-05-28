import { GAME_CONSTANTS } from './constants';

/**
 * Manages player lives and game over state
 */
export class LivesManager {
    private lives: number;
    private isGameOver: boolean = false;

    constructor(private onGameOver: () => void) {
        this.lives = GAME_CONSTANTS.PLAYER.INITIAL_LIVES;
    }

    public getLives(): number {
        return this.lives;
    }
    
    public loseLife(): void {
        this.lives--;

        if (this.lives <= 0) {
            this.isGameOver = true;
            this.onGameOver();
        }
    }

    public reset(): void {
        this.lives = GAME_CONSTANTS.PLAYER.INITIAL_LIVES;
        this.isGameOver = false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Draw lives count using Pac-Man shapes
        for (let i = 0; i < this.lives; i++) {
            ctx.beginPath();
            ctx.fillStyle = GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.COLOR;
            ctx.arc(
                GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.X_START + i * GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.SPACING,
                GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.Y_OFFSET,
                GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.RADIUS,
                GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.MOUTH_START_ANGLE * Math.PI,
                GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.MOUTH_END_ANGLE * Math.PI
            );
            ctx.lineTo(
                GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.X_START + i * GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.SPACING,
                GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.PLAYER.LIVES_DISPLAY.Y_OFFSET
            );
            ctx.fill();
            ctx.closePath();
        }
        
        ctx.restore();
    }
}
