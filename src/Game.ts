import { GAME_CONSTANTS } from './constants';
import { Maze } from './Maze';
import { Player } from './Player';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private maze: Maze;
    private player: Player;
    private score: number = 0;
    private scoreElement: HTMLElement;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        
        // Set canvas size
        this.canvas.width = GAME_CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = GAME_CONSTANTS.CANVAS_HEIGHT;
        
        // Initialize maze
        this.maze = new Maze();
        
        // Initialize player
        this.player = new Player(this.maze);
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private handleKeydown(e: KeyboardEvent): void {
        this.player.handleKeydown(e);
    }

    private gameLoop(timestamp: number) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas
        this.ctx.fillStyle = GAME_CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update game state
        this.update(deltaTime);

        // Draw game
        this.draw();

        // Schedule next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private update(deltaTime: number) {
        // Update player
        this.player.update();
        
        // Check for pellet collection
        const playerPos = this.player.getPosition();
        const pellet = this.maze.getPelletAt(playerPos.x, playerPos.y);
        if (pellet !== null) {
            this.maze.removePellet(playerPos.x, playerPos.y);
            this.score += pellet === 'power-pellet' ? 50 : 10;
            this.scoreElement.textContent = this.score.toString();
        }
    }

    private draw() {
        // Draw maze
        this.maze.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
    }

    // Helper method for collision detection
    public checkCollision(x: number, y: number): boolean {
        return this.maze.isWall(x, y);
    }
}
