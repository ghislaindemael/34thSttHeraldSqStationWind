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
                let index = Math.round(room.windStrength / 10);
                if(index === 1){
                    index = 0;
                }
                index = index.toString().padStart(2, '0');

                const imageSrc = './images/FLECHES-' + index + '.png';
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
            });

            /*
            data.links.filter((link) => link.level === desiredFloor).forEach((link) => {
                const arrow = $('<img>').attr({
                    alt: "",
                    src: './images/FLECHES-07.png',
                }).css({
                    top: link.yRelCoord + '%',
                    left: link.xRelCoord + '%',
                    transform: `translate(-50%, -50%) rotate(${38 + link.direction}deg)`,
                    width: `0.9%`,
                    height: `1.44%`,
                    position: 'absolute',
                });
                $('.map').append(arrow);
            });
            */
        })
        .catch((error) => {
            console.error('Error:', error);
        });




}