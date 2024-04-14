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

var station = new Station();
station.addNamedRoom("RoomA");
station.addNamedRoom("RoomB");
station.addPassageWithFactor("RoomA", "RoomB", 100, false);
station.addNamedRoom("RoomC");
//station.addPassageWithFactor("RoomC", "RoomB", 75);
station.addNamedRoom("TunnelToC");
station.addPassage("TunnelToC", "RoomC");
station.findRoomName("RoomA").windStrength = 0;
station.findRoomName("RoomC").windStrength = 0;
station.printRooms();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

setInterval(function() {
    station.cycle();
    station.printRooms();
}, 1000);