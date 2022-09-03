import { GameMap, getDefaultTile, getEmptyMap, getFilledMapEdges, areGameMapsEqual} from "raycaster/interfaces"

test("equal maps", () => {
    const firstMap: GameMap = getFilledMapEdges(getEmptyMap({row: 10, col: 10}), getDefaultTile("Wall Tile"))
    const secondMap: GameMap = getFilledMapEdges(getEmptyMap({row: 10, col: 10}), getDefaultTile("Wall Tile"))
    expect(areGameMapsEqual(firstMap, secondMap)).toBe(true);
})
