
export function minutesSinceMondayMidnight(date){
    let minutesSinceMondayMidnight = date.getMinutes();
    minutesSinceMondayMidnight += 60* date.getHours();
    let dayDelay = date.getDay();
    if(dayDelay === 0){
        dayDelay = 7;
    }
    minutesSinceMondayMidnight += (1440*(dayDelay - 1));
    return minutesSinceMondayMidnight;
}

export function distanceBetweenRooms(room1, room2) {
    let xdif = room1.xCoord - room2.xCoord;
    let ydif = room1.yCoord - room2.yCoord;
    return Math.sqrt(Math.abs((xdif * xdif) + (ydif * ydif)));
}