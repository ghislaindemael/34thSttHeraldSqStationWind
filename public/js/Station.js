import { MeasurePoint } from "./MeasurePoint.js";
import { Link } from "./Link.js";
import fs from "fs";
import readline from "node:readline";
import path from "path";
import { minutesSinceMondayMidnight } from "./Utils.js";

export class Station {
    name = "34StHrldSq";
    measurePoints = []
    links = []
    //incomingTrains = []

    constructor() {
        //console.log("New Station");
        this.configure();
        //Post config

    };

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
                const params = line.split(' ');
                if (params.length === 5) {
                    const [name, level, xCoord, yCoord, direction] = params;
                    this.measurePoints.push(new MeasurePoint(name, level, xCoord, yCoord, direction));
                }

                /*
                if (params.length === 5) {
                    if(params[0].startsWith("TEST")) {
                        const [name, level, xCoord, yCoord, direction] = params;
                        this.measurePoints.push(new MeasurePoint(name, level, xCoord, yCoord, direction));
                    }
                }
                 */
            });

            rl.on('close', () => {
                resolve();
            });
        });
    }

    configurePassages() {
        return new Promise((resolve) => {
            const fileStream = fs.createReadStream(path.join(process.cwd(),'./public/stationData/configLinks.txt'));

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
            date.setHours(-6);
            let minutesSinceMM = minutesSinceMondayMidnight(date);

            const outputDir = path.join(process.cwd(), 'public', 'myTrainData');
            let promises = [];

            for (const lineDir of [ "BDFM_UP", "BDFM_DOWN", "NQRW_UP", "NQRW_DOWN"]) {
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
                        //this.refillTrains().then();
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

    addParameteredPassage(room1, room2, oneDir, factor){
        let pass1 = new Link(room1, room2, oneDir, factor);
        this.links.push(pass1);
        if(oneDir === "false"){
            let pass2 = new Link(room2, room1, oneDir, factor);
            this.links.push(pass2);
            room1.links.push(pass2);
        }
        room2.links.push(pass1);

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
        curDate.setHours(-6);
        let minutesSinceMM = minutesSinceMondayMidnight(curDate);

        this.measurePoints.forEach((point) => {
            if(point.incomingTrains.length > 1){
                if(parseInt(point.incomingTrains.at(0)) <= minutesSinceMM){
                    console.log("Incoming train to " + point.name);
                    point.windStrength = 99;
                    point.incomingTrains.shift();
                }
            }
        });

    }

    setPassageTempWind(){
        this.links.forEach((passage) => {
            //passage.setStrengthFromRoomWithFactor();
            passage.setWindStrengthAndDirection();
        });
    }

    decreaseWindStrength(number){
        this.measurePoints.forEach(room =>{
            room.windStrength -= number;
            if(room.windStrength < 1){
                room.windStrength = 1;
            }
        });
    }

    setRoomWindWithPassages(){
        this.measurePoints.forEach((room) => {
            room.updateWindFromPassages();
        });
    }

    clearPassages() {
        this.links.forEach((passage) => {
            passage.windStrength = 0;
        });
    }


}

