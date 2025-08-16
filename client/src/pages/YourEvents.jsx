import Header from '../components/Header.jsx'
import { FaPlus } from "react-icons/fa"
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import EventSkeleton from '../components/EventSkeleton.jsx'
import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../firebase.js'
import Loading from '../components/Loading.jsx'
import EventCard from '../components/EventCard.jsx'
import NoEventsFound from '../components/NoEventsFound.jsx'

function YourEvents({ user }) {
  const [selectedOpt, setSelectedOpt] = useState("hosting")
  const [profileImgUrl, setProfileImgUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [events, setEvents] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    async function fetchProfileImg() {
      //fetch current user's profile image url if logged in
      try {
        if (user) {
          const userImgRef = ref(storage, `images/profile/${user.uid}`)
          const userImgUrl = await getDownloadURL(userImgRef)
          setProfileImgUrl(userImgUrl)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfileImg()
  }, [user])

  useEffect(() => {
    async function fetchEvents() {
      setEventsLoading(true)
      try {
        var res
        if (selectedOpt === "hosting") res = await fetch(`${import.meta.env.VITE_API_URL}/events/hosting/${user.uid}`)
        else if (selectedOpt === "attending") res = await fetch(`${import.meta.env.VITE_API_URL}/events/attending/${user.uid}`)
        else res = await fetch(`${import.meta.env.VITE_API_URL}/events/past/${user.uid}`)

        const data = await res.json()
        if (!res.ok) throw data
        setEvents(await Promise.all(data.map(async (event) => {
          const imgRef = ref(storage, event.photoUrl)
          const url = await getDownloadURL(imgRef)
          return { ...event, photoUrl: url }
        })))
      } catch (error) {
        console.error(error)
      } finally {
        setEventsLoading(false)
      }
    }
    fetchEvents()
  }, [selectedOpt, user])

  if (!user?.emailVerified) navigate('/')

  if (isLoading) return <Loading />
  return (
    <div className='w-fit min-h-screen bg-white'>
      { (user && profileImgUrl) ? <Header user={user} profileImgUrl={profileImgUrl} /> : <Header user={user} />}
      <div className='flex flex-col lg:flex-row items-center lg:items-start justify-start lg:justify-center overflow-auto'>
        <div className='flex flex-col items-center'>
          <div className='flex flex-col justify-evenly bg-gray-100 h-56 w-64 rounded-lg p-2 px-10 mt-10 lg:mt-32 lg:mr-20 mr-0 ml-0 lg:ml-10'>
            <p className={`font-bold cursor-pointer w-fit
              ${selectedOpt === "hosting" ? "text-gold" : "text-gray-500"}`} onClick={() => setSelectedOpt("hosting")}>
              Hosting
            </p>
            <p className={`font-bold cursor-pointer w-fit
              ${selectedOpt === "attending" ? "text-gold" : "text-gray-500"}`} onClick={() => setSelectedOpt("attending")}>
              Attending
            </p>
            <p className={`font-bold cursor-pointer w-fit
              ${selectedOpt === "past" ? "text-gold" : "text-gray-500"}`} onClick={() => setSelectedOpt("past")}>
              Past
            </p>
          </div>
        </div>

        <div className='flex flex-col mt-12'>
          <div className='flex flex-row items-center mb-6'>
            <h2 className='text-4xl lg:text-5xl font-bold p-2 ml-6 font-tinos'> Your Events </h2>
            <Link to="/your-events/create" className='flex flex-row items-center justify-center p-2 text-white bg-cyan rounded-lg w-fit h-fit mr-10 hover:opacity-80 ml-5 lg:ml-20'>
              <FaPlus className='p-1 size-6' />
              <p className='p-1'>Create An Event</p>
            </Link>
          </div>

          {!eventsLoading && events.length === 0 && (
            <NoEventsFound />
          )}
          <ul className='p-2 ml-6 flex flex-col'>
            {eventsLoading && <EventSkeleton nb_cards={5} />}
            {!eventsLoading && events.length !== 0 &&
              events.map((event) => {
                return <li key={event._id}>
                  <EventCard event={event} eventImgUrl={event.photoUrl} key={event._id} />
                </li>
              })
            }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default YourEvents
