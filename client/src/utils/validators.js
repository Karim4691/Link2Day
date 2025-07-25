export function verifyEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 100
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