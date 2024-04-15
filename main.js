import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Station } from './public/js/Station.js'
import { saveStationData } from './public/js/stationManagement.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//import("./public/js/downloadExtractData.js")

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

let station = new Station();
station.addParameteredRoom("RoomA", "0", 10, 10);
station.addParameteredRoom("RoomB", "0", 20, 20);
station.addPassageWithFactor("RoomA", "RoomB", 50);
station.addParameteredRoom("RoomC", "0", 30, 30);
station.addPassageWithFactor("RoomC", "RoomB", 15);
station.addParameteredTunnel("TunnelToC", "0", 40, 40);
station.addOneDirPassage("TunnelToC", "RoomC");
//station.findRoomName("RoomA").windStrength = 0;
//station.findRoomName("RoomC").windStrength = 0;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

setInterval(function() {
    station.cycle();
    station.printRooms();

    saveStationData(station);
}, 1000);