import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

const outputDir = path.join(process.cwd(), '..', 'myTrainData');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function timeStringToMinutes(timeString) {
    const fields = timeString.split(':');
    const hours = parseInt(fields[0], 10);
    const minutes = parseInt(fields[1], 10);
    return hours * 60 + minutes;
}

function processDepartureTimes(lineType, direction) {
    let departureTimes = [];

    for (const day of ['Weekday', 'Saturday', 'Sunday']) {
        const inputFile = path.join(outputDir, `${lineType}_${day}_${direction}.txt`);
        const readStream = fs.createReadStream(inputFile);
        const readInterface = createInterface({ input: readStream });

        readInterface.on('line', line => {
            const fields = line.split(',');
            const departureTime = timeStringToMinutes(fields[0]);
            const headsign = fields[1];

            if (day === 'Weekday') {
                for (let i = 0; i <= 4; i++) {
                    departureTimes.push(`${departureTime + 1440 * i}:${headsign}`);
                }
            } else if (day === 'Saturday') {
                departureTimes.push(`${departureTime + 1440 * 5}:${headsign}`);
            } else if (day === 'Sunday') {
                departureTimes.push(`${departureTime + 1440 * 6}:${headsign}`);
            }
        });

        readInterface.on('close', () => {
            departureTimes.sort((a, b) => a.split(':')[0] - b.split(':')[0]);
            fs.writeFileSync(path.join(outputDir, `${lineType}_${direction}_Times.txt`), departureTimes.join('\n'));
        });
    }
}

function processLineDepartureTimes(lineType){
    processDepartureTimes(lineType, "UP");
    processDepartureTimes(lineType, "DOWN");
}

processLineDepartureTimes('BDFM');
processLineDepartureTimes('NQRW');
