import { MeasurePoint } from "./MeasurePoint.js";
import { Passage } from "./Passage.js";
import fs from "fs";
import readline from "node:readline";
import path from "path";
import { minutesSinceMondayMidnight } from "./Utils.js";


export class Station {
    name = "34StHrldSq";
    measurePoints = []
    passages = []
    //incomingTrains = []

    constructor() {
        //console.log("New Station");
        this.configure();
        //Post config
    };

    printRooms(){
        let points = "";
        this.measurePoints.forEach(point =>{
            if(point.type === "S"){
                points = points + point.name + ": " + point.windStrength + ", ";
            }
        });
        console.log("-------" + this.name + "-------");
        console.log(points);
        console.log("------------------------")
    }

    configurePoints(){
        return new Promise((resolve) => {
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
        return new Promise((resolve) => {
            const fileStream = fs.createReadStream(path.join(process.cwd(),'./public/stationData/configPassages.txt'));

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                const params = line.split(' '); // assuming parameters are separated by a space
                if (params.length === 4) {
                    const [startRoomName, endRoomName, oneDir, factor] = params;

                    const startRoom = this.findRoomName(startRoomName);
                    const endRoom = this.findRoomName(endRoomName);

                    if (startRoom && endRoom) {
                        this.addParameteredPassage(startRoom, endRoom, oneDir, factor);
                    }
                }
            });

            rl.on('close', () => {
                resolve();
            });
        });
    }

    refillTrains() {
        return new Promise((resolve, reject) => {
            let date = new Date();
            let minutesSinceMM = minutesSinceMondayMidnight(date);

            const outputDir = path.join(process.cwd(), 'public', 'myTrainData');
            let promises = [];

            const lineDirs = [ "BDFM_UP", "BDFM_DOWN", "NQRW_UP", "NQRW_DOWN"];

            for (const lineDir of lineDirs) {
                const inputFile = path.join(outputDir, `${lineDir}_Times.txt`);
                const readStream = fs.createReadStream(inputFile);
                const readInterface = readline.createInterface({ input: readStream });
                let index = 0;
                let tunnels = [];
                tunnels.push(this.findRoomName(lineDir + "_T1"));
                tunnels.push(this.findRoomName(lineDir + "_T2"));

                const promise = new Promise((resolve, reject) => {
                    readInterface.on('line', line => {
                        const departureTime = parseInt(line.split(':')[0]);
                        if (departureTime > minutesSinceMM) {
                            tunnels[index].incomingTrains.push(departureTime);
                            if (index === 0) {
                                index++;
                            } else {
                                index = 0;
                            }
                        }
                    });

                    readInterface.on('close', () => {
                        resolve();
                    });

                    readInterface.on('error', (error) => {
                        reject(error);
                    });
                });

                promises.push(promise);
            }

            Promise.all(promises)
                .then(() => {
                    console.log("Trains refilled.");
                    resolve();
                })
                .catch((error) => {
                    console.error("An error occurred during train refill:", error);
                    reject(error);
                });
        });
    }


    configure() {
        this.configurePoints()
            .then(() => {
                console.log("Points configured.");
                this.configurePassages()
                    .then(() => {
                        console.log("Passages configured.");
                        this.refillTrains().then();
                    })
                    .catch((error) => {
                        console.error("An error occurred during passage configuration:", error);
                    });
            })
            .catch((error) => {
                console.error("An error occurred during point configuration:", error);
            });
    }

    addParameteredPoint(type, name, level, xCoord, yCoord){

    }

    addParameteredPassage(startRoom, endRoom, oneDir, factor){
        let pass = new Passage(startRoom, endRoom, oneDir, factor);
        this.passages.push(pass);
        if(oneDir === "false"){
            //console.log("Pass " + pass + " is bidirectional");
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

    //Wind Management

    cycle() {
        this.decreaseWindStrength(2);
        this.setTunnelWindStrength();
        this.setPassageTempWind();
        this.setRoomWindWithPassages();
        this.clearPassages();
    }

    setTunnelWindStrength() {
        let curDate = new Date();
        let minutesSinceMM = minutesSinceMondayMidnight(curDate);

        this.measurePoints.forEach((point) => {
            if(point.type === "T"){
                if(parseInt(point.incomingTrains.at(0)) <= minutesSinceMM){
                    console.log("Incoming train to " + point.name);
                    point.windStrength = 99;
                    point.incomingTrains.shift();
                }
            }
        });

    }

    setPassageTempWind(){
        this.passages.forEach((passage) => {
            passage.setStrengthFromRoomWithFactor();
        });
    }

    decreaseWindStrength(number){
        this.measurePoints.forEach(room =>{
            if(room.type === "T"){
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

