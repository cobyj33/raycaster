import { MutableRefObject, useRef, useState } from "react";
import { EditMode } from "./Editor/EditMode";
import { MoveEditMode } from "./Editor/MoveEditMode";

// export enum EditorEditMode {
//     MOVE,
//     ZOOM
// }

// export function useEditModes(requestedEditModes: {[key in EditorEditMode]?: EditMode}): [EditMode] {
//     const editModes: MutableRefObject<{[key in EditorEditMode]?: EditMode}> = useRef<{[key in EditorEditMode]?: EditMode}>({...requestedEditModes});
//     // return 
//     const [editMode, setEditMode] = useState<EditMode>(editModes.current[EditorEditMode.MOVE]);


//     return [editMode];
// }