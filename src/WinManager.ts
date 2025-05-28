import { Renderable } from './types';
import { ParticleSystem } from './Particle';
import { GAME_CONSTANTS } from './constants';

export class WinManager implements Renderable {
    private isVisible: boolean = false;
    private particleSystem: ParticleSystem;
    private lastFireworkTime: number = 0;
    private fireworkInterval: number = 300; // Launch firework every 300ms

    constructor(particleSystem: ParticleSystem) {
        this.particleSystem = particleSystem;
    }

    public show(): void {
        this.isVisible = true;
        this.lastFireworkTime = 0;
        this.launchFireworks();
    }

    public hide(): void {
        this.isVisible = false;
    }

    private launchFireworks(): void {
        if (!this.isVisible) return;

        const currentTime = Date.now();
        if (currentTime - this.lastFireworkTime >= this.fireworkInterval) {
            // Launch a firework at a random position near the top of the screen
            const x = Math.random() * GAME_CONSTANTS.CANVAS_WIDTH;
            const y = Math.random() * (GAME_CONSTANTS.CANVAS_HEIGHT / 2);
            this.particleSystem.createFirework({ x, y });
            this.lastFireworkTime = currentTime;
        }

        // Continue launching fireworks
        requestAnimationFrame(() => this.launchFireworks());
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;

        // Draw semi-transparent overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

        // Draw congratulations text
        ctx.fillStyle = 'yellow';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            'CONGRATULATIONS!', 
            GAME_CONSTANTS.CANVAS_WIDTH / 2, 
            GAME_CONSTANTS.CANVAS_HEIGHT / 2 - 30
        );

        // Draw "You Won!" text
        ctx.fillStyle = 'white';
        ctx.font = '32px Arial';
        ctx.fillText(
            'You Won!', 
            GAME_CONSTANTS.CANVAS_WIDTH / 2, 
            GAME_CONSTANTS.CANVAS_HEIGHT / 2 + 30
        );

        ctx.restore();
    }
}