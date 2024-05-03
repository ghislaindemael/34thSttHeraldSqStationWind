export class MeasurePoint {
    name = "default";
    level = 0;
    xCoord = 0;
    yCoord = 0;
    xRelCoord = 0;
    yRelCoord = 0;
    windDirection = 0;
    windStrength = 0;
    links = [];
    ceilingType = "CL";
    incomingTrains = []

    constructor(inName, inXCoord, inYCoord, openCeiling) {
        this.name = inName;
        this.level = parseInt(inName.charAt(1));
        this.xCoord = Math.round((inXCoord * 51) / 20.4);
        this.yCoord = Math.round((inYCoord * 33) / 20.4);
        this.xRelCoord = inXCoord;
        this.yRelCoord = inYCoord;
        this.ceilingType = openCeiling;
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

    set windDirection(inWindDir){
        this.windDirection = inWindDir;
    }

    addPassage(passage){
        this.links.push(passage);
    }

    updateWindFromPassages(){
        if(this.links.length > 0){
            let incomingWind = this.windStrength;
            this.links.forEach(passage => {
                incomingWind += passage.windStrength;
            });
            let avgWindStrength = (this.windStrength * this.windStrength) / incomingWind;
            let avgWindDir = this.windDirection * (this.windStrength / incomingWind);
            this.links.forEach((passage) => {
                avgWindStrength += ((passage.windStrength * passage.windStrength) / incomingWind);
                avgWindDir += (passage.windDirection * (passage.windStrength / incomingWind));
            });

            if(isNaN(avgWindDir)){
                console.log(this.name + " error : windDir is null");
            }

            this.windStrength = Math.round(avgWindStrength);
            this.windDirection = Math.round(avgWindDir);
        }


    }

}