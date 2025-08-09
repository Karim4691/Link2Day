import { DateTime } from 'luxon'

/*
@param {number} utcSeconds - The UTC timestamp in milliseconds.
@param {string} timeZoneId - The IANA time zone identifier
@return {string} - The formatted local date and time string (MMM/DD/YYYY, HH:mm AM/PM GMT-offset)
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

/*
@param {number} utcTimestamp - The UTC timestamp in milliseconds.
@param {string} timeZoneId - The IANA time zone identifier
@return {string} - The formatted local date and time string (YYYY-MM-DD, HH:mm)
*/
export function utcTimestampToLocalDate(utcTimestamp, timeZoneId) {
  const local = DateTime
    .fromMillis(utcTimestamp, { zone: 'utc' })
    .setZone(timeZoneId)

  return [new Date(local.year, local.month - 1, local.day), local.toFormat('HH:mm')]
}

export function fromISOtoUTC(isoString, timeZoneId) {
  const dt = DateTime.fromISO(isoString, { zone: timeZoneId })
  return dt.toUTC().toMillis()
}