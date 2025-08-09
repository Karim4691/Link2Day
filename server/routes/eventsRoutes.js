import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import getTimeZoneID from '../middlewares/getTimeZoneID.js'
import { ObjectId } from 'mongodb'
import convertISOToUTC from '../middlewares/convertISOToUTC.js'

const router = express.Router()
const users = db.collection('users')
const events = db.collection('events')

router.post('/create', validateTokenID, getTimeZoneID, convertISOToUTC, async (req, res) => {
  const { title, details, locationName, location, eventStartISO, eventEndISO, eventStart, eventEnd, timeZoneId } = req.body
  const uid = req.uid

  try {
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
      eventStartISO,
      eventEndISO,
      eventStart, // utc timestamp
      eventEnd, //utc timestamp
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
    res.status(500).json({ message: "Failed to create event", code: error.code })
  }
})

router.get('/find', async (req, res) => { 
  try {
    var { lng, lat, maxDistance, searchEvents } = req.query
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
          },
          radius: maxDistance ? parseInt(maxDistance) * 1000 : 12765000 //max distance between any two points on earth is 12765 km
        }
      }
      
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
    res.status(500).json({ message: "Failed to fetch events", code: error.code })
  }
})

router.get('/:eventId', async (req, res) => {
  const { eventId } = req.params
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    
    res.status(200).json(event)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", code: error.code })
    console.error(error)
  }
})

router.delete('/:eventId', validateTokenID, async (req, res) => {
  const { eventId } = req.params
  const uid = req.uid
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    if (event.hostedBy !== uid) return res.status(403).json({ message: "You are not authorized to delete this event", code: 'event/unauthorized' })

    await events.deleteOne({ _id: new ObjectId(eventId) })
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", code: error.code })
  }
})

router.get('/hosting/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const eventsHosting = await events.find({ hostedBy: uid, eventEnd: { $gt: Date.now() } }).sort({ eventStart: 1 }).toArray()
    res.status(200).json(eventsHosting)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hosted events", code: error.code })
  }
})

router.get('/attending/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const attendingEvents = await events.find({ attendees: { $in: [uid] }, eventEnd: { $gt: Date.now() } }).sort({ eventStart: 1 }).toArray()
    res.status(200).json(attendingEvents)
  } catch (error) {
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
    res.status(500).json({ message: "Failed to fetch past events", code: error.code })
  }
})

router.patch('/update/:eventId', validateTokenID, getTimeZoneID, convertISOToUTC, async (req, res) => {
  try {
    const { eventId } = req.params
    const updates = req.body
    const uid = req.uid
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    
    if (event.hostedBy !== uid) {
      return res.status(403).json({ message: "You are not authorized to update this event", code: 'event/unauthorized' })
    }

    await events.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updates }
    )

    res.status(200).end()
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", code: error.code })
  }
})

router.post('/attend/:eventId', validateTokenID, async (req, res) => {
  const { eventId } = req.params
  const uid = req.uid
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    if (event.hostedBy === uid) return res.status(400).json({ message: "You cannot attend your own event", code: 'event/host-cannot-attend' })
    if (event.attendees.includes(uid)) return res.status(400).json({ message: "You are already attending this event", code: 'event/already-attending' })

    // Add user to attendees for the event
    await events.updateOne(
      { _id: new ObjectId(eventId) },
      { $addToSet: { attendees: uid } }
    )

    // Add event to user's attended events
    await users.updateOne(
      { _id: uid },
      { $addToSet: { eventsJoined: new ObjectId(eventId) } }
    )
    res.status(200).end()
  } catch (error) {
    res.status(500).json({ message: "Failed to attend event", code: error.code })
  }
})

router.post('/unattend/:eventId', validateTokenID, async (req, res) => {
  const { eventId } = req.params
  const uid = req.uid
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })
    if (event.hostedBy === uid) return res.status(400).json({ message: "You cannot attend your own event", code: 'event/host-cannot-attend' })
    if (!event.attendees.includes(uid)) return res.status(400).json({ message: "You are not attending this event", code: 'event/not-attending' })

    // Remove user from attendees for the event
    await events.updateOne(
      { _id: new ObjectId(eventId) },
      { $pull: { attendees: uid } }
    )

    // Remove event from user's attended events
    await users.updateOne(
      { _id: uid },
      { $pull: { eventsJoined: new ObjectId(eventId) } }
    )
    res.status(200).end()
  } catch (error) {
    res.status(500).json({ message: "Failed to unattend event", code: error.code })
  }
})

router.get('/attendees/:eventId', async (req, res) => {
  const { eventId } = req.params
  try {
    const event = await events.findOne({ _id: new ObjectId(eventId) })
    if (!event) return res.status(404).json({ message: "Event not found", code: 'event/not-found' })

    const attendees = await users.find(
      { _id: { $in: event.attendees }},
      {projection: {name: 1, _id: 1, bio:1}}).toArray()
    res.status(200).json(attendees)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendees", code: error.code })
  }
})

export default router