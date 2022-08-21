export interface TileJSON {
    name: string,
    color: [number, number, number, number],
    canHit: boolean;
    canCollide: boolean;
}

export interface BoardJSON {
    tiles: string[]; //names
    dimensions: [number, number];
}

export interface MapSave {
    board: BoardJSON;
    savedTiles: TileJSON[];
}