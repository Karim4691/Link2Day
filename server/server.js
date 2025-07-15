import express from 'express'
import cors from 'cors'
import events from './routes/events.js'

const PORT=process.env.PORT
const app = express()

app.use(cors())
app.use(express.json())
app.use("/event", events)

app.listen(PORT, (req,res) => {
    console.log(`server listening on port ${PORT}`)
})

