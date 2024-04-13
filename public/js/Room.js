
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
        for(let i = 0; i < this.passages.length; i++){
            if(this.passages[i].endRoom === this){
                console.log("This is an end room");
                this.windStrength += this.passages[i].windStrength;
            }
        }
    }
}