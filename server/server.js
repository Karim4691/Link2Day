import express from 'express'
import cors from 'cors'
import usersRoutes from './routes/usersRoutes.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT= process.env.PORT
const app = express()


app.use(cors())
app.use(express.json())
app.use("/api/users", usersRoutes)

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
})