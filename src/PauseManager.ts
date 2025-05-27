import { Renderable } from './types';

/**
 * Manages the pause state and renders the pause overlay
 */
export class PauseManager implements Renderable {
    private isPaused: boolean = false;
    
    /**
     * Checks if the game is currently paused
     * @returns True if the game is paused, false otherwise
     */
    public isPausedState(): boolean {
        return this.isPaused;
    }
    
    /**
     * Toggles the pause state of the game
     * @returns The new pause state
     */
    public togglePause(): boolean {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
    
    /**
     * Sets the pause state of the game
     * @param paused - The pause state to set
     */
    public setPause(paused: boolean): void {
        this.isPaused = paused;
    }
    
    /**
     * Handles keyboard input for pausing
     * @param e - The keyboard event
     * @returns True if the event was handled, false otherwise
     */
    public handleKeydown(e: KeyboardEvent): boolean {
        if (e.key === ' ' || e.code === 'Space') {
            this.togglePause();
            return true;
        }
        return false;
    }
    
    /**
     * Draws the pause overlay on the canvas when the game is paused
     * @param ctx - The canvas rendering context
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isPaused) return;
        
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Semi-transparent black overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        // Pause text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', width / 2, height / 2 - 30);
        
        // Instructions
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to resume', width / 2, height / 2 + 20);
    }
}
