

export class Passage {

    startRoom = null;
    endRoom = null;
    factor = 50;
    direction = 0;
    windStrength = 0;


    constructor(startRoom, endRoom, factor) {
        this.startRoom = startRoom;
        this.endRoom = endRoom;
        this.factor = factor;
    }

    get windStrength() {
        return this.windStrength;
    }

    set windStrength(inStrength) {

    }

    set factor(factor) {
        this.factor = factor;
    }

    setWindStrengthFromStartRoom(){
        this.windStrength = this.startRoom.windStrength;
    }

    setStrengthFromRoomWithFactor(){
        this.windStrength = Math.round(this.startRoom.windStrength * (this.factor / 100));
    }

}