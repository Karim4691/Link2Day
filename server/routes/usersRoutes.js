import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import auth from '../firebase.js'
import getTimeZoneID from '../middlewares/getTimeZoneID.js'


const router = express.Router()
const users = db.collection('users')

router.post('/create', getTimeZoneID, async (req, res) => {
  var { displayName, email, password, locationName, location, timeZoneId } = req.body
  try {
    const user = await auth.createUser({
      email: email,
      password: password,
      })
  
    await users.insertOne({
      _id: user.uid,
      name: displayName,
      email: email,
      locationName,
      location, 
      bio : "Hey there! I'm new to Link2Day. Feel free to reach out if you want to connect.", 
      timeZoneId: timeZoneId,
      photoUrl : `/images/profile/${user.uid}`,
      eventsHosted: [],
      eventsJoined: [],
    })
    res.status(201).json({ uid : user.uid })
  } catch(error) {
      res.status(500).json({
        message : error.message, 
        code : error.code
      })
  }
  
})

router.get('/:uid', (req, res) => {
  const { uid } = req.params

  users.findOne({ _id: uid }).then((user) => {
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "user/not-found"
      })
    }
    res.status(200).json({
      name: user.name,
      locationName: user.locationName,
      coordinates: user.location.coordinates,
      bio: user.bio,
      photoUrl: user.photoUrl,
      eventsHosted: user.eventsHosted.length,
      eventsJoined: user.eventsJoined.length,
      timeZoneId: user.timeZoneId,
    })
  })
  .catch((error) => {
    res.status(500).json( {
      message: error.message,
      code: error.code
    })
  })
})

router.patch('/update-profile', validateTokenID, getTimeZoneID, async (req, res) => {
  try {
    const uid  = req.uid
    const updates = req.body

    await users.updateOne(
      { _id: uid },
      { $set: updates })

    res.status(200).end()
  }
  catch(error) {
    res.status(400).json({ message: error.message, code: error.code})
  }
}) 

export default router