import express from 'express'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import dotenv from 'dotenv'
import validateTokenID from '../middlewares/validateTokenID.js'
import db from '../mongodb.js'

dotenv.config()

initializeApp({
  credential: applicationDefault(),
  projectID: process.env.FIREBASE_PROJECT_ID,
})

const router = express.Router()
const users = db.collection('users')

router.post('/create', validateTokenID, async (req, res) => {
  try {
    await users.insertOne({
      _id: req.body.uid,
      name: req.body.displayName,
      email: req.body.email,
      location: req.body.location,
      coordinates: req.body.coordinates, 
      bio : "", 
      photoURL : null,
      eventsCreated: [],
      eventsJoined: [], 
      messagedUsers: [],
    })
    console.log('user created in MongoDB')
    res.status(200).end()
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

  getAuth().getUser(uid).then((UserRecord) => {
    console.log('Successfully fetched user data')
    res.status(200).json({email: UserRecord.email})
  }).catch((error) => {
    console.log('Error fetching user data:', error)
    res.status(404).json( {error: 'User not found'})
  })
})

export default router