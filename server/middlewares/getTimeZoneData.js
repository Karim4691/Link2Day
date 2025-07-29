import auth from '../firebase.js'

const getTimeZoneData = async (req, res, next) => {
  try {
    const { lat, lng } = req.body.coordinates

    const timeZoneData = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=AIzaSyC53hlEdD8qRZJ-fEQoyV3zgxZhxYYA15I`)
    
    const { timeZoneId, timeZoneName } = await timeZoneData.json()
    req.timeZoneId = timeZoneId
    req.timeZoneName = timeZoneName
    next()
  } catch(error) {
    res.status(500).json({
      message: "failed to fetch timezone data",
      code: "user/timezone-not-found"
    })
  }
}

export default getTimeZoneData