
import { RefObject, MutableRefObject, useEffect, useRef } from "react";

type EventAction = (event: Event) => void;
type Action = () => void;
type Check = () => boolean
export function useWindowEvent(event: string, callback: EventAction) {
    const callbackRef = useRef<EventAction>(callback);

    useEffect(() => {
        window.addEventListener(event, callbackRef.current);
        return () => window.removeEventListener(event, callbackRef.current);
    }, [])
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


export function useCanvasUpdater(canvasRef: RefObject<HTMLCanvasElement>) {
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
