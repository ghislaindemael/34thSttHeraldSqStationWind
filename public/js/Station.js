import { MeasurePoint } from "./MeasurePoint.js";
import { Link } from "./Link.js";
import fs from "fs";
import readline from "node:readline";
import path from "path";
import {distanceBetweenRooms, minutesSinceMondayMidnight} from "./Utils.js";

export class Station {
    name = "34StHrldSq";
    mPoints = []
    links = []
    //incomingTrains = []

    constructor() {
        //console.log("New Station");
        this.configure();
        //Post config
    };

    configurePoints(){
        return new Promise((resolve, reject) => {
            const dataDir = path.join(process.cwd(), './public/stationData/');
            const promises = [];

            const processFile = (fileName) => {
                return new Promise((resolve, reject) => {
                    const fileStream = fs.createReadStream(dataDir + fileName);
                    const rl = readline.createInterface({
                        input: fileStream,
                        crlfDelay: Infinity
                    });
                    rl.on('line', (line) => {
                        const params = line.split(' ');
                        if (params.length === 5) {
                            const [name, level, xCoord, yCoord, direction] = params;
                            this.mPoints.push(new MeasurePoint(name, level, parseFloat(xCoord), parseFloat(yCoord), parseInt(direction)));
                        }
                    });
                    rl.on('close', resolve);
                    rl.on('error', reject);
                });
            };

            promises.push(processFile('configTunnels.txt'));
            for(const floor of [0, 1, 2, 3]) {
                promises.push(processFile(`FLOOR_${floor}_Points.txt`));
            }

            Promise.all(promises)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }


    configurePassages() {
        return new Promise((resolve, reject) => {

            for (let i = 0; i < this.mPoints.length; i++) {
                const room1 = this.mPoints[i];

                for (let j = 0; j < this.mPoints.length; j++) {
                    const room2 = this.mPoints[j];

                    if(room1.level === room2.level) {
                        let startIsTunnnel = (room1.name.startsWith("B") || room1.name.startsWith("N"));
                        let endIsTunnnel = (room2.name.startsWith("B") || room2.name.startsWith("N"));

                        if(!(startIsTunnnel || endIsTunnnel)){
                            const distance = distanceBetweenRooms(room1, room2);

                            if (distance < 2.2 && distance > 0) {
                                const link = new Link(room1, room2, 100);
                                this.links.push(link);
                                room2.links.push(link);
                            }
                        }
                    }


                }
            }

            const dataDir = path.join(process.cwd(), './public/stationData/');
            const fileStream = fs.createReadStream(dataDir + `configLinks.txt`);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            rl.on('line', (line) => {
                const params = line.split(' ');
                if (params.length === 3) {
                    const [room1, room2, factor] = params;
                    let startRoom = this.findRoomName(room1);
                    let endRoom = this.findRoomName(room2);
                    if(startRoom && endRoom){
                        let link = new Link(startRoom, endRoom, factor);
                        this.links.push(link);
                        endRoom.links.push(link);
                    }
                }
            });
            rl.on('close', resolve);
            rl.on('error', reject);
        });
    }

    refillTrains() {
        return new Promise((resolve, reject) => {
            let date = new Date();
            //date.setHours(-6);
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
                console.log("There are " + this.mPoints.length + " points configured.");
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


    findRoomName(name) {
        let toFind = null;
        for (let i = 0; i < this.mPoints.length; i++) {
            if (this.mPoints[i].name.localeCompare(name) === 0) {
                toFind = this.mPoints[i];
                break;
            }
        }
        return toFind;
    }

    //Wind Management

    cycle() {
        this.decreaseWindStrength(1);
        this.setTunnelWindStrength();
        this.setPassageTempWind();
        this.setRoomWindWithPassages();
        this.clearPassages();
    }

    setTunnelWindStrength() {
        let curDate = new Date();
        //curDate.setHours(-6);
        let minutesSinceMM = minutesSinceMondayMidnight(curDate);

        this.mPoints.forEach((point) => {
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
        this.mPoints.forEach(room =>{
            room.windStrength -= number;
            if(room.windStrength < 1){
                room.windStrength = 1;
            }
        });
    }

    setRoomWindWithPassages(){
        //console.log("Updating wind from passages.");
        this.mPoints.forEach((room) => {
            room.updateWindFromPassages();
        });
    }

    clearPassages() {
        this.links.forEach((passage) => {
            passage.windStrength = 0;
        });
    }

    generateRandomWind() {
        for(let i = 0; i < 10; i++){
            const randomIndex = Math.floor(Math.random() * this.mPoints.length);
            const randPoint = this.mPoints[randomIndex];
            randPoint.windStrength = Math.round(Math.random() * 100);
            randPoint.windDirection = Math.round(Math.random() * 360);
        }
    }

    timeUntilTrains(){
        console.log("Upcoming trains :")
        for(const line of ["BDFM", "NQRW"]){
            for(const dir of ["UP", "DOWN"]){
                for(const tun of ["1", "2"]){
                    let tunnel = this.findRoomName(line + "_" + dir + "_T" + tun);
                    if(tunnel){
                        let times = "" ;
                        for(let i = 0; i < 3; i++){
                            times += tunnel.incomingTrains[i] + " ";
                        }
                        console.log("-- " + line + "_" + dir + "_T" + tun + ": " + times);
                    }
                }
            }
        }
    }

    addWindToTunnels() {
        console.log("Adding wind to tunnels");
        for(const line of ["BDFM", "NQRW"]){
            for(const dir of ["UP", "DOWN"]){
                for(const tun of ["1", "2"]){
                    let tunnel = this.findRoomName(line + "_" + dir + "_T" + tun);
                    if(tunnel){
                        //console.log(line + "_" + dir + "_T" + tun);
                        tunnel.windStrength = 99;
                    }
                }
            }
        }
    }
}

