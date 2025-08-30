import { MongoClient, ServerApiVersion } from "mongodb"
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.ATLAS_URI
console.log(uri)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
  }
})

try {
    await client.connect()
    await client.db("admin").command({ ping:1 })
    console.log("You've successfully connected to mongodb")
} catch(error) {
    console.log(error)
}

let db=client.db("L2D")

export default db