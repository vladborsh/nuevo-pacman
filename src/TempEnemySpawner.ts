import { Enemy } from './Enemy';
import { EnemyFactory } from './EnemyFactory';
import { SpawnCountdownManager } from './SpawnCountdownManager';
import { ParticleSystem } from './Particle';
import { GAME_CONSTANTS } from './constants';

export class TempEnemySpawner {
    private lastTempEnemySpawn: number = 0;

    constructor(
        private spawnCountdownManager: SpawnCountdownManager,
        private enemyFactory: EnemyFactory,
        private particleSystem: ParticleSystem,
        private getEnemies: () => Enemy[]
    ) {}

    update(deltaTime: number): void {
        // Update countdown and spawn temporary enemies
        const countdownActive = this.spawnCountdownManager.update(deltaTime);
        
        // Only update spawn timer when countdown is not active
        if (!countdownActive) {
            this.lastTempEnemySpawn += deltaTime;
            // Check if it's time to spawn a new enemy and no countdown is running
            if (this.lastTempEnemySpawn >= GAME_CONSTANTS.TEMP_ENEMY.SPAWN_INTERVAL) {
                // Start the countdown and reset the timer
                this.lastTempEnemySpawn = 0;
                this.spawnCountdownManager.startCountdown(() => {
                    // 50% chance to spawn two enemies
                    const spawnCount = Math.random() < 0.5 ? 2 : 1;
                    
                    const enemies = this.getEnemies();
                    console.log(`Total enemies before spawn: ${enemies.length}`);
                    
                    for (let i = 0; i < spawnCount; i++) {
                        const tempEnemy = this.enemyFactory.createTemporaryChaser(GAME_CONSTANTS.TEMP_ENEMY.LIFESPAN);
                        enemies.push(tempEnemy);
                        // Create a spawn particle effect
                        const pos = tempEnemy.getPosition();
                        this.particleSystem.createDeathExplosion(pos);
                    }
                    console.log(`Spawned ${spawnCount} temporary enemy(ies)`);
                    console.log(`Total enemies after spawn: ${enemies.length}`);
                });
            }
        }
    }
}
