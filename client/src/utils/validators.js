export function verifyEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 200
}

export function verifyLocation(coordinates) {
  return coordinates.lat !== null && coordinates.lng !== null
}

export function verifyName(name) {
  return name.trim().length > 0 && name.length <= 100
}

export function verifyPassword(password) {
  return password.length >= 6 && password.length <= 100
}

export function verifyBio(bio) {
  return bio.trim().length > 0 && bio.length < 60000
}

export function verifyFileSize(file) {
  return file.size < 50 * 1024 * 1024
}

export function verifyTitle(title) {
  return title.trim().length > 0 && title.length <= 200
}

/*
@param {string} fromDate - Start date in YYYY-MM-DD format
@param {string} fromTime - Start time in HH:MM format
@param {string} toDate - End date in YYYY-MM-DD format
@param {string} toTime - End time in HH:MM format
*/
export function verifyEventTime(fromDate, fromTime, toDate, toTime) {
  if (!toDate || !toTime || !fromDate || !fromTime) return false

  const startDateTime = new Date(fromDate)
  const [fromHours, fromMinutes] = fromTime.split(":").map(Number)
  startDateTime.setHours(fromHours, fromMinutes)
  const endDateTime = new Date(toDate)
  const [toHours, toMinutes] = toTime.split(":").map(Number)
  endDateTime.setHours(toHours, toMinutes)
  if (startDateTime > new Date() && endDateTime > startDateTime) {
    return true
  }
  return false
}

export function verifyDetails(details) {
  return details.trim().length > 0 && details.length <= 60000
}

