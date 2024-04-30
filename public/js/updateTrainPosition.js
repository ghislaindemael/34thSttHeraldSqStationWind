function updateTrainPosition(routeColumnId, direction) {
    //console.log("Updating route " + routeColumnId + " " + direction);

    var now = new Date();
    var dayOfWeek = now.getDay();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var minutesSinceMonday = hours * 60 + minutes
    switch (dayOfWeek) {
        case 0:
            minutesSinceMonday += 6 * 24 * 60;
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            minutesSinceMonday += (dayOfWeek - 1) * 24 * 60;
            break;
    }

    var filePrefix = "/myTrainData/";
    var fileName = routeColumnId + "_" + direction + "_Times.txt";
    var filePath = filePrefix + fileName;

    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            var timeArray = data.split("\n");
            var cells = document.querySelectorAll('#' + routeColumnId + ' .timeColumn .' + direction + ' .dirLines .lineCol .cell');
            var line1cells = Array.from(cells).slice(0, 31);
            var line2cells = Array.from(cells).slice(-31);
            line1cells.forEach(function (cell) {
                cell.textContent = '';
            });
            line2cells.forEach(function (cell) {
                cell.textContent = '';
            });

            for (var i = 0; i < timeArray.length; i++) {
                var timeParts = timeArray[i].split(":");
                var timeInMinutes = parseInt(timeParts[0]);
                var timeDifference = timeInMinutes - minutesSinceMonday;

                if (timeDifference >= -15 && timeDifference <= 15) {
                    var cellIndex = direction=== "UP" ? 15 + timeDifference : 15 - timeDifference;
                    var cell = line1cells[cellIndex];
                    if(cell.textContent === ''){
                        cell.textContent = timeParts[1];
                    } else {
                        line2cells[cellIndex].textContent = timeParts[1];
                    }
                }
            }
        });
}

export { updateTrainPosition };