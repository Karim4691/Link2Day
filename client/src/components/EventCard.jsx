import { useEffect } from "react"
import { useState } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "../firebase.js"
import { useNavigate } from "react-router-dom"

export default function EventCard({ event }) {
  const [eventImgUrl, setEventImgUrl] = useState("")
  const [eventData, setEventData] = useState(null)
  const navigate = useNavigate()

  // useEffect(() => {
  //   async function fetchEventData() {
  //     try {
  //       const res = await fetch(`/api/events/${event._id}`)
  //       const data = await res.json()
  //       if (!res.ok) throw data
  //       setEventData(data)

  //       //fetch image url
  //       const imageRef = ref(storage, `${data.photoUrl}`)
  //       setEventImgUrl(await getDownloadURL(imageRef))
  //     } catch (error) {
  //       console.error("Error fetching event data:", error)
  //     }
  //   }
  //   fetchEventData()
  // }, [event])
  return (
    <button type='button' className="text-left flex flex-row items-start h-36 pr-2 mb-6 w-[664px] cursor-pointer" onClick={() => navigate(`/events/${event._id}`)}>
      <img src='/sunset.jpg' alt="Event" className='h-full mr-2 p-2 rounded-xl w-64' />
      <div className='flex flex-col h-full justify-evenly ml-2'>
        <h3 className='text-lg text-[#C19A6B]'>Aug 5, 2025</h3>
        <p className='font-semibold text-lg truncate w-96'>GOWR</p>
        <p className='text-gray-500 text-[16px] truncate w-96'>hosted by mom {" · "}montreal, qc</p>
        <p className="text-gray-500 text-[16px] text-right"> 7 attendees </p>
      </div>
    </button>
  )
}