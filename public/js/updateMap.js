export function updateWindMaps() {
    fetch('./stationData/stationData.json')
        .then((response) => response.json())
        .then((data) => {

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
                if(index > 1){
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

            });

        })
        .catch((error) => {
            console.error('Error:', error);
        });




}