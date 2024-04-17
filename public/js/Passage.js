import {distanceBetweenRooms, findAngleBetweenPoints} from "./Utils.js";

export class Passage {
    name;
    startPoint = null;
    endPoint = null;
    oneDir = "false";
    roomDistance;
    factor = 100;
    direction = 0;
    windStrength = 0;

    constructor(startRoom, endRoom, oneDir, factor) {
        this.startPoint = startRoom;
        this.endPoint = endRoom;
        this.oneDir = oneDir;
        this.roomDistance = distanceBetweenRooms(startRoom, endRoom);
        this.factor = factor / 100;
        this.direction = findAngleBetweenPoints(startRoom, endRoom);
        if(oneDir === "true"){
            this.name = startRoom.name + "-->" + endRoom.name;
        } else {
            this.name = startRoom.name + "<->" + endRoom.name;
        }

    }

    get windStrength() {
        return this.windStrength;
    }

    set windStrength(inStrength) {
        this.windStrength = inStrength;
    }

    set factor(factor) {
        this.factor = factor;
    }

    get oneDir(){
        return this.oneDir;
    }

    setStrengthFromRoomWithFactor(){
        let distanceFactor = 1 - (this.roomDistance / 500);
        if(this.oneDir === "true"){
            this.windStrength = Math.round( distanceFactor * this.factor * this.startPoint.windStrength);
        } else {
            let startStr = this.startPoint.windStrength;
            let endStr = this.endPoint.windStrength;
            let totalStr = startStr + endStr
            let avgStrength = Math.round(((startStr * startStr) / totalStr) + ((endStr * endStr) / totalStr));
            avgStrength = Math.round(this.factor * distanceFactor * avgStrength);
            if(isNaN(avgStrength)){
                avgStrength = 0;
            }
            this.windStrength = Math.round(avgStrength);
        }
    }

    isStartRoomOf1DPassage(room){
        return this.oneDir && room === this.startPoint;
    }

}