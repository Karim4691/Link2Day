import express from "express"
import db from "../db/connection.js"


const router = express.Router()

router.get("/", async (req, res) => {
    let collection = await db.collection("events")
    let results = await collection.find({}).toArray()
    res.send(results).status(200)
})

export default router