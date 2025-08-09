import { DateTime } from 'luxon'

//convert iso formatted dates to utc timestamp with respect to the timezone
const convertISOToUTC = async (req, res, next) => {
  try {
    const { eventStartISO, eventEndISO, timeZoneId } = req.body
    if (eventStartISO) {
      const start_date = DateTime.fromISO(eventStartISO, { zone: timeZoneId })
      req.body.eventStart = start_date.toUTC().toMillis()
    }
    if (eventEndISO) {
      const end_date = DateTime.fromISO(eventEndISO, { zone: timeZoneId })
      req.body.eventEnd = end_date.toUTC().toMillis()
    }
    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to convert dates", code: error.code })
  }
}

export default convertISOToUTC