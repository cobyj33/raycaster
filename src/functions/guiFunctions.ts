import { PointerEvent } from "react";
import { IVector2 } from "raycaster/interfaces";

export function pointerPositionInElement(element: Element, event: PointerEvent<Element>): IVector2 {
  const elementBounds: DOMRect = element.getBoundingClientRect();
  // return new IVector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
    return {
        row: Math.trunc(event.clientY - elementBounds.y),
        col: Math.trunc(event.clientX - elementBounds.x)
    }
    return { row: 0, col: 0  };
  }
