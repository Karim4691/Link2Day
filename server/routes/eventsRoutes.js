import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import auth from '../firebase.js'
import getTimeZoneData from '../middlewares/getTimeZoneData.js'
import { ObjectId } from 'mongodb'
import { DateTime } from 'luxon'

const router = express.Router()
const users = db.collection('users')
const events = db.collection('events')

router.post('/create', validateTokenID, getTimeZoneData, async (req, res) => {
  const { title, details, locationName, location, eventStartISO, eventEndISO, timeZoneId } = req.body
  const uid = req.uid


  try {
    //convert iso formatted dates to utc timestamp with respect to the event's timezone
    console.log(eventStartISO)
    const start_date = DateTime.fromISO(eventStartISO, { zone: timeZoneId })
    console.log(start_date)
    const eventStart = start_date.toUTC().toMillis()
    const end_date = DateTime.fromISO(eventEndISO, { zone: timeZoneId })
    const eventEnd = end_date.toUTC().toMillis()

    //get host name
    const user = await users.findOne({ _id: uid })
    if (!user) {
      return res.status(404).json({ message: "User not found", code: 'user/not-found' })
    }
    const hostName = user.name

    const _id = new ObjectId()
    const event = {
      _id,
      title,
      details,
      locationName,
      location,
      eventStart,
      eventEnd,
      hostedBy: uid,
      hostName,
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

router.get('/find', async (req, res) => { 
  try {
    const { lng, lat, maxDistance, searchEvents } = req.query
    var eventsQuery = {
      $search: {
        compound: {
          must: []
        }
      }
    }
    if (lng && lng!== 'null') {
      const geoQuery = {}
      geoQuery.geoWithin = {
        path: "location",
        circle: {
          center : {
            type : "Point" ,
            coordinates : [ parseFloat(lng), parseFloat(lat) ]
          }
        }
      }

      if (maxDistance) geoQuery.geoWithin.circle.radius = parseInt(maxDistance) * 1000 // convert km to meters
      
      eventsQuery.$search.compound.must.push(geoQuery)
    }

    if (searchEvents) {
      eventsQuery.$search.compound.must.push({
        compound: {
          should: [
            {
              autocomplete: {
                query: searchEvents,
                path: 'title',
                tokenOrder: "any"
              }
            },
            {
              autocomplete: {
                query: searchEvents,
                path: 'details',
                tokenOrder: "any"
              }
            }
          ]
        }
      })
    }

    var eventsMatched
    if(eventsQuery.$search.compound.must.length > 0) eventsMatched = await events.aggregate([eventsQuery, {
      $match: { eventEnd: { $gt: Date.now() } } // only show events that haven't ended yet
    }]).sort({ eventStart: 1 }).toArray()
    else eventsMatched = await events.find({ eventEnd: { $gt: Date.now() } }).sort({ eventStart: 1 }).toArray()

    res.status(200).json(eventsMatched)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ message: "Failed to fetch events", code: error.code })
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
    console.error(error)
    res.status(500).json({ message: "Failed to fetch event", code: error.code })
  }
})

router.get('/hosting/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const eventsHosting = await events.find({ hostedBy: uid, eventEnd: { $gt: Date.now() } }).sort({ eventStart: 1 }).toArray()
    res.status(200).json(eventsHosting)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch hosted events", code: error.code })
  }
})

router.get('/attending/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const attendingEvents = await events.find({ attendees: { $in: [uid] }, eventEnd: { $gt: Date.now() } }).sort({ eventStart: 1 }).toArray()
    res.status(200).json(attendingEvents)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch attending events", code: error.code })
  }
})

router.get('/past/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const pastEvents = await events.find({ eventEnd: { $lt: Date.now() }, 
    $or: [ { hostedBy: uid }, { attendees: { $in: [uid] } } ] }).sort({ eventStart: -1 }).toArray()
    res.status(200).json(pastEvents)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch past events", code: error.code })
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