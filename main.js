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
station.addRoomWithName("RoomA");
station.addRoomWithName("RoomB");
station.addPassage("RoomA", "RoomB");
station.findRoomName("RoomA").windStrength = 80;
console.log(station.rooms);
station.setPassageTempWind();
console.log(station.passages);
station.setRoomWindWithPassages();
console.log(station.rooms);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});