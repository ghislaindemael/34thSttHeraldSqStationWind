import fs from "fs";

function extractStationData(station) {

    function extractRoomData(room) {
        return {
            type: room.type,
            name: room.name,
            level: room.level,
            xCoord: room.xCoord,
            yCoord: room.yCoord,
            windDirection: room.windDirection,
            windStrength: room.windStrength,
        };
    }

    return {
        name: station.name,
        rooms: station.rooms.map(extractRoomData),
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