# Enemy System Refactoring

This refactoring separates rendering, AI, and spawn logic for the enemy system in the Pac-Man game.

## Architecture Changes

### 1. Interfaces and Types
Created a dedicated `types.ts` file with core interfaces:
- `Position` and `GridPosition` for coordinates
- `Positionable`, `Renderable`, and `Updateable` interfaces for entities
- `EnemyAI` interface for different behavior strategies
- `MazeInterface` to abstract maze functionality
- Other helper types and enums

### 2. Pathfinding Service
Extracted pathfinding logic to a dedicated service class:
- `PathfindingService` handles path calculations using A* algorithm
- Provides utility methods to convert between pixel and grid coordinates
- Reduces code duplication in enemy implementations

### 3. Enemy AI Strategies
Extracted AI logic to a set of strategy classes:
- `DirectChaserAI` for direct player pursuit
- `InterceptorAI` for predicting player movement
- `PatrolAI` for patrolling between corners
- `RandomMovementAI` for unpredictable movement
- Factory pattern used to create appropriate AI for each enemy

### 4. Enemy Rendering
Extracted rendering logic to a dedicated class:
- `EnemyRendererService` handles drawing ghosts with different colors
- Separates visual representation from behavior logic

### 5. Enemy Factory
Added a factory class for enemy creation:
- `EnemyFactory` handles spawning enemies at valid positions
- Creates enemies with different behaviors based on their color
- Ensures enemies don't spawn on walls or too close to the player

### 6. Constants Refactoring
Moved all magic numbers to constants:
- Enemy speeds, sizes, and visual properties
- Pathfinding parameters
- Collision detection values

## Benefits
1. **Single Responsibility Principle**: Each class has one clear purpose
2. **Open/Closed Principle**: Can add new enemy types without modifying existing code
3. **Dependency Inversion**: High-level modules depend on abstractions
4. **Improved Testability**: Components can be tested in isolation
5. **Easier Maintenance**: Changes to one aspect don't affect others
6. **Code Reuse**: Common functionality shared between implementations

## New File Structure
- `types.ts` - Core interfaces and types
- `PathfindingService.ts` - A* pathfinding implementation
- `EnemyAI.ts` - AI strategy implementations
- `EnemyRenderer.ts` - Visual rendering logic
- `EnemyFactory.ts` - Enemy creation and spawn logic
- `EnemyNew.ts` - Refactored Enemy class that uses the components
- `GameNew.ts` - Refactored Game class that uses the new Enemy
- `indexNew.ts` - Entry point using the new Game

To complete the transition, rename the "New" files to replace the originals.
