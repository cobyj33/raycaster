import { initTiles } from "interfaces/Tile"

export async function initRaycaster(): Promise<void>  {
    await initTiles()
}
