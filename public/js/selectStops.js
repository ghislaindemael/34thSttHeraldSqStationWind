import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

const inputFile = path.join(process.cwd(), '..', 'trainData', 'stop_times.txt');
const outputDir = path.join(process.cwd(), '..', 'myTrainData');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const readStream = fs.createReadStream(inputFile);

const readInterface = createInterface({ input: readStream });

let BDFMLines = [];
let NQRWLines = [];

readInterface.on('line', line => {
    // Split the line into an array of fields
    const fields = line.split(',');

    if (fields[1] === 'D17N' || fields[1] === 'D17S') {
        BDFMLines.push(line);
    } else if (fields[1] === 'R17N' || fields[1] === 'R17S') {
        NQRWLines.push(line);
    }
});

readInterface.on('close', () => {
    fs.writeFileSync(path.join(outputDir, 'BDFMStops.txt'), BDFMLines.join('\n'));
    fs.writeFileSync(path.join(outputDir, 'NQRWStops.txt'), NQRWLines.join('\n'));
});
