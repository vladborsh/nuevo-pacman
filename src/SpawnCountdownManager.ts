import { GAME_CONSTANTS } from './constants';
import { Renderable } from './types';

/**
 * Manages the countdown overlay before spawning enemies
 */
export class SpawnCountdownManager implements Renderable {
    private isVisible: boolean = false;
    private currentNumber: number = 5;
    private animationProgress: number = 0;
    private callback: (() => void) | null = null;

    public startCountdown(onComplete: () => void): void {
        this.isVisible = true;
        this.currentNumber = 5;
        this.animationProgress = 0;
        this.callback = onComplete;
    }

    public update(deltaTime: number): boolean {
        if (!this.isVisible) return false;

        this.animationProgress += deltaTime;

        // If current number animation is complete
        if (this.animationProgress >= GAME_CONSTANTS.COUNTDOWN.ANIMATION_DURATION) {
            this.currentNumber--;
            this.animationProgress = 0;

            // If countdown is complete
            if (this.currentNumber <= 0) {
                this.isVisible = false;
                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }
                return false;
            }
        }

        return true;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;

        const progress = this.animationProgress / GAME_CONSTANTS.COUNTDOWN.ANIMATION_DURATION;
        const startSize = GAME_CONSTANTS.COUNTDOWN.START_SIZE;
        const maxSize = GAME_CONSTANTS.COUNTDOWN.MAX_SIZE;
        const minAlpha = GAME_CONSTANTS.COUNTDOWN.MIN_ALPHA;
        const maxAlpha = GAME_CONSTANTS.COUNTDOWN.MAX_ALPHA;

        // Ease in-out function for smooth animation
        const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easeProgress = easeInOut(progress);

        // Calculate current size and alpha
        const size = startSize + (maxSize - startSize) * easeProgress;
        const alpha = minAlpha + (maxAlpha - minAlpha) * (1 - easeProgress);

        // Draw background circle
        ctx.save();
        const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
        const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
        const circleRadius = size * GAME_CONSTANTS.COUNTDOWN.CIRCLE_SCALE;

        // Draw outer glow
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, circleRadius
        );
        // Extract RGB values from the hex color
        const color = GAME_CONSTANTS.COUNTDOWN.COLOR;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * GAME_CONSTANTS.COUNTDOWN.INNER_GLOW_ALPHA})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * GAME_CONSTANTS.COUNTDOWN.OUTER_GLOW_ALPHA})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius * GAME_CONSTANTS.COUNTDOWN.OUTER_GLOW_SCALE, 0, Math.PI * 2);
        ctx.fill();

        // Draw number with glow
        ctx.shadowColor = GAME_CONSTANTS.COUNTDOWN.COLOR;
        ctx.shadowBlur = GAME_CONSTANTS.COUNTDOWN.GLOW_BLUR;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`; // Color with fading alpha
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw at center of screen
        ctx.fillText(
            this.currentNumber.toString(),
            GAME_CONSTANTS.CANVAS_WIDTH / 2,
            GAME_CONSTANTS.CANVAS_HEIGHT / 2
        );
        ctx.restore();
    }
}
