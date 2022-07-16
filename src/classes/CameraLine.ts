import { RaycastHit } from "./RaycastHit";

export class CameraLine {
    readonly hit?: RaycastHit;
    readonly lineLengthPercentage: number;
    
    public constructor(lineLengthPercentage: number, hit?: RaycastHit) {
        this.lineLengthPercentage = lineLengthPercentage;
        if (hit != null) {
            this.hit = hit;
        }
    }

    static getEmpty(): CameraLine {
        return new CameraLine(0);
    }
}
