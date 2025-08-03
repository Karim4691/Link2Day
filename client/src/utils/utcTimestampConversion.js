/*
@param {number} utcSeconds - The UTC timestamp in milliseconds.
@param {string} timeZoneId - The IANA time zone identifier
*/
export function utcTimestampToLocal(utcTimestamp, timeZoneId) {
  const utcDate = new Date(utcTimestamp)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(utcDate)
}

export function getTimeZoneName(utcTimestamp, timeZoneId) {
  const date = new Date(utcTimestamp)

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    timeZoneName: 'short',
  })

  const parts = formatter.formatToParts(date)
  const tzPart = parts.find(part => part.type === 'timeZoneName')
  return tzPart.value
}