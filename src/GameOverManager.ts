import { GAME_CONSTANTS } from './constants';

export class GameOverManager {
    private isVisible: boolean = false;

    constructor() {}

    public show(): void {
        this.isVisible = true;
    }

    public hide(): void {
        this.isVisible = false;
    }

    public isGameOver(): boolean {
        return this.isVisible;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;

        ctx.save();
        
        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        
        // Draw "GAME OVER" text
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            'GAME OVER',
            GAME_CONSTANTS.CANVAS_WIDTH / 2,
            GAME_CONSTANTS.CANVAS_HEIGHT / 2
        );
        
        // Draw restart instruction
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(
            'Press SPACE to restart',
            GAME_CONSTANTS.CANVAS_WIDTH / 2,
            GAME_CONSTANTS.CANVAS_HEIGHT / 2 + 50
        );
        
        ctx.restore();
    }
}
