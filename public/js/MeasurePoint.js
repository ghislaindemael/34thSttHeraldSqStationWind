export class MeasurePoint {
    name = "default";
    level = "0";
    xCoord = 0;
    yCoord = 0;
    windDirection = 0;
    windStrength = 0;
    links = [];
    incomingTrains = []

    constructor(inName, inLevel, inXCoord, inYCoord, direction) {
        this.name = inName;
        this.level = inLevel;
        this.xCoord = Math.round((inXCoord * 51) / 20.4);
        this.yCoord = Math.round((inYCoord * 33) / 20.4);
        this.windDirection = direction;
        //console.log("Created " + inName + ".");
    }

    get name(){
        return this.name;
    }

    get level(){
        return this.level;
    }

    get xCoord(){
        return this.xCoord;
    }

    get yCoord(){
        return this.yCoord;
    }

    get windStrength(){
        return this.windStrength;
    }

    set windStrength(inStrength){
        this.windStrength = inStrength;
    }

    addPassage(passage){
        this.links.push(passage);
    }

    updateWindFromPassages(){
        let incomingWind = this.windStrength;
        this.links.forEach(passage => {
            incomingWind += passage.windStrength;
        });
        let avgWindStrength = this.windStrength * (this.windStrength / incomingWind);
        let avgWindDir = this.windDirection * (this.windStrength / incomingWind);
        this.links.forEach((passage) => {
            avgWindStrength += ((passage.windStrength * passage.windStrength) / incomingWind);
            avgWindDir += (passage.direction * (passage.windStrength / incomingWind));
        });

        this.windStrength = Math.round(avgWindStrength);
        this.windDirection = Math.round(avgWindDir);

    }

}