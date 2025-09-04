function getMinutesDifference(date1, date2) {
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

export { getMinutesDifference }