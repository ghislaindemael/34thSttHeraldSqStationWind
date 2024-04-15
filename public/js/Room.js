export class Room {
    type = "simple";
    name = "default";
    windDirection = 0;
    windStrength = 0;
    passages = [];

    constructor(inType, inName) {
        this.type = inType;
        this.name = inName;
        //console.log("Created " + inName + ".");
    }

    get type(){
        return this.type;
    }

    set type(inType) {
        this.type = inType;
    }

    get name(){
        return this.name;
    }

    get windStrength(){
        return this.windStrength;
    }

    set windStrength(inStrength){
        this.windStrength = inStrength;
    }

    addPassage(passage){
        this.passages.push(passage);
    }

    updateWindFromPassages(){
        let totalWindInPassages = 0;
        this.passages.forEach(passage => {
            totalWindInPassages += passage.windStrength;
        });
        let avgPassStr = 0;
        if(totalWindInPassages > 0){
            this.passages.forEach((passage) => {
                avgPassStr += ((passage.windStrength * passage.windStrength) / totalWindInPassages);
            });
        }

        let ws = this.windStrength;
        let newWS = Math.round(((ws*ws)/(ws + avgPassStr)) + ((avgPassStr*avgPassStr)/(ws + avgPassStr)));
        if(isNaN(newWS)){
            newWS = 0;
        }
        this.windStrength = newWS;
    }

}