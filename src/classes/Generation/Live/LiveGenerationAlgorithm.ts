import { GameMap } from "raycaster/interfaces"

export interface LiveGenerationAlgorithm {
	get name(): string;
    step(map: GameMap): GameMap;
}
