import { Dimension } from "../classes/Data/Dimension"
import { GameMap } from "../classes/GameMap"

test("equal maps", () => {
    const firstMap = GameMap.filledEdges(new Dimension(10, 10));
    const secondMap = GameMap.filledEdges(new Dimension(10, 10));
    expect(firstMap.equals(secondMap)).toBe(true);
})