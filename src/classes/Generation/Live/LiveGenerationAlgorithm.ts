import { GameMap } from "../../GameMap"

export interface LiveGenerationAlgorithm {
	get name(): string;
    step(map: GameMap): GameMap;
}
