import { Room } from "./Room.js";
import {Passage} from "./Passage.js";
import endRoom from "express/lib/view.js";

export class Station {
    rooms = []
    passages = []

    constructor() {
        console.log("New Station");
    };

    addRoom(){
        this.rooms.push(new Room("default"));
    }

    addRoomWithName(name){
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
        let passage = new Passage(room1, room2);
        this.passages.push(passage);
        room1.addPassage(passage);
        room2.addPassage(passage);
    }

    setPassageTempWind(){
        for(let i = 0; i < this.passages.length; i++){
            this.passages[i].setWindStrengthFromStartRoom();
        }
    }

    setRoomWindWithPassages(){
        for(let i = 0; i < this.rooms.length; i++){
            this.rooms[i].updateWindFromPassages();
        }
    }




}

