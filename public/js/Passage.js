

export class Passage {
    name;
    startRoom = null;
    endRoom = null;
    oneDir = false;
    factor = 100;
    direction = 0;
    windStrength = 0;

    constructor(startRoom, endRoom, factor, oneDir) {
        this.startRoom = startRoom;
        this.endRoom = endRoom;
        this.factor = factor;
        this.oneDir = oneDir;
        this.name = startRoom.name + "->" + endRoom.name;
    }

    get windStrength() {
        return this.windStrength;
    }

    set windStrength(inStrength) {

    }

    set factor(factor) {
        this.factor = factor;
    }

    get oneDir(){
        return this.oneDir;
    }

    setStrengthFromRoomWithFactor(){
        let startStr = this.startRoom.windStrength;
        let endStr = this.endRoom.windStrength;
        let totalStr = startStr + endStr

        //console.log(this.name + ": " + startStr + ", " + endStr + ", " + totalStr);

        let avgStrength = ((startStr * startStr) / totalStr) + ((endStr * endStr) / totalStr);

        this.windStrength = Math.round((this.factor / 100) * avgStrength);

        //console.log(this.name + ": " + this.windStrength);

    }

}