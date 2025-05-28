import { GAME_CONSTANTS } from './constants';

/**
 * Handles the canvas neon glow effect
 */
export class CanvasGlow {
    private canvas: HTMLCanvasElement;
    private currentGlowColor: string = GAME_CONSTANTS.CANVAS_GLOW.COLORS[0];
    private nextGlowColor: string = GAME_CONSTANTS.CANVAS_GLOW.COLORS[1];
    private glowTransitionProgress: number = 0;
    private glowPulseProgress: number = 0;
    private colorIndex: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setup();
    }

    /**
     * Sets up the initial canvas glow effect
     */
    private setup(): void {
        this.canvas.style.position = 'relative';
        this.update(0);
    }

    /**
     * Updates the canvas glow effect
     */
    public update(deltaTime: number): void {
        // Update the color transition progress
        this.glowTransitionProgress += deltaTime / GAME_CONSTANTS.CANVAS_GLOW.TRANSITION_DURATION;
        if (this.glowTransitionProgress >= 1) {
            // Move to next color
            this.currentGlowColor = this.nextGlowColor;
            this.colorIndex = (this.colorIndex + 1) % GAME_CONSTANTS.CANVAS_GLOW.COLORS.length;
            this.nextGlowColor = GAME_CONSTANTS.CANVAS_GLOW.COLORS[this.colorIndex];
            this.glowTransitionProgress = 0;
        }

        // Update the pulse animation
        this.glowPulseProgress += deltaTime / GAME_CONSTANTS.CANVAS_GLOW.PULSE_DURATION;
        if (this.glowPulseProgress >= 1) {
            this.glowPulseProgress = 0;
        }

        // Calculate current color and opacity
        const progress = this.glowTransitionProgress;
        const r1 = parseInt(this.currentGlowColor.slice(1, 3), 16);
        const g1 = parseInt(this.currentGlowColor.slice(3, 5), 16);
        const b1 = parseInt(this.currentGlowColor.slice(5, 7), 16);
        
        const r2 = parseInt(this.nextGlowColor.slice(1, 3), 16);
        const g2 = parseInt(this.nextGlowColor.slice(3, 5), 16);
        const b2 = parseInt(this.nextGlowColor.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);
        
        // Calculate pulsing opacity
        const pulseOpacity = GAME_CONSTANTS.CANVAS_GLOW.MIN_OPACITY + 
            (GAME_CONSTANTS.CANVAS_GLOW.MAX_OPACITY - GAME_CONSTANTS.CANVAS_GLOW.MIN_OPACITY) * 
            (Math.sin(this.glowPulseProgress * Math.PI * 2) * 0.5 + 0.5);
        
        // Apply the glow effect
        const color = `rgba(${r}, ${g}, ${b}, ${pulseOpacity})`;
        this.canvas.style.boxShadow = `0 0 ${GAME_CONSTANTS.CANVAS_GLOW.BLUR_RADIUS} ${GAME_CONSTANTS.CANVAS_GLOW.SPREAD_RADIUS} ${color}`;
    }
}
