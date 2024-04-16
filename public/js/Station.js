import { MeasurePoint } from "./MeasurePoint.js";
import { Passage } from "./Passage.js";
import fs from "fs";
import readline from "node:readline";
import path from "path";
import {createInterface} from "readline";
import { minutesSinceMondayMidnight } from "./Utils.js";


export class Station {
    name = "34StHrldSq";
    measurePoints = []
    passages = []
    incomingTrains = []

    constructor() {
        //console.log("New Station");
    };

    printRooms(){
        let points = "";
        this.measurePoints.forEach(point =>{
            if(point.type === "simple"){
                points = points + point.name + ": " + point.windStrength + ", ";
            }
        });
        console.log("-------" + this.name + "-------");
        console.log(points);
        console.log("------------------------")
    }

    configurePoints(){
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(path.join(process.cwd(), './public/stationData/configPoints.txt'));

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                if (line.trim() === 'END') {
                    rl.close();
                    resolve();
                }
                const params = line.split(' '); // assuming parameters are separated by a space
                if (params.length === 5) {
                    const [type, name, level, xCoord, yCoord] = params;
                    this.measurePoints.push(new MeasurePoint(type, name, level, xCoord, yCoord));
                }
            });

            rl.on('close', () => {
                resolve();
            });
        });
    }

    configurePassages() {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(path.join(process.cwd(),'./public/stationData/configPassages.txt'));

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                const params = line.split(' '); // assuming parameters are separated by a space
                if (params.length === 5) {
                    const [startRoomName, endRoomName, oneDir, factor, direction] = params;

                    const startRoom = this.findRoomName(startRoomName);
                    const endRoom = this.findRoomName(endRoomName);

                    if (startRoom && endRoom) {
                        this.addParameteredPassage(startRoom, endRoom, oneDir, factor, direction);
                    }
                }
            });

            rl.on('close', () => {
                resolve();
            });
        });
    }

    refillTrains() {
        let date = new Date();
        let minutesSinceMM = minutesSinceMondayMidnight(date);
        minutesSinceMM -= 2700;

        const outputDir = path.join(process.cwd(), 'public', 'myTrainData');
        for (const line of ['BDFM', 'NQRW']){
            for (const dir of ['UP', 'DOWN']){
                const inputFile = path.join(outputDir, `${line}_${dir}_Times.txt`);
                const readStream = fs.createReadStream(inputFile);
                const readInterface = createInterface({ input: readStream });
                let index = 0;
                let tunnels = [];
                tunnels.push(this.findRoomName(line + ((dir === "UP" ? "_W" : "_E") + "1")));
                tunnels.push(this.findRoomName(line + ((dir === "UP" ? "_W" : "_E") + "2")));

                readInterface.on('line', line => {
                    const departureTime = parseInt(line.split(':')[0]);

                    if(departureTime > minutesSinceMM){
                        tunnels[index].incomingTrains.push(departureTime);
                        if(index === 0){
                            index++;
                        } else {
                            index = 0;
                        }
                    }

                });

            }
        }
    }

    configure() {
        this.configurePoints()
            .then(() => {
                console.log("Points configured.");
                this.configurePassages()
                    .then(() => {
                        console.log("Passages configured.");
                        console.log("No of rooms : " + this.measurePoints.length);
                        this.refillTrains();
                    })
                    .catch((error) => {
                        console.error("An error occurred during passage configuration:", error);
                    });
            })
            .catch((error) => {
                console.error("An error occurred during point configuration:", error);
            });
    }

    addParameteredPoint(type, name, level, xCoord, yCoord){}

    addParameteredPassage(startRoom, endRoom, oneDir, factor, direction){
        let pass = new Passage(startRoom, endRoom, oneDir, factor, direction);
        this.passages.push(pass);
        if(oneDir === "false"){
            console.log("Pass " + pass + " is bidirectional");
            startRoom.passages.push(pass);
        }
        endRoom.passages.push(pass);

    }

    findRoomName(name) {
        let toFind = null;
        for (let i = 0; i < this.measurePoints.length; i++) {
            if (this.measurePoints[i].name.localeCompare(name) === 0) {
                toFind = this.measurePoints[i];
                break;
            }
        }
        return toFind;
    }

    //Train management



    //Wind Management

    cycle() {
        this.setTunnelWindStrength();
        this.setPassageTempWind();
        this.decreaseWindStrength(1);
        this.setRoomWindWithPassages();
        this.clearPassages();
    }

    setTunnelWindStrength() {
        let curDate = new Date();
        let minutesSinceMM = minutesSinceMondayMidnight(curDate);

        this.measurePoints.forEach((point) => {
            if(point.type === "tunnel"){
                if(parseInt(point.incomingTrains.at(0)) <= minutesSinceMM){
                    console.log("Incoming train to " + point.name);
                    point.windStrength = 99;
                    point.incomingTrains.shift();
                }
            }
        });
        /*
        if((date.getSeconds() % 10) === 0){
            this.measurePoints.forEach(measPoint => {
                if(measPoint.type === "tunnel"){
                    console.log("Incoming train to " + measPoint.name);
                    measPoint.windStrength = 69;
                }
            });
        }
        */

    }

    setPassageTempWind(){
        this.passages.forEach((passage) => {
            passage.setStrengthFromRoomWithFactor();
        });
    }

    decreaseWindStrength(number){
        this.measurePoints.forEach(room =>{
            if(room.type === "tunnel"){
                room.windStrength = 0;
            } else {
                room.windStrength -= number;
                if(room.windStrength < 0){
                    room.windStrength = 0;
                }
            }
        });
    }

    setRoomWindWithPassages(){
        this.measurePoints.forEach((room) => {
            room.updateWindFromPassages();
        });
    }

    clearPassages() {
        this.passages.forEach((passage) => {
            passage.windStrength = 0;
        });
    }


}

