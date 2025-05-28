import { GAME_CONSTANTS } from './constants';

export class GameTimer {
    private startTime: number;
    private elapsedTime: number;
    private isRunning: boolean;
    private timerElement: HTMLElement;

    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        
        // Get the timer container element
        this.timerElement = document.getElementById('timer-container')!;
        this.setupTimerStyles();
    }

    private setupTimerStyles(): void {
        Object.assign(this.timerElement.style, {
            fontFamily: GAME_CONSTANTS.TIMER.FONT_FAMILY,
            fontSize: GAME_CONSTANTS.TIMER.FONT_SIZE,
            color: GAME_CONSTANTS.TIMER.TEXT_COLOR
        });
    }

    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now() - this.elapsedTime;
            this.update();
        }
    }

    public stop(): void {
        if (this.isRunning) {
            this.isRunning = false;
            this.elapsedTime = Date.now() - this.startTime;
        }
    }

    public reset(): void {
        this.elapsedTime = 0;
        this.startTime = Date.now();
        this.updateDisplay();
    }

    private update(): void {
        if (!this.isRunning) return;

        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
        
        setTimeout(() => this.update(), GAME_CONSTANTS.TIMER.UPDATE_INTERVAL);
    }

    private updateDisplay(): void {
        const seconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
