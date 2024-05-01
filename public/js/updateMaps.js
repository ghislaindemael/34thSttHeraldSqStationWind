export function updateWindMap() {
    fetch('./stationData/stationData.json')
        .then((response) => response.json())
        .then((data) => {

            const ceilingTypeToImageSrc = {
                "OP1": "./images/bluedot.png",
                "OP2": "./images/reddot.png"
            };

            const map = $('.map');
            const desiredFloorClass = map.attr('class').split(' ').find(className => className.startsWith('floor-'));
            const desiredFloor = desiredFloorClass.substring(6);
            const backgroundImage = `./images/FLOOR_${desiredFloor}.png`;
            map.css('background-image', `url(${backgroundImage})`);

            let filteredRooms = data.mPoints.filter((measPoint) => measPoint.name.charAt(1) === desiredFloor);
            $('.plotted-image').remove();

            filteredRooms.forEach(room => {
                let index = Math.round(room.windStrength / 10);
                if(index === 10){
                    index--;
                }
                if(index >= 1){ //To prevent viewing the point
                //if(index >= 0){
                    index = index.toString().padStart(2, '0');
                    const imageSrc = './images/ARR_' + index + '.png';
                    const image = $('<img>').attr({
                        alt: "",
                        src: imageSrc,
                        class: 'plotted-image'
                    }).css({
                        top: room.yRelCoord + '%',
                        left: room.xRelCoord + '%',
                        transform: 'translate(-50%, -50%) rotate(' + (38 + room.windDirection) + 'deg)'
                    });

                    $('.map').append(image);
                }

                /*
                const imageSrc = ceilingTypeToImageSrc[room.ceilingType];
                if (imageSrc) {
                    const image = $('<img>').attr({
                        src: imageSrc,
                        class: 'plotted-image'
                    }).css({
                        top: room.yRelCoord + '%',
                        left: room.xRelCoord + '%',
                        transform: 'translate(-50%, -50%)'
                    });

                    $('.map').append(image);
                }
                 */

            });

        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export function updateWindMaps() {
    fetch('./stationData/stationData.json')
        .then((response) => response.json())
        .then((data) => {
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

                        map.append(image);
                    }
                });
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
