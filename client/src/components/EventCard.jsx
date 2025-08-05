import { useEffect } from "react"
import { useState } from "react"
import { ref, getDownloadURL } from "firebase/storage"
import { storage } from "../firebase.js"

export default function EventCard({ event }) {
  const [eventImgUrl, setEventImgUrl] = useState("")
  const [eventData, setEventData] = useState(null)

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
    <div className="flex flex-row items-start h-36 pr-2 mb-6 w-72">
      <img src='/sunset.jpg' alt="Event" className='h-full mr-2 p-2 rounded-xl' />
      <div className='flex flex-col h-full justify-evenly ml-2'>
        <h3 className='text-lg text-[#C19A6B]'>Aug 5, 2025</h3>
        <p className='font-semibold text-lg truncate w-72'>GOWR</p>
        <p className='text-gray-500 text-[16px] truncate w-72'>hosted by mom {" · "}montreal, qc</p>
      </div>
    </div>
  )
}