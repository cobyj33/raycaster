import { Tile } from "../../interfaces/Tile";
import { Dimension } from "../Data/Dimension";
import { GameMap } from "../GameMap";
import { EmptyTile } from "../Tiles/EmptyTile";
import { WallTile } from "../Tiles/WallTile";

export interface GenerationAlgorithm {
	get name(): string;
    generateMap(dimensions: Dimension): GameMap;
}
