import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Station } from './public/js/Station.js'

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//import("./public/js/downloadExtractData.js")

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

let station = new Station();
station.addNamedRoom("RoomA");
station.addNamedRoom("RoomB");
station.addPassageWithFactor("RoomA", "RoomB", 50);
station.addNamedRoom("RoomC");
station.addPassageWithFactor("RoomC", "RoomB", 15);
station.addNamedTunnel("TunnelToC");
station.addOneDirPassage("TunnelToC", "RoomC");
//station.findRoomName("RoomA").windStrength = 0;
//station.findRoomName("RoomC").windStrength = 0;
station.printRooms();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

setInterval(function() {
    station.cycle();
    station.printRooms();
}, 1000);