import { Position } from './types';

/**
 * Shape types for different colliders
 */
export enum ColliderShape {
    CIRCLE,
    RECTANGLE
}

/**
 * Base class for all colliders
 */
export abstract class Collider {
    protected position: Position;
    protected offset: Position = { x: 0, y: 0 };
    
    constructor(position: Position, offset?: Position) {
        this.position = position;
        if (offset) {
            this.offset = offset;
        }
    }
    
    /**
     * Updates the position of the collider
     * @param position - New position
     */
    public updatePosition(position: Position): void {
        this.position = position;
    }
    
    /**
     * Gets the current position of the collider
     */
    public getPosition(): Position {
        return {
            x: this.position.x + this.offset.x,
            y: this.position.y + this.offset.y
        };
    }
    
    /**
     * Sets the offset from the parent object's position
     * @param offset - Position offset
     */
    public setOffset(offset: Position): void {
        this.offset = offset;
    }
    
    /**
     * Checks if this collider intersects with another collider
     * @param other - Another collider to check against
     */
    public abstract intersects(other: Collider): boolean;
    
    /**
     * Gets the shape type of this collider
     */
    public abstract getShape(): ColliderShape;
    
    /**
     * Draws the collider for debugging purposes
     * @param ctx - Canvas rendering context
     * @param color - Color to use for drawing
     */
    public abstract drawDebug(ctx: CanvasRenderingContext2D, color?: string): void;
}

/**
 * Circle-shaped collider
 */
export class CircleCollider extends Collider {
    private radius: number;
    
    constructor(position: Position, radius: number, offset?: Position) {
        super(position, offset);
        this.radius = radius;
    }
    
    /**
     * Gets the radius of the circle
     */
    public getRadius(): number {
        return this.radius;
    }
    
    /**
     * Sets the radius of the circle
     * @param radius - New radius
     */
    public setRadius(radius: number): void {
        this.radius = radius;
    }
    
    /**
     * Checks if this circle collider intersects with another collider
     * @param other - Another collider to check against
     */
    public intersects(other: Collider): boolean {
        if (other.getShape() === ColliderShape.CIRCLE) {
            const circleOther = other as CircleCollider;
            const p1 = this.getPosition();
            const p2 = other.getPosition();
            const distance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) + 
                Math.pow(p1.y - p2.y, 2)
            );
            return distance < this.radius + circleOther.getRadius();
        } else if (other.getShape() === ColliderShape.RECTANGLE) {
            const rectOther = other as RectangleCollider;
            return rectOther.intersects(this);
        }
        return false;
    }
    
    public getShape(): ColliderShape {
        return ColliderShape.CIRCLE;
    }
    
    public drawDebug(ctx: CanvasRenderingContext2D, color: string = 'rgba(0, 255, 0, 0.5)'): void {
        const pos = this.getPosition();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Rectangle-shaped collider
 */
export class RectangleCollider extends Collider {
    private width: number;
    private height: number;
    
    constructor(position: Position, width: number, height: number, offset?: Position) {
        super(position, offset);
        this.width = width;
        this.height = height;
    }
    
    /**
     * Gets the width of the rectangle
     */
    public getWidth(): number {
        return this.width;
    }
    
    /**
     * Gets the height of the rectangle
     */
    public getHeight(): number {
        return this.height;
    }
    
    /**
     * Checks if this rectangle collider intersects with another collider
     * @param other - Another collider to check against
     */
    public intersects(other: Collider): boolean {
        if (other.getShape() === ColliderShape.RECTANGLE) {
            const rectOther = other as RectangleCollider;
            const p1 = this.getPosition();
            const p2 = other.getPosition();
            
            // Calculate the bounds of both rectangles
            const left1 = p1.x - this.width/2;
            const right1 = p1.x + this.width/2;
            const top1 = p1.y - this.height/2;
            const bottom1 = p1.y + this.height/2;
            
            const left2 = p2.x - rectOther.getWidth()/2;
            const right2 = p2.x + rectOther.getWidth()/2;
            const top2 = p2.y - rectOther.getHeight()/2;
            const bottom2 = p2.y + rectOther.getHeight()/2;
            
            // Check for intersection
            return !(
                left1 > right2 ||
                right1 < left2 ||
                top1 > bottom2 ||
                bottom1 < top2
            );
        } else if (other.getShape() === ColliderShape.CIRCLE) {
            const circleOther = other as CircleCollider;
            const rectPos = this.getPosition();
            const circlePos = circleOther.getPosition();
            const radius = circleOther.getRadius();
            
            // Find the closest point on the rectangle to the circle's center
            const closestX = Math.max(
                rectPos.x - this.width/2,
                Math.min(circlePos.x, rectPos.x + this.width/2)
            );
            const closestY = Math.max(
                rectPos.y - this.height/2,
                Math.min(circlePos.y, rectPos.y + this.height/2)
            );
            
            // Calculate the distance from the closest point to the circle's center
            const distanceX = circlePos.x - closestX;
            const distanceY = circlePos.y - closestY;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            
            // Check if the distance is less than the circle's radius squared
            return distanceSquared < radius * radius;
        }
        return false;
    }
    
    public getShape(): ColliderShape {
        return ColliderShape.RECTANGLE;
    }
    
    public drawDebug(ctx: CanvasRenderingContext2D, color: string = 'rgba(0, 255, 0, 0.5)'): void {
        const pos = this.getPosition();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.strokeRect(
            pos.x - this.width/2,
            pos.y - this.height/2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}
