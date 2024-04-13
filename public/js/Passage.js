

export class Passage {

    startRoom;
    endRoom;
    direction = 0;
    windStrength = 0;
    factor = 0;

    constructor(startRoom, endRoom) {
        this.startRoom = startRoom;
        this.endRoom = endRoom;
    }

    get windStrength() {
        return this.windStrength;
    }

    set windStrength(inStrength) {

    }

    setWindStrengthFromStartRoom(){
        this.windStrength = this.startRoom.windStrength;
    }

}