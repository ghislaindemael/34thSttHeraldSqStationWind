import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

const inputFile = path.join(process.cwd(), '..',  'trainData', 'trips.txt');
const outputDir = path.join(process.cwd(), '..', 'myTrainData');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const readStream = fs.createReadStream(inputFile);
const readInterface = createInterface({ input: readStream });

let BDFMLines = [];
let RNWQLines = [];

readInterface.on('line', line => {
    // Filter the lines based on the route_id
    if (line[0] === 'B' || line[0] === 'D' || line[0] === 'F' || line[0] === 'M') {
        BDFMLines.push(line);
    } else if (line[0] === 'R' || line[0] === 'N' || line[0] === 'W' || line[0] === 'Q') {
        RNWQLines.push(line);
    }
});
readInterface.on('close', () => {
    fs.writeFileSync(path.join(outputDir, 'BDFMTrips.txt'), BDFMLines.join('\n'));
    fs.writeFileSync(path.join(outputDir, 'NQRWTrips.txt'), RNWQLines.join('\n'));
});
