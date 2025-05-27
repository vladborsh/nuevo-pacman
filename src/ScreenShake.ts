import { Position } from './types';

export class ScreenShake {
    private duration: number;
    private magnitude: number;
    private elapsed: number;
    private isActive: boolean;
    private offset: Position;

    constructor() {
        this.duration = 0;
        this.magnitude = 0;
        this.elapsed = 0;
        this.isActive = false;
        this.offset = { x: 0, y: 0 };
    }

    /**
     * Starts a screen shake effect
     * @param duration Duration of the shake in milliseconds
     * @param magnitude Maximum shake displacement in pixels
     */
    public shake(duration: number, magnitude: number): void {
        this.duration = duration;
        this.magnitude = magnitude;
        this.elapsed = 0;
        this.isActive = true;
    }

    /**
     * Updates the screen shake effect
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    public update(deltaTime: number): void {
        if (!this.isActive) return;

        this.elapsed += deltaTime;

        if (this.elapsed >= this.duration) {
            this.isActive = false;
            this.offset = { x: 0, y: 0 };
            return;
        }

        // Calculate shake intensity using smooth falloff
        const progress = this.elapsed / this.duration;
        const intensity = this.magnitude * (1 - Math.pow(progress, 2));

        // Generate random offset
        const angle = Math.random() * Math.PI * 2;
        this.offset = {
            x: Math.cos(angle) * intensity,
            y: Math.sin(angle) * intensity
        };
    }

    /**
     * Gets the current screen shake offset
     */
    public getOffset(): Position {
        return this.offset;
    }

    /**
     * Checks if the screen shake is currently active
     */
    public isShaking(): boolean {
        return this.isActive;
    }

    /**
     * Stops the screen shake effect immediately
     */
    public stop(): void {
        this.isActive = false;
        this.offset = { x: 0, y: 0 };
    }
}
