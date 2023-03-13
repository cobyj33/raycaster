import { GameMap } from "libray/GameMap"

test("equal maps", () => {
    const firstMap: GameMap = GameMap.filledEdges("First Map", { width: 10, height: 10 })
    const secondMap: GameMap = GameMap.filledEdges("Second Map", { width: 10, height: 10 })
    expect(firstMap.equals(secondMap)).toBe(true);
})
