import express from 'express'
import { db } from '../firebase.js'
const router = express.Router()

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const userDoc = await db.collection('users').doc(id).get()
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