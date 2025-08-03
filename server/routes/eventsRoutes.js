import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import auth from '../firebase.js'
import getTimeZoneData from '../middlewares/getTimeZoneData.js'
import { ObjectId } from 'mongodb'

const router = express.Router()
const users = db.collection('users')
const events = db.collection('events')

router.post('/create', validateTokenID, getTimeZoneData, async (req, res) => {
  const { title, details, location, coordinates, eventStart, eventEnd, timeZoneId } = req.body
  const uid = req.uid

  try {
    const _id = new ObjectId()
    const event = {
      _id,
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
      timeZoneId: timeZoneId,
      photoUrl: `images/events/${uid}/${_id}`,
      attendees: [],
    }

    const result = await events.insertOne(event)
    
    //add event to user's hosted events
    await users.updateOne(
      { _id: uid },
      { $addToSet: { eventsHosted: _id } }
    )
    res.status(201).json({ eventId: result.insertedId })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Failed to create event", code: error.code })
  }
})

router.get('/:eventId', async (req, res) => {
  const { eventId } = req.params
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) {
      return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    }
    res.status(200).json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    res.status(500).json({ message: "Failed to fetch event", code: error.code })
  }
})

router.patch('/update/:eventId', validateTokenID, getTimeZoneData,async (req, res) => {
  try {
    const { eventId } = req.params
    const updates = req.body
    const uid = req.uid
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