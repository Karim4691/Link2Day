const getTimeZoneData = async (req, res, next) => {
  try {
    if (!req.body.location) { // If no location is provided, skip fetching timezone data
      next()
      return
    }

    const [lng, lat] = req.body.location.coordinates

    const timeZoneData = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=AIzaSyC53hlEdD8qRZJ-fEQoyV3zgxZhxYYA15I`)
    
    const { timeZoneId } = await timeZoneData.json()
    req.body.timeZoneId = timeZoneId
    next()
  } catch(error) {
    res.status(500).json({
      message: "failed to fetch timezone data",
      code: "user/timezone-not-found"
    })
  }
}

export default getTimeZoneData