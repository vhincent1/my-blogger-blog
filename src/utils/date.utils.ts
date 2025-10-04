export function getMinutesDifference(date1: Date, date2: Date) {
  // Get timestamps in milliseconds
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  // Calculate difference in milliseconds
  const diffMilliseconds = Math.abs(time2 - time1);
  // Convert to minutes
  const diffMinutes = diffMilliseconds / (1000 * 60);
  // Return the rounded difference
  return Math.round(diffMinutes);
}

export const hoursToMs = (hours: number) => hours * 3600000

export function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (parseInt(seconds) < 60) return seconds + ' Seconds';
  else if (parseInt(minutes) < 60) return minutes + ' Minutes';
  else if (parseInt(hours) < 24) return hours + ' Hours';
  else return days + ' Days'
}
