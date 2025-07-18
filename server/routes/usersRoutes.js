import express from 'express'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import dotenv from 'dotenv'

dotenv.config()

initializeApp({
  credential: applicationDefault(),
  projectID: process.env.FIREBASE_PROJECT_ID,
})

const router = express.Router()

router.get('/protected-resource', (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]

  getAuth().verifyIdToken(idToken)
  .then(() => {
    res.status(200).end()
    console.log("Token successfully validated")
  })
  .catch((error) => {
    res.status(401).end()
    console.log(error)
  })
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