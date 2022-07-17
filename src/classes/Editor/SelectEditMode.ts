import { EditMode } from "./EditMode";

export class SelectEditMode implements EditMode {
    constructor() { }
    
    onModeStart(): void {
        throw new Error("Method not implemented.");
    }
    onModeEnd(): void {
        throw new Error("Method not implemented.");
    }

}