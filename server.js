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
//readPointsFromImages().then();

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
    //console.log(station.mPoints.length);
    //console.log(station.links.length);
    saveStationData(station);
}, 1000);

setInterval(function (){
    //station.timeUntilTrains();
    //station.addWindToTunnels();
}, 30000);


setInterval(function () {
    //station.addWindToTunnels();
    station.generateRandomWind();
}, 15000);





