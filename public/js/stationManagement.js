import fs from "fs";

function extractStationData(station) {

    function extractRoomData(measPoint) {
        return {
            name: measPoint.name,
            //level: measPoint.level,
            //xCoord: measPoint.xCoord,
            //yCoord: measPoint.yCoord,
            xRelCoord: measPoint.xRelCoord,
            yRelCoord: measPoint.yRelCoord,
            windDirection: measPoint.windDirection,
            windStrength: measPoint.windStrength,
            ceilingType: measPoint.ceilingType,
            //numLinks: measPoint.links.length,
        };
    }

    function extractLinkData(link) {
        return {
            name: link.name,
            //xRelCoord: link.startPoint.xRelCoord,
            //yRelCoord: link.startPoint.yRelCoord,
            distance: link.roomDistance,
            factor: link.factor,
            direction: link.direction,

        };
    }

    return {
        name: station.name,
        mPoints: station.mPoints.map(extractRoomData),
        //links: station.links.map(extractLinkData),
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
            //console.log('Station data saved successfully');
        }
    });
}

export { saveStationData };