import { useRef, useEffect, useState } from "react"
import Header from "../components/Header.jsx"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import Loading from "../components/Loading.jsx"
import EventCard from "../components/EventCard.jsx"
import EventSkeleton from "../components/EventSkeleton.jsx"
import { storage } from "../firebase.js"
import { ref, getDownloadURL } from "firebase/storage"
import Autocomplete from "../components/Autocomplete.jsx"
import { FaAngleDown, FaAngleUp } from "react-icons/fa6"
import NoEventsFound from "../components/NoEventsFound.jsx"


function Home({ user }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true) // initially render loading skeleton
  const [maxDistance, setMaxDistance] = useState("50")
  const [profileImgUrl, setProfileImgUrl] = useState(null)
  const [userName, setUserName] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [searchEvents, setSearchEvents] = useState("")
  const dropdown = useRef(null) //the max distance dropdown
  const maxDistanceRef = useRef(null) // used to toggle the max distance dropdown
  const [selectMaxDistance, setSelectMaxDistance] = useState(false)

  const navigate = useNavigate()

  if (user && !user.emailVerified) {
    toast.error("Please verify your email.")
    navigate('')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdown.current && !(dropdown.current).contains(e.target) && !(maxDistanceRef.current).contains(e.target)) setSelectMaxDistance(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  //Load user profile image
  useEffect(() => {
    async function fetchUserProfileImage() {
      try {
        if (user) {
          const imgRef = ref(storage, `images/profile/${user.uid}`)
          const url = await getDownloadURL(imgRef)
          setProfileImgUrl(url)
        }
      } catch (error) {
        console.error("Error fetching user profile image:", error)
      }
    }
    fetchUserProfileImage()
  }, [user])

  useEffect(() => {
    async function fetchUserDataAndEvents() {
      try {
        var [ lng, lat ] = [null, null]
        if (user) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.uid}`)
          const data = await res.json()
          if (!res.ok) throw data
          setLocation(data.locationName)
          //update coordinates to get local events
          lng = data.coordinates[0]
          lat = data.coordinates[1]
          setCoordinates({ lat, lng })
          setUserName(data.name)
        }
        setIsLoading(false)

        //fetch events near user
        const eventsRes = await fetch(`${import.meta.env.VITE_API_URL}/events/find?lng=${lng}&lat=${lat}&maxDistance=50`)
        const eventsData = await eventsRes.json()
        if (!eventsRes.ok) throw eventsData

        setEvents(await Promise.all(eventsData.map(async (event) => { //get event image URLs
          const imgRef = ref(storage, event.photoUrl)
          const url = await getDownloadURL(imgRef)
          return { ...event, photoUrl: url }
        })))
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
        setEventsLoading(false)
      }
    }
    fetchUserDataAndEvents()
  }, [user])

  const handleSearch = async () => {
    try {
      setEventsLoading(true)
      // Search for events
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/find?lng=${coordinates.lng}&lat=${coordinates.lat}&maxDistance=${maxDistance}&searchEvents=${searchEvents}`)
      const data = await res.json()
      if (!res.ok) throw data

      // set the photo url instead of refs for photoUrl
      setEvents(await Promise.all(data.map(async (event) => {
        const imgRef = ref(storage, event.photoUrl)
        const url = await getDownloadURL(imgRef)
        return { ...event, photoUrl: url }
      })))
    } catch (error) {
      console.log(error)
    } finally {
      setEventsLoading(false)
    }
  }




  if (isLoading) return <Loading />
  return (
    <section className="relative min-w-screen min-h-screen bg-white overflow-y-auto overflow-x-auto">
      { (user && profileImgUrl) ? <Header user={user} profileImgUrl={profileImgUrl} /> : <Header user={user} />}

      <div className="flex flex-col w-full h-full pl-12 mt-24 pb-12">
        <h2 className="font-semibold font-tinos py-2 mb-8">
          {userName && <p className="mb-16 text-5xl">Welcome back, {userName.split(' ')[0]}!</p>}
          <p className="text-3xl">Upcoming Events</p>
        </h2>

        <div className="flex flex-row items-center justify-evenly w-11/12 mb-2">
          <div className="relative flex flex-row w-xl">
            <input placeholder="Search for events" className="w-32 md:w-64 border border-gray-300 py-2 p-1 rounded-l-md shadow-inner focus:outline-none focus:border-gold text-sm hover:border-gray-500" type="text" value={searchEvents} onChange={(e) => setSearchEvents(e.target.value)} />
            <Autocomplete selectedLocation={location} setSelectedLocation={setLocation} setCoordinates={setCoordinates}
              inputClassName={"relative w-32 md:w-64 border border-gray-300 py-2 p-1 rounded-r-md shadow-inner focus:outline-none focus:border-gold text-sm hover:border-gray-500 pr-14"} placeholder={"Neighborhood"} showIcon onIconClick={handleSearch}/>
          </div>

          <button ref={maxDistanceRef} type="button" className="relative bg-gold text-white py-2 px-4 rounded-2xl cursor-pointer z-10" onClick={() => setSelectMaxDistance(!selectMaxDistance)}>
            Max Distance
            { selectMaxDistance ? <FaAngleUp className="inline ml-2" /> : <FaAngleDown className="inline ml-2" />}
            {selectMaxDistance && (
              <div ref={dropdown} className="absolute right-0 mt-4 w-full bg-white rounded-md shadow-lg z-10">
                <ul className="py-1">
                  {["10", "25", "50", "100"].map((distance) => (
                    <li key={distance} className={`px-4 py-2 hover:text-gold cursor-pointer ${maxDistance === distance ? "text-gold" : "text-gray-400"}`} onClick={() => {
                      setMaxDistance(distance)
                      setSelectMaxDistance(false)
                    }}>
                      {distance} km
                    </li>
                  ))}
                  <li className={`px-4 py-2 hover:text-gold cursor-pointer ${maxDistance === "" ? "text-gold" : "text-gray-400"}`} onClick={() => {
                    setMaxDistance("")
                    setSelectMaxDistance(false)
                  }}>
                    Any distance
                  </li>
                </ul>
              </div>
            )}
          </button>
        </div>

        {!eventsLoading && events.length === 0 && (
          <div className="w-11/12">
            <NoEventsFound />
          </div>
        )}
        <ul className="grid grid-cols-1 xl:grid-cols-2 gap-2 mt-8 w-fit min-h-full">
          {eventsLoading && <EventSkeleton nb_cards={6} />}
          {!eventsLoading && events.length !== 0 &&
            events.map((event) => {
              return <li key={event._id}>
                <EventCard event={event} />
              </li>
            })
          }
        </ul>
      </div>
    </section>
  )
}

export default Home
