
export class Room {
    name = "default";
    windDirection = 0;
    windStrength = 0;
    passages = [];

    constructor(inName) {
        this.name = inName;
        console.log("Created " + inName + ".");
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
        let averageStrengthInPassages = 0;
        for(let i = 0; i < this.passages.length; i++){
            if(this.passages[i].endRoom === this){
                averageStrengthInPassages += this.passages[i].windStrength;
            }
        }
        if(this.passages.length > 0){
            averageStrengthInPassages /= this.passages.length;
        }
        if(averageStrengthInPassages > this.windStrength) {
            this.windStrength = averageStrengthInPassages;
        }
    }
}