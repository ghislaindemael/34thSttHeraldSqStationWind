import { Room } from "./Room.js";
import { Passage } from "./Passage.js";
import {Tunnel} from "./Tunnel.js";


export class Station {
    name = "34StHrldSq";
    rooms = []
    passages = []
    incomingTrains = []

    constructor() {
        //console.log("New Station");
    };

    printRooms(){
        let rooms = "";
        this.rooms.forEach(room =>{
            if(room.type === "simple"){
                rooms = rooms + room.name + ": " + room.windStrength + ", ";
            }
            //console.log(room.name + " " + room.windStrength);
        });
        console.log("-------" + this.name + "-------");
        console.log(rooms);
        console.log("------------------------")
    }

    addRoom(){
        this.rooms.push(new Room("simple", "default"));
    }

    addParameteredRoom(name, level, xCoord, yCoord){
        this.rooms.push(new Room("simple", name, level, xCoord, yCoord));
    }

    addParameteredTunnel(name, level, xCoord, yCoord){
        this.rooms.push(new Tunnel(name, level, xCoord, yCoord));
    }

    findRoomName(name) {
        let toFind = null;
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].name.localeCompare(name) === 0) {
                toFind = this.rooms[i];
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
            this.rooms.forEach(room => {
                if(room.type === "tunnel"){
                    console.log("Incoming train to " + room.name);
                    room.windStrength = 69;
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
        this.rooms.forEach(room =>{
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
        this.rooms.forEach((room) => {
            room.updateWindFromPassages();
        });
    }

    clearPassages() {
        this.passages.forEach((passage) => {
            passage.windStrength = 0;
        });
    }
}

