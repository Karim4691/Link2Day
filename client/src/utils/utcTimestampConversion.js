/*
@param {number} utcSeconds - The UTC timestamp in milliseconds.
@param {string} timeZoneId - The IANA time zone identifier
*/
export function utcTimestampToLocal(utcTimestamp, timeZoneId) {
  const utcDate = new Date(utcTimestamp)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(utcDate)
}