import { Position, Renderable, Updateable, CSSColor } from './types';
import { GAME_CONSTANTS } from './constants';

export interface ParticleParams {
    position: Position;
    velocity: Position;
    color: CSSColor;
    radius: number;
    lifetime: number;
    alphaDecay: number;
    radiusDecay: number;
}

export class Particle implements Renderable, Updateable {
    private position: Position;
    private velocity: Position;
    private color: CSSColor;
    private radius: number;
    private alpha: number = 1;
    private lifetime: number;
    private lifetimeElapsed: number = 0;
    private alphaDecay: number;
    private radiusDecay: number;

    constructor(params: ParticleParams) {
        this.position = { ...params.position };
        this.velocity = { ...params.velocity };
        this.color = params.color;
        this.radius = params.radius;
        this.lifetime = params.lifetime;
        this.alphaDecay = params.alphaDecay;
        this.radiusDecay = params.radiusDecay;
    }

    public update(deltaTime: number): void {
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update lifetime and properties
        this.lifetimeElapsed += deltaTime;
        const lifeProgress = this.lifetimeElapsed / this.lifetime;

        // Start with larger radius and decay exponentially
        this.radius = Math.max(0, this.radius * (1 - this.radiusDecay * deltaTime));
        this.alpha = Math.max(0, 1 - this.alphaDecay * lifeProgress);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    public isDead(): boolean {
        return this.lifetimeElapsed >= this.lifetime || this.radius <= 0;
    }
}

export class ParticleSystem implements Renderable, Updateable {
    private particles: Particle[] = [];

    public createPelletExplosion(position: Position, isPowerPellet: boolean = false): void {
        const { PARTICLE } = GAME_CONSTANTS;
        
        const count = isPowerPellet ? 
            PARTICLE.POWER_PELLET_PARTICLE_COUNT : 
            PARTICLE.PELLET_PARTICLE_COUNT;
            
        const baseRadius = isPowerPellet ? 
            PARTICLE.POWER_PELLET_PARTICLE_SIZE : 
            PARTICLE.PELLET_PARTICLE_SIZE;
            
        const lifetime = isPowerPellet ? 
            PARTICLE.POWER_PELLET_PARTICLE_LIFETIME : 
            PARTICLE.PELLET_PARTICLE_LIFETIME;
            
        const baseSpeed = isPowerPellet ? 
            PARTICLE.POWER_PELLET_PARTICLE_SPEED : 
            PARTICLE.PELLET_PARTICLE_SPEED;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speedMultiplier = PARTICLE.SPEED_MIN_MULTIPLIER + Math.random() * PARTICLE.SPEED_VARIATION;
            const speed = baseSpeed * speedMultiplier;
            
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };

            let color: CSSColor = PARTICLE.REGULAR_PELLET_COLOR;
            if (isPowerPellet) {
                const hue = (i / count) * 360;
                color = `hsl(${hue}, ${PARTICLE.POWER_PELLET_SATURATION}%, ${PARTICLE.POWER_PELLET_LIGHTNESS}%)` as CSSColor;
            }

            const sizeMultiplier = PARTICLE.SIZE_START_MULTIPLIER + Math.random() * PARTICLE.SIZE_VARIATION;
            const alphaDelta = PARTICLE.ALPHA_DECAY_BASE + Math.random() * PARTICLE.ALPHA_DECAY_VARIATION;
            const radiusDelta = PARTICLE.RADIUS_DECAY_BASE + Math.random() * PARTICLE.RADIUS_DECAY_VARIATION;

            this.particles.push(new Particle({
                position: { ...position },
                velocity,
                color,
                radius: baseRadius * sizeMultiplier,
                lifetime,
                alphaDecay: alphaDelta,
                radiusDecay: radiusDelta
            }));
        }
    }

    public update(deltaTime: number): void {
        // Update and filter out dead particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return !particle.isDead();
        });
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw all active particles
        this.particles.forEach(particle => particle.draw(ctx));
    }
}
