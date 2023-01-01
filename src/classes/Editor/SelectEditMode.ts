import { EditMode } from "classes/Editor/EditMode";

export class SelectEditMode extends EditMode {
    cursor() { return "grab" }

    onModeStart(): void {
        throw new Error("Method not implemented.");
    }
    onModeEnd(): void {
        throw new Error("Method not implemented.");
    }

}