import admin from 'firebase-admin'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import dotenv from 'dotenv'

dotenv.config()

if (!admin.apps.length) { //check if app is initialized
  initializeApp({
    credential: applicationDefault(),
  })
}

const db = admin.firestore()

export { db }