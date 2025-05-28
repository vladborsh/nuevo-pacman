import { Position, Direction } from './types';
import { GAME_CONSTANTS } from './constants';
import { Player } from './Player';
import { CollisionSystem } from './CollisionSystem';
import { Collider } from './Collider';

/**
 * Handles rendering of debug information and colliders
 */
export class DebugRenderer {
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private collisionSystem: CollisionSystem;

    constructor(ctx: CanvasRenderingContext2D, player: Player, collisionSystem: CollisionSystem) {
        this.ctx = ctx;
        this.player = player;
        this.collisionSystem = collisionSystem;
    }

    /**
     * Draws debug information overlay
     */
    public drawDebugInfo(): void {
        const playerPos = this.player.getPosition();
        const playerCollider = this.player.getCollider();
        const playerSpeed = this.player.getSpeed();
        
        const canMoveRight = this.collisionSystem.canMove(playerCollider, Direction.RIGHT, playerSpeed);
        const canMoveLeft = this.collisionSystem.canMove(playerCollider, Direction.LEFT, playerSpeed);
        const canMoveUp = this.collisionSystem.canMove(playerCollider, Direction.UP, playerSpeed);
        const canMoveDown = this.collisionSystem.canMove(playerCollider, Direction.DOWN, playerSpeed);

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 250, 100);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Position: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`, 15, 25);
        this.ctx.fillText(`Cell: (${Math.floor(playerPos.x / GAME_CONSTANTS.CELL_SIZE)}, ${Math.floor(playerPos.y / GAME_CONSTANTS.CELL_SIZE)})`, 15, 45);
        this.ctx.fillText(`Can move: R:${canMoveRight ? 'Y' : 'N'} L:${canMoveLeft ? 'Y' : 'N'} U:${canMoveUp ? 'Y' : 'N'} D:${canMoveDown ? 'Y' : 'N'}`, 15, 65);
        this.ctx.fillText('Toggle debug mode: Ctrl+D / Cmd+D', 15, 85);
        this.ctx.restore();
    }

    /**
     * Draws colliders for debugging purposes
     */
    public drawColliders(enemies: Array<{ getCollider(): Collider }>): void {
        // Draw player collider
        const playerCollider = this.player.getCollider();
        playerCollider.drawDebug(this.ctx, 'rgba(255, 255, 0, 0.5)');
        
        // Draw enemy colliders
        for (const enemy of enemies) {
            const enemyCollider = enemy.getCollider();
            enemyCollider.drawDebug(this.ctx, 'rgba(255, 0, 0, 0.5)');
        }
    }
}
