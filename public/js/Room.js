
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
        let totalWindInPassages = 0;
        for(let i = 0; i < this.passages.length; i++){
            totalWindInPassages += this.passages[i].windStrength;
        }
        let averageStrengthInPassages = 0;
        this.passages.forEach((passage) => {
            averageStrengthInPassages += ((passage.windStrength * passage.windStrength) / totalWindInPassages);
        });
        if(averageStrengthInPassages > this.windStrength) {
            this.windStrength = averageStrengthInPassages;
        }
    }

}