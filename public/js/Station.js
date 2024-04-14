import { Room } from "./Room.js";
import { Passage } from "./Passage.js";


export class Station {
    rooms = []
    passages = []
    incomingTrains = []

    constructor() {
        //console.log("New Station");
    };

    printRooms(){
        this.rooms.forEach(room =>{
            if(!room.name.startsWith("Tunnel")){
                console.log(room.name + " " + room.windStrength);
            }
        });
    }

    addRoom(){
        this.rooms.push(new Room("default"));
    }

    addNamedRoom(name){
        this.rooms.push(new Room(name));
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

    addTunnelWithFactor(startRoom, endRoom){
        let room1 = this.findRoomName(startRoom);
        let room2 = this.findRoomName(endRoom);
        let passage = new Passage(room1, room2, 100, true);
        this.passages.push(passage);
        room1.addPassage(passage);
        room2.addPassage(passage);
    }

    //Wind Management

    cycle() {
        this.setTunnelWindStrength();
        this.setPassageTempWind();
        this.decreaseWindStrength(1);
        this.setRoomWindWithPassages();
    }

    setTunnelWindStrength() {
        let date = new Date();
        if((date.getSeconds() % 5) === 0){
            console.log("Trains arrive");
            this.rooms.forEach(room => {
                if(room.name.startsWith("Tunnel")){
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
        for(let i = 0; i < this.rooms.length; i++){
            this.rooms[i].windStrength -= number;
            if(this.rooms[i].windStrength < 0){
                this.rooms[i].windStrength = 0;
            }
        }
        this.rooms.forEach(room =>{
            if(!room.name.startsWith("Tunnel")){
                room.windStrength -= number;
                if(room.windStrength < 0){
                    room.windStrength = 0;
                }
            } else {
                room.windStrength = 0;
            }
        });
    }

    setRoomWindWithPassages(){
        for(let i = 0; i < this.rooms.length; i++){
            this.rooms[i].updateWindFromPassages();
        }
    }

}

