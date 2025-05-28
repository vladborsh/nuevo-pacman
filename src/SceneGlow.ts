import { AmbientShine } from './AmbientShine';
import { Renderable, Updateable, Position } from './types';
import { GAME_CONSTANTS } from './constants';

interface RGB {
    r: number;
    g: number;
    b: number;
}

/**
 * Handles the scene-wide glow effect with smooth color cycling
 */
export class SceneGlow implements Renderable, Updateable {
    private ambientGlow: AmbientShine;
    private colorIndex: number = 0;
    private transitionProgress: number = 0;
    private currentColor: RGB;
    private targetColor: RGB;

    constructor() {
        this.ambientGlow = new AmbientShine(
            GAME_CONSTANTS.SCENE_GLOW.GLOW_PERIOD,
            GAME_CONSTANTS.SCENE_GLOW.MIN_BRIGHTNESS,
            GAME_CONSTANTS.SCENE_GLOW.MAX_BRIGHTNESS,
            GAME_CONSTANTS.SCENE_GLOW.COLORS[0]
        );

        // Initialize colors
        this.currentColor = this.hexToRgb(GAME_CONSTANTS.SCENE_GLOW.COLORS[0]);
        this.colorIndex = 0;
        const nextColorIndex = (this.colorIndex + 1) % GAME_CONSTANTS.SCENE_GLOW.COLORS.length;
        this.targetColor = this.hexToRgb(GAME_CONSTANTS.SCENE_GLOW.COLORS[nextColorIndex]);
    }

    private hexToRgb(hex: string): RGB {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    private rgbToHex(rgb: RGB): string {
        return '#' + [rgb.r, rgb.g, rgb.b]
            .map(x => Math.round(x).toString(16).padStart(2, '0'))
            .join('');
    }

    private interpolateColor(progress: number): RGB {
        return {
            r: this.currentColor.r + (this.targetColor.r - this.currentColor.r) * progress,
            g: this.currentColor.g + (this.targetColor.g - this.currentColor.g) * progress,
            b: this.currentColor.b + (this.targetColor.b - this.currentColor.b) * progress
        };
    }

    public update(deltaTime: number): void {
        // Update transition progress
        this.transitionProgress += deltaTime / GAME_CONSTANTS.SCENE_GLOW.COLOR_TRANSITION_DURATION;

        if (this.transitionProgress >= 1) {
            // Transition complete, move to next color
            this.transitionProgress = 0;
            this.currentColor = this.targetColor;
            this.colorIndex = (this.colorIndex + 1) % GAME_CONSTANTS.SCENE_GLOW.COLORS.length;
            const nextColorIndex = (this.colorIndex + 1) % GAME_CONSTANTS.SCENE_GLOW.COLORS.length;
            this.targetColor = this.hexToRgb(GAME_CONSTANTS.SCENE_GLOW.COLORS[nextColorIndex]);
        }

        // Calculate current interpolated color
        const interpolatedColor = this.interpolateColor(this.transitionProgress);
        this.ambientGlow.setColor(this.rgbToHex(interpolatedColor));

        // Update the glow effect
        this.ambientGlow.update();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // Save current alpha
        const currentAlpha = ctx.globalAlpha;

        // Set alpha based on transition progress for smoother fading
        const alpha = GAME_CONSTANTS.SCENE_GLOW.MIN_ALPHA + 
            (GAME_CONSTANTS.SCENE_GLOW.MAX_ALPHA - GAME_CONSTANTS.SCENE_GLOW.MIN_ALPHA) * 
            (Math.sin(this.transitionProgress * Math.PI) * 0.5 + 0.5);
        ctx.globalAlpha = alpha;

        this.ambientGlow.draw(
            ctx,
            { 
                x: canvasWidth / 2, 
                y: canvasHeight / 2 
            },
            Math.max(canvasWidth, canvasHeight),
            1
        );

        // Restore original alpha
        ctx.globalAlpha = currentAlpha;
    }
}
