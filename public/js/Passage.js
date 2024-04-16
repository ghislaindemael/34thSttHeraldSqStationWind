

export class Passage {
    name;
    startPoint = null;
    endPoint = null;
    oneDir = "false";
    factor = 100;
    direction = 0;
    windStrength = 0;

    constructor(startRoom, endRoom, oneDir, factor, direction) {
        this.startPoint = startRoom;
        this.endPoint = endRoom;
        this.oneDir = oneDir;
        this.factor = factor;
        this.direction = direction;
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
        if(this.oneDir === "true"){
            this.windStrength = Math.round((this.factor / 100) * this.startPoint.windStrength);
        } else {
            let startStr = Math.round((this.factor / 100) * this.startPoint.windStrength);
            let endStr = Math.round((this.factor / 100) * this.endPoint.windStrength);
            let totalStr = startStr + endStr
            let avgStrength = ((startStr * startStr) / totalStr) + ((endStr * endStr) / totalStr);
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