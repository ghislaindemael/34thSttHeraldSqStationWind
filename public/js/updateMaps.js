export function updateWindMaps() {
    fetch('./stationData/stationData.json')
        .then((response) => response.json())
        .then((data) => {
            // Loop through each map in the DOM
            $('.map').each((index, map) => {
                map = $(map);
                const backgroundImage = `./images/FLOOR_${index}.png`;
                map.css('background-image', `url(${backgroundImage})`);

                let floorPoints = data.mPoints.filter((mp) => parseInt(mp.name.charAt(1)) === index);
                $('.plotted-image', map).remove();

                floorPoints.forEach(room => {
                    let windIndex = Math.round(room.windStrength / 10);
                    if(windIndex === 10){
                        windIndex--;
                    }
                    if(windIndex > 1){
                        windIndex = windIndex.toString().padStart(2, '0');

                        const imageSrc = './images/ARR_' + windIndex + '.png';
                        const image = $('<img>').attr({
                            alt: "",
                            src: imageSrc,
                            class: 'plotted-image'
                        }).css({
                            top: room.yRelCoord + '%',
                            left: room.xRelCoord + '%',
                            transform: 'translate(-50%, -50%) rotate(' + (38 + room.windDirection) + 'deg)'
                        });

                        map.append(image); // Append the image to the current map
                    }
                });
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
