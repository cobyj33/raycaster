import { GameMap } from "raycaster/interfaces"

test("equal maps", () => {
    const firstMap: GameMap = GameMap.filledEdges("First Map", { row: 10, col: 10 })
    const secondMap: GameMap = GameMap.filledEdges("Second Map", { row: 10, col: 10 })
    expect(firstMap.equals(secondMap)).toBe(true);
})
