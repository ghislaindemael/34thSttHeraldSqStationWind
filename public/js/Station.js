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

    constructor() {
        this.configure().then(this.timeUntilTrains());
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
                        if (params.length === 4) {
                            const [name, xCoord, yCoord, ceilingState] = params;
                            this.mPoints.push(new MeasurePoint(name, parseFloat(xCoord), parseFloat(yCoord), ceilingState));
                        } else if(params.length > 1) {
                            console.log("Error on line " + line);
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

            const floorThreshold = 2.5;
            const tunnelThreshold = 4;

            for (let i = 0; i < this.mPoints.length; i++) {
                const room1 = this.mPoints[i];

                for (let j = 0; j < this.mPoints.length; j++) {
                    const room2 = this.mPoints[j];
                    let distance = distanceBetweenRooms(room1, room2);


                    if(room1.level === room2.level) {
                        if(room1.name.includes("BD") || room1.name.includes("NQ")){
                            if (distance < tunnelThreshold && distance > 0) {
                                //console.log("Link between " + room1.name + " + " + room2.name);
                                const link = new Link(room1, room2, 100);
                                this.links.push(link);
                                room2.links.push(link);
                            }
                        } else if (distance < floorThreshold && distance > 0) {
                            const link = new Link(room1, room2, 100);
                            this.links.push(link);
                            room2.links.push(link);
                        }
                    } else {
                        const levelDif = room1.level - room2.level;
                        if ((room1.ceilingType === "OP1" && levelDif === 1) || (room1.ceilingType === "OP2" && levelDif === 2)) {
                            if (distance > 0 && distance < 2.5) {
                                const upLink = new Link(room1, room2, 100);
                                this.links.push(upLink);
                                room2.links.push(upLink);

                                const downLink = new Link(room2, room1, 100);
                                this.links.push(downLink);
                                room1.links.push(downLink);
                            }
                        }
                    }

                }
            }
            resolve();
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
                tunnels.push(this.findRoomByName("F" + (lineDir.charAt(0) === "B" ? "3_" : "2_") + lineDir + "_T1"));
                tunnels.push(this.findRoomByName("F" + (lineDir.charAt(0) === "B" ? "3_" : "2_") + lineDir + "_T2"));

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
                    resolve();
                })
                .catch((error) => {
                    console.error("An error occurred during train refill:", error);
                    reject(error);
                });
        });
    }


    configure() {
        return new Promise((resolve, reject) => {
            this.configurePoints()
                .then(() => this.setTunnelDirection())
                .then(() => this.configurePassages())
                .then(() => this.refillTrains())
                .then(() => {
                    console.log("Station configured.");
                    resolve();
                })
                .catch((error) => {
                    console.error("Error occurred on station config:", error);
                    reject(error);
                });
        });
    }


    findRoomByName(name) {
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
        this.setTunnelWindStrength();
        this.setPassageTempWind();
        this.decreaseWindStrength(1);
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
        for(let i = 0; i < 20; i++){
            const randomIndex = Math.floor(Math.random() * this.mPoints.length);
            const randPoint = this.mPoints[randomIndex];
            if(randPoint.level === 2){
                randPoint.windStrength = Math.round(Math.random() * 100);
                randPoint.windDirection = Math.round(Math.random() * 360);
            }

        }
    }

    timeUntilTrains(){
        console.log("Upcoming trains :")
        for(const line of ["F3_BDFM", "F2_NQRW"]){
            for(const dir of ["UP", "DOWN"]){
                for(const tun of ["1", "2"]){
                    let tunnel = this.findRoomByName(line + "_" + dir + "_T" + tun);
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
        for(const line of ["F3_BDFM", "F2_NQRW"]){
            for(const dir of ["UP", "DOWN"]){
                for(const tun of ["1", "2"]){
                    let tunnel = this.findRoomByName(line + "_" + dir + "_T" + tun);
                    if(tunnel){
                        //console.log(line + "_" + dir + "_T" + tun);
                        tunnel.windStrength = 99;
                    }
                }
            }
        }
    }

    setTunnelDirection() {
        return new Promise((resolve) => {
            this.findRoomByName("F3_BDFM_UP_T1").windDirection = 0;
            this.findRoomByName("F3_BDFM_UP_T2").windDirection = 0;
            this.findRoomByName("F3_BDFM_DOWN_T1").windDirection = 180;
            this.findRoomByName("F3_BDFM_DOWN_T2").windDirection = 180;
            this.findRoomByName("F2_NQRW_UP_T1").windDirection = 330;
            this.findRoomByName("F2_NQRW_UP_T2").windDirection = 330;
            this.findRoomByName("F2_NQRW_DOWN_T1").windDirection = 150;
            this.findRoomByName("F2_NQRW_DOWN_T2").windDirection = 150;
            resolve();
        });
    }
}

