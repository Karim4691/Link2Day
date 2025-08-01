import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import auth from '../firebase.js'
import getTimeZoneData from '../middlewares/getTimeZoneData.js'
import { ObjectId } from 'mongodb'

const router = express.Router()
const events = db.collection('events')

router.post('/create', validateTokenID, getTimeZoneData, async (req, res) => {
  const { title, details, location, coordinates, eventStart, eventEnd } = req.body
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
      eventStart,
      eventEnd,
      hostedBy: uid,
      timeZoneId: req.timeZoneId,
      timeZoneName: req.timeZoneName,
      photoUrl: 'images/events/sunset.jpg' //default image, to be updated after document creation
    }

    const result = await events.insertOne(event)
    await events.updateOne(
      { _id: new ObjectId(result.insertedId) },
      { $set: { photoUrl: `images/events/${uid}/${result.insertedId}` } }
    )
    res.status(201).json({ eventId: result.insertedId })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Failed to create event", code: error.code })
  }
})

router.patch('/update/:eventId', validateTokenID, async (req, res) => {
  try {
    const { eventId } = req.params
    const updates = req.body
    const uid = req.user.uid
    const event = await events.findOne({ _id: new db.ObjectId(eventId) })
    if (!event) {
      return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    } 
    if (event.hostedBy !== uid) {
      return res.status(403).json({ message: "You are not authorized to update this event", code: 'event/unauthorized' })
    }

    await events.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updates }
    )

    res.status(200).end()
  } catch (error) {
    console.error("Error updating event:", error)
    res.status(500).json({ message: "Failed to update event", code: error.code })
  }
})

export default router