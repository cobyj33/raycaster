import { PointerEvent } from "react";
import { Vector2 } from "raycaster/interfaces";

export function pointerPositionInElement(element: Element, event: PointerEvent<Element>): Vector2 {
  const elementBounds: DOMRect = element.getBoundingClientRect();
  // return new Vector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
    return {
        row: Math.trunc(event.clientY - elementBounds.y),
        col: Math.trunc(event.clientX - elementBounds.x)
    }
    return { row: 0, col: 0  };
  }
