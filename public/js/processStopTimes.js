import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

const outputDir = path.join(process.cwd(), '..', 'myTrainData');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function processStops(lineType) {
    const tripsFile = path.join(outputDir, `${lineType}Trips.txt`);

    const trips = new Map();

    const tripsReadStream = fs.createReadStream(tripsFile);

    const tripsReadInterface = createInterface({ input: tripsReadStream });

    tripsReadInterface.on('line', line => {
        const fields = line.split(',');

        trips.set(fields[1], fields[2]);
    });

    let weekdayLines = [];
    let saturdayLines = [];
    let sundayLines = [];

    const stopsFile = path.join(outputDir, `${lineType}Stops.txt`);

    const stopsReadStream = fs.createReadStream(stopsFile);

    const stopsReadInterface = createInterface({ input: stopsReadStream });

    stopsReadInterface.on('line', line => {
        const fields = line.split(',');
        const serviceId = trips.get(fields[0]);

        if (serviceId === 'Weekday') {
            weekdayLines.push(fields[2]);
        } else if (serviceId === 'Saturday') {
            saturdayLines.push(fields[2]);
        } else if (serviceId === 'Sunday') {
            sundayLines.push(fields[2]);
        }
    });

    stopsReadInterface.on('close', () => {
        fs.writeFileSync(path.join(outputDir, `${lineType}_Weekday.txt`), weekdayLines.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Saturday.txt`), saturdayLines.join('\n'));
        fs.writeFileSync(path.join(outputDir, `${lineType}_Sunday.txt`), sundayLines.join('\n'));
    });
}

processStops('BDFM');
processStops('NQRW');
