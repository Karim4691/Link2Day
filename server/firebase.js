import dotenv from 'dotenv'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

dotenv.config()

initializeApp({
  credential: applicationDefault(),
  projectID: process.env.FIREBASE_PROJECT_ID,
})

export default auth = getAuth()