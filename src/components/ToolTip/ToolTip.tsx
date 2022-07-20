import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import "./tooltip.css"

type Position = { left: string, top: string }
export const ToolTip = ({ children, expanded, target }: { children?: any, expanded?: any, target: RefObject<HTMLElement> }) => {
    const [opened, setOpened] = useState<boolean>(false);
    const [showExtra, setShowExtra] = useState<boolean>(false);
    const [position, setPosition] = useState<Position>({ left: "0", top: "0" })
    const toolTipReference = useRef<HTMLDivElement>(null);

    const openStatus = useRef<boolean>(opened);
    useEffect( () => { openStatus.current = opened }, [opened]);

    const getParent = useCallback(() => target ? target.current : toolTipReference?.current?.parentElement, []);
    const open = useCallback(() => setOpened(true), []);
    const close = useCallback(() => { setOpened(false); setShowExtra(false); }, [])
    const updatePosition = useCallback((event: PointerEvent) => setPosition({ left: `${event.clientX + 10}px`, top: `${event.clientY + 10}px` }), []);
    
    const displayExtra = useCallback((event: KeyboardEvent) => { 
        if (event.key === "Shift" && openStatus.current && !event.repeat) { 
            setShowExtra(true)
        }
    }, [])
    const hideExtra = useCallback(() => setShowExtra(false), []);


    useEffect( () => {
        const parent = getParent();
        if (parent !== null && parent !== undefined) {
            parent.addEventListener('pointerenter', open);
            parent.addEventListener('pointerleave', close);
            parent.addEventListener('pointercancel', close);
            parent.addEventListener('pointermove', updatePosition);
        }

        window.addEventListener('keydown', displayExtra);
        window.addEventListener('keyup', hideExtra);
        

        return () => {
            const parent = getParent();
            if (parent != null) {
                parent.removeEventListener('pointerenter', open);
                parent.removeEventListener('pointerleave', close);
                parent.removeEventListener('pointercancel', close);
                parent.removeEventListener('pointermove', updatePosition);
            };
            window.removeEventListener('keydown', displayExtra);
            window.removeEventListener('keyup', hideExtra);
        }
    }, [])


  return (
    <div className='tooltip' ref={toolTipReference} style={{...position, display: opened ? '' : 'none'}}>
        {children}
        { showExtra && 
        <div className='tooltip-extra'>
            {expanded}
        </div> }
    </div>
  )
}
