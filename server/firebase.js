import admin from 'firebase-admin'
import serviceAccountKey from './serviceAccountKey.json' 

if (!admin.apps.length) { //check if app is initialized
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  })
}

const db = admin.firestore()

export { db }