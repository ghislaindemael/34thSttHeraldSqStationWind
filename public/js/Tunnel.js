import { Room } from "./Room.js";


export class Tunnel extends Room {
    name = "default"
    incomingTrains = []

    constructor(inName, inLevel, inXCoord, inYCoord) {
        super("tunnel", inName, inLevel, inXCoord, inYCoord);
        this.name = inName;
    }

}