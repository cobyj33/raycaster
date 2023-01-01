export {  }
// import { getTileMap } from "../functions/matrixFunctions";
// import { Tile } from "../interfaces/Tile";
// import { GameMap } from "GameMap";
// import { EmptyTile } from "Tiles/EmptyTile";
// import { WallTile } from "Tiles/WallTile";
// import { conwayGetNextGeneration } from "../Conway";
// import { LiveGenerationAlgorithm } from "./LiveGenerationAlgorithm"

// export class ConwayLive implements LiveGenerationAlgorithm
// {
// 	get name(): string { return "Conway Live" } 
//     constructor() { }

//     step(map: GameMap): GameMap {
//         const mapToNums: number[][] = map.tiles.map(row => row.map(tile => {
//             if (tile instanceof EmptyTile) {
//                 return 0;
//             } else {
//                 return 1;
//             }
//         } ));

//         const nextNumGeneration = conwayGetNextGeneration(mapToNums);
//         return GameMap.tiled( nextNumGeneration.map( row => row.map( num => {
//             switch (num) {
//                 case 0: return new EmptyTile();
//                 case 1: return new WallTile();
//                 default: return new EmptyTile();
//             }
//         })) );
//     }
    
// }
