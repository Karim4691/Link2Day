import express from 'express'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import auth from '../firebase.js'


const router = express.Router()
const users = db.collection('users')

router.post('/create', async (req, res) => {
  const { displayName, email, password, location, coordinates } = req.body
  try {
    const timeZoneData = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${coordinates.lat},${coordinates.lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=AIzaSyDSXyTmqJ-QhRHZotjpC2ECxu9Jxthgn6M`)
    
    const { timeZoneId, timeZoneName } = await timeZoneData.json()

    const user = await auth.createUser({
      email: email,
      password: password,
      })
    console.log('User created in Firebase:', user.uid)
  
    await users.insertOne({
      _id: user.uid,
      name: displayName,
      email: email,
      location: location,
      coordinates: coordinates, 
      bio : "Hey there! I'm new to Link2Day. Feel free to reach out if you want to connect.", 
      timeZoneId: timeZoneId,
      timeZoneName: timeZoneName,
      photoURL : "/images/profile/l.svg",
      eventsCreated: [],
      eventsJoined: [], 
      messagedUsers: [],
    })
    console.log('user created in MongoDB')
    res.status(201).end()
  } catch(error) {
      res.status(500).json({
        message : "Failed to create user", 
        code : "auth/operation-not-allowed"
      })
      console.log(error)
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
      location: user.location,
      bio: user.bio,
      photoURL: user.photoURL,
      eventsCreated: user.eventsCreated.length,
      eventsJoined: user.eventsJoined.length,
    })
  })
  .catch((error) => {
    console.log('Error fetching user data:', error)
    res.status(500).json( {
      message: "Failed to fetch user data",
      code: "auth/internal-error"
    })
  })
})

export default router