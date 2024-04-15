

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
        this.windStrength = inStrength;
    }

    set factor(factor) {
        this.factor = factor;
    }

    get oneDir(){
        return this.oneDir;
    }

    setStrengthFromRoomWithFactor(){
        if(this.oneDir){
            this.windStrength = Math.round((this.factor / 100) * this.startRoom.windStrength);
        } else {
            let startStr = Math.round((this.factor / 100) * this.startRoom.windStrength);
            let endStr = Math.round((this.factor / 100) * this.endRoom.windStrength);
            let totalStr = startStr + endStr
            let avgStrength = ((startStr * startStr) / totalStr) + ((endStr * endStr) / totalStr);
            if(isNaN(avgStrength)){
                avgStrength = 0;
            }
            this.windStrength = Math.round(avgStrength);
        }
    }

    isStartRoomOf1DPassage(room){
        return this.oneDir && room === this.startRoom;
    }

}