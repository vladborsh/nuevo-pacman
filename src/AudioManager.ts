import { GAME_CONSTANTS } from './constants';

/**
 * Manages all game audio using Web Audio API
 */
export class AudioManager {
    private static instance: AudioManager;
    private audioContext: AudioContext;
    private sounds: Map<string, OscillatorNode>;
    private gainNodes: Map<string, GainNode>;

    private constructor() {
        this.audioContext = new AudioContext();
        this.sounds = new Map();
        this.gainNodes = new Map();
        this.initializeSounds();
    }

    /**
     * Initialize all game sound effects
     */
    private initializeSounds(): void {
        // Initialize all sounds from constants
        Object.entries(GAME_CONSTANTS.AUDIO.SOUNDS).forEach(([name, config]) => {
            this.createSound(name, config.FREQUENCY, config.TYPE, config.GAIN, config.DURATION);
        });
    }

    /**
     * Creates a sound with specified parameters
     */
    private createSound(name: string, frequency: number, type: OscillatorType, gain: number, duration: number): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + GAME_CONSTANTS.AUDIO.GAIN_RAMP_TIME);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.sounds.set(name, oscillator);
        this.gainNodes.set(name, gainNode);
    }

    /**
     * Play a sound effect
     */
    public playSound(name: string): void {
        const oscillator = this.sounds.get(name);
        const gainNode = this.gainNodes.get(name);

        if (oscillator && gainNode) {
            const newOscillator = this.audioContext.createOscillator();
            newOscillator.type = oscillator.type;
            newOscillator.frequency.value = oscillator.frequency.value;
            
            const newGain = this.audioContext.createGain();
            newGain.gain.value = gainNode.gain.value;
            
            newOscillator.connect(newGain);
            newGain.connect(this.audioContext.destination);
            
            newOscillator.start();
            newOscillator.stop(this.audioContext.currentTime + GAME_CONSTANTS.AUDIO.STOP_DELAY);
        }
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Resume audio context (needed after user interaction)
     */
    public resume(): void {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
