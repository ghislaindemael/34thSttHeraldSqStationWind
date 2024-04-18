import {angleDifference, distanceBetweenRooms, factorOfAngleDifference, findAngleBetweenPoints} from "./Utils.js";

export class Passage {
    name;
    startPoint = null;
    endPoint = null;
    oneDir = false;
    roomDistance = 0;
    factor = 0;
    direction = 0;
    windStrength = 0;
    windDirection = 0;

    constructor(startRoom, endRoom, oneDir, factor) {
        this.startPoint = startRoom;
        this.endPoint = endRoom;
        this.oneDir = (oneDir === "true");
        this.roomDistance = distanceBetweenRooms(startRoom, endRoom);
        this.factor = factor / 100;
        this.direction = findAngleBetweenPoints(startRoom, endRoom);
        if (this.oneDir) {
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

    get oneDir() {
        return this.oneDir;
    }

    setWindStrengthAndDirection() {

        if (this.oneDir) {
            let startWS = this.startPoint.windStrength;
            let startWD = this.startPoint.windDirection;
            startWS *= factorOfAngleDifference(this.direction, startWD);
            this.windDirection = this.direction;
            this.windStrength = Math.round((1 - (this.roomDistance / 500)) * startWS);
            console.log("New WS:");
        } else if(){
            console.log(this.name);
            let startWS = this.startPoint.windStrength;
            let startWD = this.startPoint.windDirection;
            let startFactor = factorOfAngleDifference(this.direction, startWD);
            startWS *= startFactor;
            console.log("Startfactor: " + startFactor);
            let endWS = this.endPoint.windStrength;
            let endWD = this.endPoint.windDirection;
            let endFactor = factorOfAngleDifference(this.direction, endWD);
            endWS *= endFactor;
            console.log("Endfactor: " + endFactor);
            let totalWS = startWS + endWS;
            let startWSFactor = startWS / totalWS;
            if(isNaN(startWSFactor)){
                startWSFactor = 0;
            }
            let endWSFactor = endWS / totalWS;
            if(isNaN(endWSFactor)){
                endWSFactor = 0;
            }
            //console.log(this.name + " sws " + startWS + " ews " + endWS);
            let newWS = (startWS * startWSFactor) + (endWS * endWSFactor);
            let newWD = (startWD * startWSFactor) + (endWD * endWSFactor);
            console.log("New WS: " + newWS);
            console.log("New WD: " + newWD);
            this.windStrength = newWS;
            this.windDirection = newWD;
        }

    }

    setStrengthFromRoomWithFactor() {
        let distanceFactor = 1 - (this.roomDistance / 100);
        if (this.oneDir === "true") {
            this.windStrength = Math.round(distanceFactor * this.factor * this.startPoint.windStrength);
        } else {
            let startStr = this.startPoint.windStrength;
            let endStr = this.endPoint.windStrength;
            let totalStr = startStr + endStr
            let avgStrength = Math.round(((startStr * startStr) / totalStr) + ((endStr * endStr) / totalStr));
            avgStrength = Math.round(this.factor * distanceFactor * avgStrength);
            if (isNaN(avgStrength)) {
                avgStrength = 0;
            }
            this.windStrength = Math.round(avgStrength);
        }
    }

    isStartRoomOf1DPassage(room) {
        return this.oneDir && room === this.startPoint;
    }

}