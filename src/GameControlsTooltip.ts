import { GAME_CONSTANTS } from './constants';

/**
 * Manages the display of game controls information below the canvas
 */
export class GameControlsTooltip {
    private container!: HTMLDivElement;

    constructor() {
        this.createTooltip();
    }

    private createTooltip(): void {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'game-controls';
        this.container.style.color = 'white';
        this.container.style.fontSize = '14px';
        this.container.style.marginTop = '10px';
        this.container.style.textAlign = 'center';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.container.style.padding = '10px';
        this.container.style.borderRadius = '5px';
        this.container.style.width = `${GAME_CONSTANTS.CANVAS_WIDTH}px`;

        // Add control information
        const controlsText = document.createElement('p');
        controlsText.style.margin = '5px 0';
        controlsText.innerHTML = 'Controls: Arrow Keys or WASD to move | ENTER to pause';

        this.container.appendChild(controlsText);

        // Add to DOM after canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.insertBefore(this.container, canvas.nextSibling);
        }
    }
}
