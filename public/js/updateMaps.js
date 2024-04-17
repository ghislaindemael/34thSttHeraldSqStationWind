export function updateWindMaps() {
    fetch('./stationData/stationData.json')
        .then((response) => response.json())
        .then((data) => {

            const map = $('.map');
            const desiredFloorClass = map.attr('class').split(' ').find(className => className.startsWith('floor-'));
            const desiredFloor = desiredFloorClass.substring(6);
            const backgroundImage = `./images/FLOOR_${desiredFloor}.png`;
            map.css('background-image', `url(${backgroundImage})`);

            let filteredRooms = data.measurePoints.filter((measPoint) => measPoint.level === desiredFloor);
            $('.plotted-image').remove();

            filteredRooms.forEach(room => {
                var index = Math.round(room.windStrength / 10);
                index = index.toString().padStart(2, '0');

                var imageSrc = './images/FLECHES-' + index + '.png';
                var image = $('<img>').attr({
                    alt: "",
                    src: imageSrc,
                    class: 'plotted-image'
                }).css({
                    top: ((20.4 * room.yCoord) / 33)  + '%',
                    left: ((20.4 * room.xCoord) / 51) + '%',
                    transform: 'translate(-50%, -50%) rotate(' + (38 + room.windDirection) + 'deg)'
                });

                $('.map').append(image);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}