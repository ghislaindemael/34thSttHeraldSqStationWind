import {angleDifference, distanceBetweenRooms, factorOfAngleDifference, findAngleBetweenPoints} from "./Utils.js";

export class Link {
    name;
    startPoint = null;
    endPoint = null;
    roomDistance = 0;
    factor = 1;
    direction = 0;
    windStrength = 0;
    windDirection = 0;

    constructor(startRoom, endRoom, factor) {
        this.startPoint = startRoom;
        this.endPoint = endRoom;
        this.factor = parseInt(factor) / 100;
        this.roomDistance = distanceBetweenRooms(startRoom, endRoom);
        this.direction = findAngleBetweenPoints(startRoom, endRoom);
        this.name = startRoom.name + "-->" + endRoom.name;
    }

    get name(){
        return this.name;
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

    setWindStrengthAndDirection() {

        let startWS = this.startPoint.windStrength;
        let startWD = this.startPoint.windDirection;
        let factor = factorOfAngleDifference(this.direction, startWD)
        //console.log(factor);
        startWS *= factor;
        this.windDirection = startWD;
        if(isNaN(this.windDirection)){
            console.log("Input winddir is nan");
        }
        this.windStrength = Math.round((1 - (this.roomDistance / 10000)) * startWS);


    }

}