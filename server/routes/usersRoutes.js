import express from 'express'
import { db } from '../firebase.js'
const router = express.Router()

router.get('/:uid', async (req, res) => {
  const { uid } = req.params

  try {
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }

    const data = userDoc.data()
    res.json({ name: data.displayName, bio: data.bio })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router