import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

export async function readPointsFromImages(){

    //const floors = [0, 1, 2, 3];
    const floors = [1];
    const lowBound = 2;
    const highBound = 98;
    const increment = 1.5;
    const radius = 17;

    for (const floor of floors) {
        const validCoordinates = await getValidMeasurePoint(floor, lowBound, highBound, increment, radius);

        const outputFilePath = path.join(
            fileURLToPath(import.meta.url),'..', '..','temp', `FLOOR_${floor}_Points.txt`
        );

        let WHP = '';
        let WTP = '';
        let MHP = '';
        let EHP = '';
        let ETP = '';
        let westhallPoints = 0;
        let westTunnelPoints = 0;
        let mainHallPoints = 0;
        let eastHallPoints = 0;
        let eastTunnelPoints = 0;

        validCoordinates.forEach(({ x, y }) => {

            x = (x / 51).toFixed(1);
            y = (y / 33).toFixed(1);

            if( x < 20 && y > 58){
                WHP += `WESTHALL_${westhallPoints} ${floor} ${x} ${y} 0\n`;
                westhallPoints += 1;
            } else if( x < 48 ){
                WTP += `WESTTUNNEL_${westTunnelPoints} ${floor} ${x} ${y} 0\n`;
                westTunnelPoints += 1;
            } else if( x < 70 ){
                MHP += `MAINHALL_${mainHallPoints} ${floor} ${x} ${y} 0\n`;
                mainHallPoints += 1;
            } else if( y > 44 ){
                EHP += `EASTHALL_${eastHallPoints} ${floor} ${x} ${y} 0\n`;
                eastHallPoints += 1;
            } else {
                ETP += `EASTTUNNEL_${eastTunnelPoints} ${floor} ${x} ${y} 0\n`;
                eastTunnelPoints += 1;
            }

        });

        fs.writeFileSync(outputFilePath, WHP + WTP + MHP + EHP + ETP);
    }
}

export async function getValidMeasurePoint(floor, lowBound, highBound, increment, radius) {
    const imagePath = path.join(fileURLToPath(import.meta.url), '..','..', '/images', `FLOOR_${floor}_BW.png`);
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, img.width, img.height);

    const validCoordinates = [];

    for (let xIncrement = lowBound; xIncrement <= highBound; xIncrement += increment) {
        let x = (xIncrement / 100) * img.width;

        for (let yIncrement = lowBound; yIncrement <= highBound; yIncrement += increment) {
            let y = (yIncrement / 100) * img.height;

            if (isWhitePixel(x, y, radius, img, ctx)) {
                x = Math.floor(x);
                y = Math.floor(y);
                validCoordinates.push({ x, y });
            }
        }
    }
    console.log("Valid points : " + validCoordinates.length);
    return validCoordinates;
}

export async function drawRedDotsOnImage(imagePath, lowBound, highBound, increment, radius) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, img.width, img.height);

    for (let xIncrement = lowBound; xIncrement <= highBound; xIncrement += increment) {
        const x = (xIncrement / 100) * img.width;

        for (let yIncrement = lowBound; yIncrement <= highBound; yIncrement += increment) {
            const y = (yIncrement / 100) * img.height;

            if (isWhitePixel(x, y, radius, img, ctx)) {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    const { base, ext } = path.parse(imagePath);
    const cleanedBase = base.replace(/\.[^/.]+$/, '');
    const outputPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        'images',
        `${cleanedBase}_DTD_${increment}%_${radius}pxB${ext}`
    );
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

function isWhitePixel(x, y, radius, img, ctx) {
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / (radius / 3)) {
        const i = Math.round(radius * Math.cos(angle));
        const j = Math.round(radius * Math.sin(angle));

        if (
            x + i >= 0 &&
            x + i < img.width &&
            y + j >= 0 &&
            y + j < img.height
        ) {
            const pixelData = ctx.getImageData(x + i, y + j, 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];

            if (r === 0 && g === 0 && b === 0) {
                return false;
            }
        }
    }

    for (let i = -radius - 1; i <= radius + 1; i++) {
        for (let j = -radius - 1; j <= radius + 1; j++) {
            if (
                Math.sqrt(i * i + j * j) <= radius - 1 &&
                x + i >= 0 &&
                x + i < img.width &&
                y + j >= 0 &&
                y + j < img.height
            ) {
                const pixelData = ctx.getImageData(x + i, y + j, 1, 1).data;
                const r = pixelData[0];
                const g = pixelData[1];
                const b = pixelData[2];

                if (r === 0 && g === 0 && b === 0) {
                    return false;
                }
            }
        }
    }

    return true;
}
