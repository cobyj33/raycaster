import { useRef, useEffect, RefObject } from "react";

type Action = () => void;

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