import { MeasurePoint } from "./MeasurePoint.js";
import { Passage } from "./Passage.js";
import {Tunnel} from "./Tunnel.js";
import fs from "fs";
import readline from "node:readline";


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
        const fileStream = fs.createReadStream('./public/stationData/configPoints');

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            const params = line.split(' '); // assuming parameters are separated by a space
            if (params.length === 5) {
                const [type, name, level, xCoord, yCoord] = params;
                this.addParameteredPoint(type, name, level, xCoord, yCoord);
            }
        });
    }

    configurePassages(){
        const fileStream = fs.createReadStream('./public/stationData/configPassages');

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
    }

    addParameteredPoint(type, name, level, xCoord, yCoord){
        this.measurePoints.push(new MeasurePoint(type, name, level, xCoord, yCoord));
    }

    addParameteredPassage(startRoom, endRoom, oneDir, factor, direction){
        let pass = new Passage(startRoom, endRoom, oneDir, factor, direction);
        this.passages.push(pass);
        if(oneDir === "false"){
            console.log("Pass " + pass + " is bidirectional");
            startRoom.passages.push(pass);
        }
        endRoom.passages.push(pass);

    }

    addParameteredRoom(name, level, xCoord, yCoord){
        this.measurePoints.push(new MeasurePoint("simple", name, level, xCoord, yCoord));
    }

    addParameteredTunnel(name, level, xCoord, yCoord){
        this.measurePoints.push(new Tunnel(name, level, xCoord, yCoord));
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

    addPassage(startRoom, endRoom){
        let room1 = this.findRoomName(startRoom);
        let room2 = this.findRoomName(endRoom);
        let passage = new Passage(room1, room2, 100, false);
        this.passages.push(passage);
        room1.addPassage(passage);
        room2.addPassage(passage);
    }

    addPassageWithFactor(startRoom, endRoom, factor){
        let room1 = this.findRoomName(startRoom);
        let room2 = this.findRoomName(endRoom);
        let passage = new Passage(room1, room2, factor, false);
        this.passages.push(passage);
        room1.addPassage(passage);
        room2.addPassage(passage);
    }

    addOneDirPassage(startRoom, endRoom){
        let room1 = this.findRoomName(startRoom);
        let room2 = this.findRoomName(endRoom);
        let passage = new Passage(room1, room2, 100, true);
        this.passages.push(passage);
        //room1.addPassage(passage);
        room2.addPassage(passage);
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
        let date = new Date();
        if((date.getSeconds() % 10) === 0){
            this.measurePoints.forEach(measPoint => {
                if(measPoint.type === "tunnel"){
                    console.log("Incoming train to " + measPoint.name);
                    measPoint.windStrength = 69;
                }
            });
        }
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

