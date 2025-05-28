import { Position } from './types';
import { GAME_CONSTANTS } from './constants';

export class AmbientShine {
    private startTime: number;
    private brightness: number;
    private period: number;
    private minBrightness: number;
    private maxBrightness: number;
    private outerRadius: number;
    private color: string;

    constructor(
        period: number = GAME_CONSTANTS.SHINE.PERIOD,
        minBrightness: number = GAME_CONSTANTS.SHINE.MIN_BRIGHTNESS,
        maxBrightness: number = GAME_CONSTANTS.SHINE.MAX_BRIGHTNESS,
        color: string = '#ffffff'
    ) {
        this.startTime = Date.now();
        this.brightness = 1.0;
        this.period = period;
        this.minBrightness = minBrightness;
        this.maxBrightness = maxBrightness;
        this.outerRadius = GAME_CONSTANTS.SHINE.SIZE;
        this.color = color;
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public update(): void {
        const time = Date.now();
        const elapsed = time - this.startTime;
        const phase = (elapsed % this.period) / this.period;
        
        // Sinusoidal oscillation between min and max brightness
        this.brightness = this.minBrightness + 
            (this.maxBrightness - this.minBrightness) * 
            (Math.sin(phase * Math.PI * 2) * 0.5 + 0.5);
    }

    private parseColor(color: string): { r: number, g: number, b: number } {
        // Handle hex color
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
        // Handle rgb/rgba color
        const match = color.match(/\d+/g);
        if (match) {
            return {
                r: parseInt(match[0]),
                g: parseInt(match[1]),
                b: parseInt(match[2])
            };
        }
        return { r: 255, g: 255, b: 255 }; // Default to white if parsing fails
    }

    public draw(ctx: CanvasRenderingContext2D, position: Position, baseSize: number, intensityMultiplier: number = 1): void {
        const originalAlpha = ctx.globalAlpha;
        const { x, y } = position;
        const adjustedBrightness = this.brightness * intensityMultiplier;
        const { r, g, b } = this.parseColor(this.color);
        
        // Create inner glow gradient
        const innerGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, baseSize / 2
        );
        innerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${adjustedBrightness})`);
        innerGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${adjustedBrightness * 0.5})`);

        // Create outer glow gradient
        const outerGradient = ctx.createRadialGradient(
            x, y, baseSize / 2,
            x, y, this.outerRadius
        );
        outerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${adjustedBrightness * 0.5})`);
        outerGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        // Draw outer glow
        ctx.globalAlpha = originalAlpha;
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner glow
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(x, y, baseSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = originalAlpha;
    }
}
