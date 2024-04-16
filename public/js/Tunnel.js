import { MeasurePoint } from "./MeasurePoint.js";


export class Tunnel extends MeasurePoint {
    name = "default"
    incomingTrains = []

    constructor(inName, inLevel, inXCoord, inYCoord) {
        super("tunnel", inName, inLevel, inXCoord, inYCoord);
        this.name = inName;
    }

}