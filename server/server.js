import express from 'express'
import cors from 'cors'
import usersRoutes from './routes/usersRoutes.jsx'

const PORT=process.env.PORT
const app = express()

app.use(cors())
app.use(express.json())
app.use("/users", usersRoutes)

app.listen(PORT, (req,res) => {
    console.log(`server listening on port ${PORT}`)
})

