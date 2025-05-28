import { Player, PowerUpType } from './Player';

/**
 * Manages the power-up information display in the game UI
 */
export class PowerUpInfoManager {
    private powerUpInfoElement: HTMLElement;
    private player: Player;

    constructor(player: Player) {
        this.player = player;
        this.powerUpInfoElement = document.getElementById('powerup-info') || this.createPowerUpInfoElement();
    }

    /**
     * Creates a power-up info element to display active power-up
     */
    private createPowerUpInfoElement(): HTMLElement {
        const gameInfo = document.getElementById('game-info')!;
        const powerUpInfo = document.createElement('div');
        powerUpInfo.id = 'powerup-info';
        powerUpInfo.style.marginLeft = '20px';
        powerUpInfo.style.display = 'inline';
        gameInfo.appendChild(powerUpInfo);
        return powerUpInfo;
    }

    /**
     * Updates the power-up info display
     */
    public update(): void {
        const powerUp = this.player.getActivePowerUp();
        let displayText = '';
        
        if (powerUp !== PowerUpType.NONE) {
            const timeRemaining = Math.ceil(this.player.getPowerUpTimeRemaining() / 1000);
            
            if (powerUp === PowerUpType.SPEED_BOOST) {
                displayText = `Speed Boost: ${timeRemaining}s`;
                this.powerUpInfoElement.style.color = '#00ffff'; // Cyan
            } else if (powerUp === PowerUpType.INVISIBILITY) {
                displayText = `Invisibility: ${timeRemaining}s`;
                this.powerUpInfoElement.style.color = '#aaaaff'; // Light blue
            }
        }
        
        this.powerUpInfoElement.textContent = displayText;
    }
}
