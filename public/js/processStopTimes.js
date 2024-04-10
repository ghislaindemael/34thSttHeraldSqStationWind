import fs from 'fs';
import path from 'path';
import {createInterface} from 'readline';

const outputDir = path.join(process.cwd(), '..', 'myTrainData');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function processStops(lineType) {
    const tripsFile = path.join(outputDir, `${lineType}Trips.txt`);

    const trips = [];

    const tripsReadStream = fs.createReadStream(tripsFile);

    const tripsReadInterface = createInterface({input: tripsReadStream});

    tripsReadInterface.on('line', line => {
        const fields = line.split(',');

        trips.push({tripId: fields[1], serviceId: fields[2], direction: fields[4], headsign: fields[3]});

    });

    tripsReadInterface.on('close', () => {

    });

    let weekdayLinesUP = [];
    let weekdayLinesDOWN = [];
    let saturdayLinesUP = [];
    let saturdayLinesDOWN = [];
    let sundayLinesUP = [];
    let sundayLinesDOWN = [];

    const stopsFile = path.join(outputDir, `${lineType}Stops.txt`);

    const stopsReadStream = fs.createReadStream(stopsFile);

    const stopsReadInterface = createInterface({input: stopsReadStream});

    stopsReadInterface.on('line', line => {
        const fields = line.split(',');

        const trip = trips.find(trip => trip.tripId === fields[0]);

        if (trip) {
            const {serviceId, direction, headsign} = trip;

            if (serviceId === 'Weekday') {
                if (direction === '0') {
                    weekdayLinesUP.push(`${fields[2]}, ${headsign}`);
                } else if (direction === '1') {
                    weekdayLinesDOWN.push(`${fields[2]}, ${headsign}`);
                }
            } else if (serviceId === 'Saturday') {
                if (direction === '0') {
                    saturdayLinesUP.push(`${fields[2]}, ${headsign}`);
                } else if (direction === '1') {
                    saturdayLinesDOWN.push(`${fields[2]}, ${headsign}`);
                }
            } else if (serviceId === 'Sunday') {
                if (direction === '0') {
                    sundayLinesUP.push(`${fields[2]}, ${headsign}`);
                } else if (direction === '1') {
                    sundayLinesDOWN.push(`${fields[2]}, ${headsign}`);
                }
            }
        } else {
            //console.warn(`No trip found for trip ID ${fields[0]}`);
        }
    });

    stopsReadInterface.on('close', () => {
        fs.writeFileSync(path.join(outputDir, `${lineType}_Weekday_UP.txt`), weekdayLinesUP.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Weekday_DOWN.txt`), weekdayLinesDOWN.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Saturday_UP.txt`), saturdayLinesUP.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Saturday_DOWN.txt`), saturdayLinesDOWN.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Sunday_UP.txt`), sundayLinesUP.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Sunday_DOWN.txt`), sundayLinesDOWN.join('\n'));
    });

}

processStops('BDFM');
processStops('NQRW');
