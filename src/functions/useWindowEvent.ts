import { useEffect, useRef } from "react";

type Action = (event: Event) => void;
export function useWindowEvent(event: string, callback: Action) {
    const callbackRef = useRef<Action>(callback);

    useEffect(() => {
        window.addEventListener(event, callbackRef.current);
        return () => window.removeEventListener(event, callbackRef.current);
    }, [])
}