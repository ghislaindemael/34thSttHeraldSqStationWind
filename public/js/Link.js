import { distanceBetweenRooms, factorOfAngleDifference, findAngleBetweenPoints } from "./Utils.js";

export class Link {
    name;
    startPoint = null;
    endPoint = null;
    roomDistance = 0;
    factor = 1;
    direction = 0;
    windStrength = 0;
    windDirection = 0;
    levelDiff = 0;

    constructor(inStartPoint, inEndPoint, inFactor) {
        this.startPoint = inStartPoint;
        this.endPoint = inEndPoint;
        this.factor = parseInt(inFactor) / 100;
        this.roomDistance = distanceBetweenRooms(inStartPoint, inEndPoint);
        this.direction = findAngleBetweenPoints(inStartPoint, inEndPoint);
        this.name = inStartPoint.name + "-->" + inEndPoint.name;
        this.levelDiff = Math.abs(inStartPoint.level - inEndPoint.level);
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
        this.windDirection = startWD;
        this.windStrength = Math.round((1 - (this.roomDistance / 200)) * startWS * factor);
        this.windStrength = Math.round(this.windStrength * (1 - (0.2 * this.levelDiff)));

    }

}