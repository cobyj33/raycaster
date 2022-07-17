import { KeyboardEvent, PointerEvent } from "react";

export abstract class EditMode {
    abstract onPointerDown?(event: PointerEvent<Element>): void;
    abstract onPointerUp?(event: PointerEvent<Element>): void;
    abstract onPointerMove?(event: PointerEvent<Element>): void;
    abstract onPointerLeave?(event: PointerEvent<Element>): void;
    abstract onPointerEnter?(event: PointerEvent<Element>): void;

    abstract onKeyDown?(event: KeyboardEvent<Element>): void;
    abstract onKeyUp?(event: KeyboardEvent<Element>): void;

    abstract onModeStart(): void;
    abstract onModeEnd(): void;
}