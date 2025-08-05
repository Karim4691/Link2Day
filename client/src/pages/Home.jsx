import { use, useEffect, useState } from "react"
import Header from "../components/Header.jsx"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import Loading from "../components/Loading.jsx"
import EventCard from "../components/EventCard.jsx"


function Home({ user }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState("")
  const [keyword, setKeyword] = useState("")
  const [maxDistance, setMaxDistance] = useState(null)
  const [userData, setUserData] = useState(null)

  const navigate = useNavigate()

  if (user && !user.emailVerified) {
    toast.error("Please verify your email.")
    navigate('')
  }
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/users/${user.uid}`)
        const data = await res.json()
        if (!res.ok) throw data
        setUserData(data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) {
      fetchUserData()
    }

  }, [user])

  if (isLoading) return <Loading />

  return (
    <div className="relative w-screen h-screen">
      <Header user={user} />
      <div className="w-screen h-screen">
        <h2 className="font-semibold font-tinos pt-24 py-2 ml-24">
          {userData && <p className="mb-16 text-5xl">Welcome back, {userData.name.split(' ')[0]}!</p>}
          <p className="text-3xl">Upcoming Events</p>
        </h2>

        <ul className="flex flex-col justify-start items-center mt-8 w-full h-full">
          <EventCard />
        </ul>
      </div>
    </div>
  )
}

export default Home
