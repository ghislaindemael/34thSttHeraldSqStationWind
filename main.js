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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

setInterval(function() {
    station.cycle();
    //station.printRooms();

    saveStationData(station);
}, 1000);

setInterval(function() {
    console.log("5s passed");
    let test1 = station.findRoomName("TEST_1");
    if(test1.windStrength < 60){
        test1.windStrength = 95;
    }
}, 5000);


/*
setInterval(function() {
    station.refillTrains()
}, 900000);
*/
