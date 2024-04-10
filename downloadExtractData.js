import axios from 'axios';
import admZip from 'adm-zip';
import fs from 'fs';

console.log("Downloading the Data");

const url = 'http://web.mta.info/developers/data/nyct/subway/google_transit.zip';

const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer'
});

fs.writeFileSync('trainData.zip', response.data);

const zip = new admZip('trainData.zip');
zip.extractAllTo('public/trainData', true);