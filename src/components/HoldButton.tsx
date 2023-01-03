import { MutableRefObject, PointerEvent, useEffect, useRef, useState } from 'react'

type PointerEventCallback = (event?: PointerEvent<Element>) => void;
export const HoldButton = ({ onDown, whileDown, onUp, loopRefreshRate = 1000 / 30, children, className }: {onDown?: PointerEventCallback, whileDown?: PointerEventCallback, onUp?: PointerEventCallback, loopRefreshRate?: number, children?: any, className?: string,  }) => {
    const [buttonDown, setButtonDown] = useState<boolean>(false);
    const downEvent: MutableRefObject<PointerEvent<Element> | null> = useRef<PointerEvent<Element>>(null)

    const [startLoop, stopLoop] = useLoop(loopRefreshRate, () => {
        if (downEvent.current !== null) {
            whileDown?.(downEvent.current)
        }
    })

    useEffect(() => {
        if (buttonDown) {
            startLoop();
        } else {
            stopLoop();
        }
        return stopLoop;
    }, [buttonDown])

    const onPointerDown = (event: PointerEvent<Element>) => {
        setButtonDown(true);
        downEvent.current = event;
        onDown?.(event);
    }

    const onPointerUp = (event: PointerEvent<Element>) => {
        setButtonDown(false);
        downEvent.current = null;
        onUp?.(event);
    }

  return (
    <button onContextMenu={e => e.preventDefault()} className={className} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={() => setButtonDown(false)} > { children } </button>
  )
}

type Action = () => void;
function useLoop(refreshRate: number, action: Action) {
    const isStopped = useRef<boolean>(false);
    const loop = useRef<() => void>(() => {
        if (isStopped.current === false) {
            action()
            setTimeout(loop.current, refreshRate);
        }
    });

    const start = () => {isStopped.current = false; loop.current()};
    const stop = () => isStopped.current = true;
    useEffect(() => () => {stop()}, [])

    return [start, stop]
}