import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import { storage } from "../firebase.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import errorHandler from "../utils/errorHandler"
import { verifyFileSize, verifyFromDate, verifyTitle, verifyToDate, verifyLocation, verifyDetails } from "../utils/validators.js"
import Autocomplete from "../components/Autocomplete.jsx"
import { Calendar } from 'primereact/calendar'

export default function CreateEvent({ user }) {
  const [imgURL, setImgURL] = useState(null)
  const [imageFile, setImageFile] = useState(null) //the image file
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [fromDate, setFromDate] = useState(null) //first day of event
  const [toDate, setToDate] = useState(null) //last of event
  const navigate = useNavigate()

  if (!user?.emailVerified) navigate('/Home')
  useEffect(() => {
    async function fetchDefaultImage() {
      try {
        const storageRef = ref(storage, '/images/events/sunset.jpg')
        const url = await getDownloadURL(storageRef)
        setImgURL(url)
      } catch (error) {
        console.log(error)
        errorHandler(error.code)
      }
    }
    fetchDefaultImage()
  }, [])

  const handleImageUpload = async (file) => {
    try {
      if (!file) return
      if (!verifyFileSize(file)) errorHandler('image/too-large')
      const tmpURL = URL.createObjectURL(file)
      setImgURL(tmpURL)
      setImageFile(file)
    } catch (error) {
      console.log(error)
      errorHandler(error.code)
    }
  }

  const handleCreateEvent = async () => {
    try {
      if (!verifyTitle(title)) errorHandler('event/title-invalid')
      if (!verifyLocation(coordinates)) errorHandler('auth/invalid-location')
      if (!verifyFromDate(fromDate)) errorHandler('event/from-date-invalid')
      if (!verifyToDate(fromDate, toDate)) errorHandler('event/to-date-invalid')
      if (!verifyDetails(details)) errorHandler('event/invalid-details')

      var res = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          details,
          location,
          coordinates,
          fromDate,
          toDate,
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw error
      }

      var data = await res.json()
      const eventId = data.eventId
      if (imageFile) {
        const storageRef = ref(storage, `/images/events/${user.uid}/${eventId}`)
        await uploadBytes(storageRef, imageFile)
        //update mongodb (todo)
      }

      if (!res.ok) {
        const error = await res.json()
        throw error
      }
      console.log("Event created successfully")
    } catch(error) {
      console.log(error)
      errorHandler(error.code)
    }
  }

  return (
    <>
      <Header user={user} />
      <div className="flex flex-row w-screen h-screen bg-gray-100">
        <div className="flex flex-col w-2xl items-center mt-20 p-4 px-10">
          <img src={imgURL} className='rounded-xl w-72 h-72'/>
          <label>
            <input className='hidden' type='file' accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }} id='img'/>
            <div className='bg-cyan text-white rounded-lg mt-6 px-6 py-3 text-lg cursor-pointer hover:opacity-80'>
              Edit Picture
            </div>
          </label>
        </div>
        <form className="w-[30rem] ml-6">
          <legend className='text-5xl font-bold p-2 mt-12'> Create an event </legend>

          <fieldset className="flex flex-col items-center mt-8 p-2 w-full">
            <ul className="flex flex-col w-full">
              <li className="flex flex-col w-full mb-6">
                <label className='text-lg'>Title</label>
                <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500' value={title} type='text' onChange={(e) => setTitle(e.target.value)} />
              </li>

              <li className="flex flex-col w-full mb-6">
                <label className='text-lg'>Location</label>
                <Autocomplete setSelectedLocation={setLocation} setCoordinates={setCoordinates}/>
              </li>

              <li className="flex flex-col w-full mb-6 mt-2">
                <div className="flex flex-row-start mt-2">
                  <div className="flex flex-col w-1/2 mr-3">
                    <label className="text-2xl font-bold mb-1">From</label>
                    <Calendar value={fromDate} onChange={(e) => setFromDate(e.value)} showIcon dateFormat="dd/mm/yy" hourFormat="12" readOnlyInput hideOnDateTimeSelect showTime/>
                  </div>
                  <div className="flex flex-col w-1/2 ml-3">
                    <label className="text-2xl font-bold mb-1">To</label>
                    <Calendar value={toDate} onChange={(e) => setToDate(e.value)} showIcon dateFormat="dd/mm/yy" hourFormat="12" readOnlyInput hideOnDateTimeSelect showTime/>
                  </div>
                </div>
              </li>

              <li className='flex flex-col w-full mt-2'>
                <label className='text-lg'>Details</label>
                <textarea className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500 w-full overflow-y-scroll overflow-x-hidden' value={details} onChange={(e) => setDetails(e.target.value)}/>
              </li>
            </ul>
          </fieldset>

          <div className="flex items-center justify-center w-full">
            <button type="button" className="bg-gradient-to-r from-cyan to-gold text-white m-4 px-4 py-2 rounded-lg text-lg cursor-pointer hover:opacity-90" onClick={handleCreateEvent}>
              Create event
            </button>
          </div>
        </form>
      </div>
    </>
  )
}