import { IVector2, getLine } from "jsutil";
import { GameMap } from "libray/GameMap";
import { getDefaultTile } from "libray/Tile";
import { PointerEvent } from "react";
import { EditMode } from "libray/interaction/Editor/EditMode";
import { onPlacePointerDown, onPlacePointerMove } from "./DrawEditMode";

export class EraseEditMode extends EditMode {
    cursor() { return "url('https://img.icons8.com/material-rounded/24/00000/eraser.png'), crosshair" }

    onPointerDown(event: PointerEvent<Element>) {
        onPlacePointerDown(this.data, getDefaultTile("Empty Tile"))
    }

    onPointerMove(event: PointerEvent<Element>) {
        onPlacePointerMove(this.data, getDefaultTile("Empty Tile"))
    }
}
