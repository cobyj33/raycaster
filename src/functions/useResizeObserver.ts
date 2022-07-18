import { useRef, useEffect } from "react";

type Action = () => void;

export function useResizeObserver( ...actions: Action[] ) {
    const observer = useRef(new ResizeObserver(() => { actions.forEach(action => action())} ));
    useEffect(() => {
        observer.current.disconnect()
        observer.current = new ResizeObserver(() => { actions.forEach(action => action())} )
        observer.current.observe(document.documentElement)
    })
}