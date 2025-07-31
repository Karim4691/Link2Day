import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import auth from '../firebase.js'
import getTimeZoneData from '../middlewares/getTimeZoneData.js'

const router = express.Router()
const events = db.collection('events')

router.post('/create', validateTokenID, getTimeZoneData, async (req, res) => {
  const { title, details, location, coordinates, fromDate, toDate, imgURL } = req.body
  const uid = req.user.uid

  try {
    const event = {
      title,
      details,
      locationName: location,
      location : { //geoJSON point
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat],
      },
      fromDate,
      toDate,
      imgURL,
      hostedBy: uid,
      timeZoneId: req.timeZoneId,
      timeZoneName: req.timeZoneName,
      photoUrl: 'images/events/sunset.jpg'
    }

    const result = await events.insertOne(event)
    res.status(201).json({ eventId: result.insertedId })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Failed to create event", code: error.code })
  }
})

export default router