import fs from "fs";

function extractStationData(station) {

    function extractRoomData(measPoint) {
        return {
            type: measPoint.type,
            name: measPoint.name,
            level: measPoint.level,
            xCoord: measPoint.xCoord,
            yCoord: measPoint.yCoord,
            windDirection: measPoint.windDirection,
            windStrength: measPoint.windStrength,
        };
    }

    return {
        name: station.name,
        measurePoints: station.measurePoints.map(extractRoomData),
    };
}

function saveStationData(stationObject) {
    const stationDataFilePath = './public/stationData/stationData.json';
    const stationData = extractStationData(stationObject);
    const jsonData = JSON.stringify(stationData, null, 2);
    fs.writeFile(stationDataFilePath, jsonData, (err) => {
        if (err) {
            console.error('Error saving station data:', err);
        } else {
            console.log('Station data saved successfully');
        }
    });
}

export { saveStationData };