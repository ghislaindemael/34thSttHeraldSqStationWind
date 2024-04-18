import { MeasurePoint } from "./MeasurePoint.js";
import { Link } from "./Link.js";
import fs from "fs";
import readline from "node:readline";
import path from "path";
import {distanceBetweenRooms, minutesSinceMondayMidnight} from "./Utils.js";

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
            const dataDir = path.join(process.cwd(), './public/stationData/');

            for(const floor of [1]) {

                const fileStream = fs.createReadStream(dataDir + `FLOOR_${floor}_Points.txt`);

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
                        this.measurePoints.push(new MeasurePoint(name, level, parseFloat(xCoord), parseFloat(yCoord), direction));
                    }
                });

                rl.on('close', () => {
                    resolve();
                });
            }
        });
    }

    configurePassages() {
        return new Promise((resolve) => {
            for (let i = 0; i < this.measurePoints.length; i++) {
                const measurePoint1 = this.measurePoints[i];
                for (let j = i + 1; j < this.measurePoints.length; j++) {
                    const measurePoint2 = this.measurePoints[j];

                    if (measurePoint2.xRelCoord - measurePoint1.xRelCoord > 3) {
                        break;
                    }

                    const distance = distanceBetweenRooms(measurePoint1, measurePoint2);

                    if (distance < 2.3) {
                        const link1 = new Link(measurePoint1, measurePoint2);
                        this.links.push(link1);
                        measurePoint2.links.push(link1);
                        const link2 = new Link(measurePoint2, measurePoint1);
                        this.links.push(link2);
                        measurePoint1.links.push(link2);
                    }
                }
            }
            resolve();
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


    generateRandomWind(rooms) {
        for(let i = 0; i < rooms; i++){
            const randomIndex = Math.floor(Math.random() * this.measurePoints.length);
            const randPoint = this.measurePoints[randomIndex];
            randPoint.windStrength = Math.round(Math.random() * 100);
            randPoint.windDirection = Math.round(Math.random() * 360);
        }
    }
}

