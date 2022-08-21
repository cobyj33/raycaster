import { removeDuplicatesWithHasher } from "../../functions/utilityFunctions";
import { BoardJSON, MapSave } from "../../interfaces/MapSave";
import { Serializer } from "../../interfaces/Serializer";
import { Tile } from "../../interfaces/Tile";
import { GameMap } from "../GameMap";

export { }

// export class MapSaver implements Serializer<GameMap, MapSave> {
//     serialize(data: GameMap): MapSave {
//         const savedTiles = removeDuplicatesWithHasher(data.tiles.flatMap(row => row), { hash(toHash) { return toHash.name; } } ).map(tile => {

//         });

//         return {
//             board: {

//             },
//             savedTiles: savedTiles; 
//         }
//     }
//     deserialize(data: MapSave): GameMap {

//     }

// }
