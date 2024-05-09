
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
    let xdif = room1.xRelCoord - room2.xRelCoord;
    let ydif = room1.yRelCoord - room2.yRelCoord;
    return Math.abs(Math.sqrt((xdif * xdif) + (ydif * ydif)));
}

export function findAngleBetweenPoints(point1, point2) {
    const dx = point2.xCoord - point1.xCoord;
    const dy = point2.yCoord - point1.yCoord;

    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);

    if (angleDeg < 0) {
        angleDeg += 360;
    }

    return Math.round(angleDeg);
}

export function setAngleTo360Interval(angle){
    if(angle < 0){
        angle += 360;
    }
    return angle;
}

function rad2Deg(radians) {
    return radians * (180 / Math.PI);
}

function deg2Rad(degrees) {
    return degrees * (Math.PI / 180);
}

export function angleDifference(angle1, angle2) {
    let diff = Math.abs(angle1 - angle2) % 360;
    return diff > 180 ? 360 - diff : diff;
}

export function factorOfAngleDifference(angle1, angle2) {
    let angle = angleDifference(angle1, angle2);
    if(angle > 90){
        return 0;
    } else {
        let rad = deg2Rad(angle);
        return (1 - Math.pow((rad / 1.6), 4));
        //return Math.cos(deg2Rad(angle));
    }
}