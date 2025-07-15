import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI
console.log(uri)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

try {
    await client.connect()
    await client.db("admin").command({ ping:1 })
    console.log("Pinged your deployment. You've successfully connected to mongodb")
} catch(error) {
    console.log(error)
}

let db=client.db("employees")

export default db