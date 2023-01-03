import { RefObject, MutableRefObject, useEffect, useRef } from "react";
import { IEqualityComparer, StatefulData } from "raycaster/interfaces"
import { HistoryStack } from "raycaster/structures"

type EventAction = (event: Event) => void;
type Action = () => void;
type Check = () => boolean
export function useWindowEvent(event: string, callback: Action | EventAction, deps?: any[]) {
    const callbackRef = useRef<Action | EventAction>(callback);

    useEffect(() => {
        window.removeEventListener(event, callbackRef.current);
        callbackRef.current = callback;
        window.addEventListener(event, callbackRef.current);
        return () => window.removeEventListener(event, callbackRef.current);
    }, deps)
}

export function useTimedFlag(dependencies: any[] = [], checks: Check[] = [], timeInMS: number): MutableRefObject<boolean> {
    const flag: MutableRefObject<boolean> = useRef<boolean>(false);
    const lastSuccess: MutableRefObject<number> = useRef<number>(0)

    useEffect( () => {
        if (checks.some(check => check())) {
            lastSuccess.current = Date.now();
            flag.current = true;
        }

        setTimeout( () => {
            if (Date.now() - lastSuccess.current > timeInMS) {
                flag.current = false;
            }
        }, timeInMS);
    }, dependencies);

    return flag;
}

export function useResizeObserver(toObserve: RefObject<HTMLElement>, ...actions: Action[]) {
    const observer = useRef(new ResizeObserver(() => { actions.forEach(action => action())} ));
    useEffect(() => {
        if (toObserve.current !== null && toObserve.current !== undefined) {
            observer.current.disconnect()
            observer.current = new ResizeObserver(() => { actions.forEach(action => action())} )
            observer.current.observe(toObserve.current)
        }
    })
}


// export function useCanvasUpdater(canvasRef: RefObject<HTMLCanvasElement>) {
//     useEffect(() => {
//         function updateCanvasSize() {
//           const canvas: HTMLCanvasElement | null = canvasRef.current;
//           if (canvas !== null) {
//             const rect: DOMRect = canvas.getBoundingClientRect();
//             const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
//             if (context !== null) {
//               const data = context.getImageData(0, 0, canvas.width, canvas.height);
//               canvas.width = rect.width;
//               canvas.height = rect.height;
//               context.putImageData(data, 0, 0);
//             } else {
//               canvas.width = rect.width;
//               canvas.height = rect.height;
//             }
//           }
//         }
    
//         updateCanvasSize();
//         window.addEventListener('resize', updateCanvasSize);
//         return () => window.removeEventListener('resize', updateCanvasSize);
//       }, [])
// }

export function useHistory<T>(stateData: StatefulData<T>, comparer: IEqualityComparer<T>): [Action, Action] {
    const [state, setState] = stateData;
    const history= useRef<HistoryStack<T>>(new HistoryStack<T>());

    useEffect(() => {
        if (history.current.empty === false) {
          if (comparer(state, history.current.peek()) === false) {
            history.current.pushState(state);
          }
        } else {
            history.current.pushState(state);
        }
      }, [state])
    
      function undo() {
        if (history.current.canGoBack()) {
          history.current.back();
          setState(history.current.state);
        }
      }
    
      function redo() {
        if (history.current.canGoForward()) {
            history.current.forward();
          setState(history.current.state);
        }
      }

    return [undo, redo];
}

export function useCanvas2DUpdater(canvasRef: RefObject<HTMLCanvasElement>) {
    useEffect(() => {
        function updateCanvasSize() {
          const canvas: HTMLCanvasElement | null = canvasRef.current;
          if (canvas !== null) {
            const rect: DOMRect = canvas.getBoundingClientRect();
            const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
            if (context !== null) {
              const data = context.getImageData(0, 0, canvas.width, canvas.height);
              canvas.width = rect.width;
              canvas.height = rect.height;
              context.putImageData(data, 0, 0);
            } else {
              canvas.width = rect.width;
              canvas.height = rect.height;
            }
          }
        }
    
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
      }, [])
}

// export function useEditModes(modes: { [key: string]: EditMode }, data: MutableRefObject<() => EditorData>, editMode: string, canvasRef: RefObject<HTMLElement>): void {
//     const editorModes: MutableRefObject<{ [key: string]: EditMode }> = useRef(modes);

//     const onPointerDown = useCallback((event: PointerEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onPointerDown?.(event);
//     }, [])

//     const onPointerUp = useCallback((event: PointerEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onPointerUp?.(event);
//     }, [])

//     const onPointerMove = useCallback((event: PointerEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onPointerMove?.(event);
//     }, [])

//     const onPointerLeave = useCallback((event: PointerEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onPointerLeave?.(event);
//     }, [])

//     const onKeyDown = useCallback((event: KeyboardEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onKeyDown?.(event);
//     }, [])

//     const onKeyUp = useCallback((event: KeyboardEvent<Element>) => {
//         editorModes.current[editMode].setEditorData(data.current())
//         editorModes.current[editMode].onKeyUp?.(event);
//     }, [])

//     function unbindEvents() {
//         const canvas: HTMLCanvasElement | null = canvasRef.current;
//         if (canvas !== null) {
//             canvas.addEventListener('pointerdown', onPointerDown);
//             canvas.addEventListener('pointerup', onPointerUp);
//             canvas.addEventListener('pointerleave', onPointerLeave);
//         }
//     }

//     function bindEvents() {
//         const canvas: HTMLCanvasElement | null = canvasRef.current;
//         if (canvas !== null) {
//             canvas.addEventListener('pointerdown', setPointerTrue);
//             canvas.addEventListener('pointerup', setPointerFalse);
//             canvas.addEventListener('pointerleave', setPointerFalse);
//         }
//     }

//     useEffect( () => {
//         unbindEvents();
//         bindEvents();
//         return unbindEvents;
//     })
// }
