import { KeyboardEvent, PointerEvent } from "react";
import { StatefulData } from "jsutil/react";
import { GameMap }  from "interfaces/GameMap"
import { Tile } from "interfaces/Tile";
import { View, IVector2 } from "jsutil/common"

export interface EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    ghostTilePositions: StatefulData<IVector2[]>
    lastHoveredCell: IVector2;
    currentHoveredCell: IVector2
    isPointerDown: boolean;
    selectedTile: Tile;
}

export abstract class EditMode {
    protected data: EditorData;

    constructor(data: EditorData) {
        this.data = data;
    }
    
    sendUpdatedEditorData(data: EditorData): EditMode {
        this.data = data;
        return this;
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