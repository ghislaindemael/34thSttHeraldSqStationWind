import { Room } from "./Room.js";


export class Tunnel extends Room {
    name = "default"
    incomingTrains = []

    constructor(inName) {
        super("tunnel", inName);
        this.name = inName;
    }

}