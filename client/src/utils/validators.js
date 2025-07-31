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

export function verifyFromDate(fromDate) {
  return fromDate !== null && fromDate > new Date()
}

export function verifyToDate(fromDate, toDate) {
  return toDate !== null && toDate > fromDate
}

export function verifyDetails(details) {
  return details.trim().length > 0 && details.length <= 60000
}

