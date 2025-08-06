import { useRef, useEffect, useState } from "react"
import Header from "../components/Header.jsx"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import Loading from "../components/Loading.jsx"
import EventCard from "../components/EventCard.jsx"
import EventSkeleton from "../components/EventSkeleton.jsx"
import { storage } from "../firebase.js"
import { ref, getDownloadURL } from "firebase/storage"
import Autocomplete from "../components/Autocomplete.jsx"
import { FaAngleDown, FaAngleUp } from "react-icons/fa6"


function Home({ user }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true) // initially render loading skeleton
  const [keyword, setKeyword] = useState("")
  const [maxDistance, setMaxDistance] = useState("50")
  const [userData, setUserData] = useState(null)
  const [profileImgUrl, setProfileImgUrl] = useState(null)
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [searchQuery, setSearchQuery] = useState("")
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

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/${user.uid}`)
        const data = await res.json()
        if (!res.ok) throw data
        setUserData(data)

        //fetch profileImgUrl
        const imgRef = ref(storage, `images/profile/${user.uid}`)
        setProfileImgUrl(await getDownloadURL(imgRef))
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
    <section className="relative w-screen h-screen">
      <Header user={user} />
      <div className="flex flex-col w-screen h-full ml-24 mt-24">
        <h2 className="font-semibold font-tinos py-2 mb-8">
          {userData && <p className="mb-16 text-5xl">Welcome back, {userData.name.split(' ')[0]}!</p>}
          <p className="text-3xl">Upcoming Events</p>
        </h2>

        <div className="flex flex-row items-center justify-evenly w-4/5 mb-2">
          <div className="relative flex flex-row w-xl">
            <input className="w-32 sm:w-64 border border-gray-300 py-2 p-1 rounded-l-md shadow-inner focus:outline-gold text-sm hover:border-gray-500" type="text" />
            <Autocomplete setSelectedLocation={setLocation} setCoordinates={setCoordinates}
              inputClassName={"relative w-32 sm:w-64 border border-gray-300 py-2 p-1 rounded-r-md shadow-inner focus:outline-gold text-sm hover:border-gray-500 pr-14"} showIcon/>
          </div>

          <button ref={maxDistanceRef} type="button" className="relative bg-gold text-white py-2 px-4 rounded-2xl cursor-pointer z-10" onClick={() => setSelectMaxDistance(!selectMaxDistance)}>
            Max Distance
            { selectMaxDistance ? <FaAngleUp className="inline ml-2" /> : <FaAngleDown className="inline ml-2" />}
            {selectMaxDistance && (
              <div ref={dropdown} className="absolute right-0 mt-4 w-full bg-white rounded-md shadow-lg  z-10">
                <ul className="py-1">
                  {["10", "25", "50", "100"].map((distance) => (
                    <li key={distance} className={`px-4 py-2 hover:text-gold cursor-pointer ${maxDistance === distance ? "text-gold" : "text-gray-400"}`} onClick={() => {
                      setMaxDistance(distance)
                      setSelectMaxDistance(false)
                    }}>
                      {distance} km
                    </li>
                  ))}
                  <li className={`px-4 py-2 hover:text-gold cursor-pointer ${maxDistance === "Any distance" ? "text-gold" : "text-gray-400"}`} onClick={() => {
                    setMaxDistance("Any distance")
                    setSelectMaxDistance(false)
                  }}>
                    Any distance
                  </li>
                </ul>
              </div>
            )}
          </button>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 justify-between mt-8 w-4/5 h-full">
          <EventSkeleton nb_cards={6} />
        </ul>
      </div>
    </section>
  )
}

export default Home
