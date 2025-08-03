import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import errorHandler from '../utils/errorHandler.js'
import Loading from '../components/Loading.jsx'
import Header from '../components/Header.jsx'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase.js'
import { IoLocationSharp } from "react-icons/io5"
import { GoClock } from "react-icons/go"
import { getTimeZoneName, utcTimestampToLocal } from '../utils/utcTimestampConversion.js'

export default function Event ( { user } ) {
  const { eid } = useParams()
  const [event, setEvent] = useState(null)
  const [hostData, setHostData] = useState(null)
  const [eventImgURL, setEventImgURL] = useState(null)
  const [hostImgURL, setHostImgURL] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEventAndHost = async () => {
      try {
        //fetch event
        var res = await fetch(`/api/events/${eid}`)
        var data = await res.json()
        if (!res.ok) throw data
        setEvent(data)
        const eventImgRef = ref(storage, data.photoUrl)
        const eventImgUrl = await getDownloadURL(eventImgRef)
        setEventImgURL(eventImgUrl)

        //fetch host data
        res = await fetch(`/api/users/${data.hostedBy}`)
        data = await res.json()
        if (!res.ok) throw data
        setHostData(data)
        const hostImgRef = ref(storage, data.photoUrl)
        const hostImgUrl = await getDownloadURL(hostImgRef)
        setHostImgURL(hostImgUrl)
      } catch (error) {
        console.error(error)
        errorHandler(error.code)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEventAndHost()
  }, [eid])

  if (isLoading) return <Loading />
  return (
    <>
      <Header user={user} />
      <h2 className='w-screen h-48 pl-4 py-4 flex flex-col justify-center items-start p-2 border-b-2 border-gray-300'>
        <div className='mb-4 text-5xl font-tinos h-1/2'>{event.title}</div>
        <div className='flex flex-row h-1/2 items-center'>
          <img src={hostImgURL} className='rounded-full w-20 h-20 mr-2' alt='Host Avatar'/>
          <div className='flex flex-col text-lg'>
            <div>Hosted by</div>
            <div className='font-bold'>{hostData.name}</div></div>
        </div>
      </h2>

      <div className='flex flex-row w-screen h-screen bg-gray-100 p-4 pt-10'>
        <div className='flex flex-col w-2/3 h-full'>
          <img src={eventImgURL} className='rounded-xl w-3/4 h-[32rem] mb-4' alt='Event'/>
          <div className='text-lg p-4 flex flex-col items-start justify-start'>
            <h3 className='text-2xl font-bold mb-2'>Details</h3>
            <p className='text-[16px]'>{event.details}</p>
            <button className='text-cyan mt-4 hover:underline text-lg cursor-pointer font-tinos' onClick={() => {
              //todo
            }}> View Attendees </button>
          </div>
        </div>

        <div className='flex flex-col w-1/3 h-full items-center'>
          <div className='bg-white w-96 h-48 rounded-lg flex flex-col p-4 mt-20 justify-evenly'>
            <div className='flex flex-row justify-start items-center'>
              <IoLocationSharp className='size-8 text-gray-300 mr-2' />
              <span className='text-lg'>{event.locationName}</span>
            </div>
            <div className='flex flex-row justify-start mt-2 items-center'>
              <GoClock className='size-8 text-gray-300 mr-2' />
              <span className='text-lg'>{utcTimestampToLocal(event.eventStart, event.timeZoneID)} {" "} {getTimeZoneName(event.eventStart, event.timeZoneID)} - <br />{utcTimestampToLocal(event.eventEnd, event.timeZoneID)} {" "} {getTimeZoneName(event.eventEnd, event.timeZoneID)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}