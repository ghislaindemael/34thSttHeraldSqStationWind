
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