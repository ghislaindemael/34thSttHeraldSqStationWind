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

function processDepartureTimes(lineType) {
    let departureTimes = [];

    for (const day of ['Weekday', 'Saturday', 'Sunday']) {
        const inputFile = path.join(outputDir, `${lineType}_${day}.txt`);
        const readStream = fs.createReadStream(inputFile);
        const readInterface = createInterface({ input: readStream });

        readInterface.on('line', line => {
            const departureTime = timeStringToMinutes(line);

            if (day === 'Weekday') {
                for (let i = 0; i <= 4; i++) {
                    departureTimes.push(departureTime + 1440 * i);
                }
            } else if (day === 'Saturday') {
                departureTimes.push(departureTime + 1440 * 5);
            } else if (day === 'Sunday') {
                departureTimes.push(departureTime + 1440 * 6);
            }
        });

        readInterface.on('close', () => {
            departureTimes.sort((a, b) => a - b);
            fs.writeFileSync(path.join(outputDir, `${lineType}_DepartureTimes.txt`), departureTimes.join('\n'));
        });
    }
}

processDepartureTimes('BDFM');
processDepartureTimes('NQRW');
