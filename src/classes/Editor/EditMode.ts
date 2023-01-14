import { KeyboardEvent, PointerEvent } from "react";
import { StatefulData } from "interfaces/util";
import { GameMap }  from "interfaces/GameMap"
import { IVector2 } from "interfaces/Vector2";
import { Tile } from "interfaces/Tile";
import { View } from "interfaces/View"

export interface EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    lastHoveredCell: IVector2;
    isPointerDown: boolean;
    getHoveredCell: (event: PointerEvent<Element>) => IVector2;
    selectedTile: Tile;
    ghostTilePositions: StatefulData<IVector2[]>
}

export abstract class EditMode {
    protected data: EditorData;

    constructor(data: EditorData) {
        this.data = data;
    }
    
    setEditorData(data: EditorData) {
        this.data = data;
    }

    onPointerDown?(event: PointerEvent<Element>): void;
    onPointerUp?(event: PointerEvent<Element>): void;
    onPointerMove?(event: PointerEvent<Element>): void;
    onPointerLeave?(event: PointerEvent<Element>): void;
    onPointerEnter?(event: PointerEvent<Element>): void;

    onKeyDown?(event: KeyboardEvent<Element>): void;
    onKeyUp?(event: KeyboardEvent<Element>): void;

    // abstract onModeStart(): void;
    // abstract onModeEnd(): void;
    abstract cursor(): string;
}