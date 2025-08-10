import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../components/Header"
import { storage } from "../firebase.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import errorHandler from "../utils/errorHandler"
import { verifyFileSize, verifyEventTime, verifyTitle, verifyLocation, verifyDetails } from "../utils/validators.js"
import Autocomplete from "../components/Autocomplete.jsx"
import { Calendar } from 'primereact/calendar'
import TimePicker from 'react-time-picker'
import Loading from "../components/Loading.jsx"
import toast from "react-hot-toast"
import { utcTimestampToLocalDate } from "../utils/utcTimestampConversion.js"

export default function EditEvent({ user }) {
  const [isLoading, setIsLoading] = useState(true)
  const [imgURL, setImgURL] = useState(null) //event img url
  const [imageFile, setImageFile] = useState(null) //event image file
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [fromDate, setFromDate] = useState(null) //first day of event
  const [fromTime, setFromTime] = useState("00:00")
  const [toDate, setToDate] = useState(null) //last day of event
  const [toTime, setToTime] = useState("00:00")
  const [profileImgUrl, setProfileImgUrl] = useState(null) //current user's profile image url

  // redirect if user is not properly authenticated
  const navigate = useNavigate()
  if (!user?.emailVerified) navigate('/home')

  const { eid } = useParams()

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

  //Load default event image
  useEffect(() => {
    const loadEventData = async () => {
      try {
        if (!user) return
        const res = await fetch(`/api/events/${eid}`, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          }
        })

        const data = await res.json()
        if (!res.ok) throw data

        const eventImgRef = ref(storage, `images/events/${user.uid}/${eid}`)
        const url = await getDownloadURL(eventImgRef)
        setImgURL(url)

        setTitle(data.title)
        setDetails(data.details)
        setLocation(data.locationName)
        setCoordinates({ lng: data.location.coordinates[0], lat: data.location.coordinates[1] })
        const [fromDateTmp, fromTimeTmp] = utcTimestampToLocalDate(data.eventStart, data.timeZoneId)
        const [toDateTmp, toTimeTmp] = utcTimestampToLocalDate(data.eventEnd, data.timeZoneId)
        setFromDate(fromDateTmp)
        setFromTime(fromTimeTmp)
        setToDate(toDateTmp)
        setToTime(toTimeTmp)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadEventData()
  }, [user, eid])

  const handleImageUpload = async (file) => {
    try {
      if (!file) return
      if (!verifyFileSize(file)) errorHandler('image/too-large')
      const tmpURL = URL.createObjectURL(file)
      setImgURL(tmpURL)
      setImageFile(file)
    } catch (error) {
      errorHandler(error.code)
      console.log(error)
    }
  }

  const handleUpdateEvent = async () => {
    try {
      if (!verifyTitle(title)) {
        errorHandler('event/title-invalid')
        return
      }
      if (!verifyLocation(coordinates)) {
        errorHandler('auth/invalid-location')
        return
      }
      if (!verifyEventTime(fromDate, fromTime, toDate, toTime)) {
        errorHandler('event/invalid-time')
        return
      }
      if (!verifyDetails(details)) {
        errorHandler('event/invalid-details')
        return
      }

      const pad = n => String(n).padStart(2, '0') //helper function to pad numbers with leading zeros (YYYY-MM-DD format)
      const eventStartISO = `${fromDate.getFullYear()}-${pad(fromDate.getMonth() + 1)}-${pad(fromDate.getDate())}T${fromTime}`
      const eventEndISO = `${toDate.getFullYear()}-${pad(toDate.getMonth() + 1)}-${pad(toDate.getDate())}T${toTime}`

      var res = await fetch(`/api/events/update/${eid}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          details,
          locationName: location,
          location: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat],
          },
          eventStartISO,
          eventEndISO,
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw error
      }

      //upload image to firebase storage if a new image was uploaded
      if (imageFile) {
        const storageRef = ref(storage, `/images/events/${user.uid}/${eid}`)
        await uploadBytes(storageRef, imageFile)
      }

      toast.success('Event updated!')
      navigate(`/events/${eid}`)
    } catch(error) {
      errorHandler(error.code)
      console.log(error)
    }
  }

  if (isLoading) return <Loading />
  return (
    <div className="w-screen min-h-screen bg-white overflow-y-auto overflow-x-auto">
      { (profileImgUrl) ? <Header user={user} profileImgUrl={profileImgUrl} /> : <Header user={user} />}
      <div className="flex flex-row w-screen">
        <div className="flex flex-col w-md items-center mt-20 p-4 px-10">
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
        <form className="w-[30rem] ml-6 mr-8 mb-4">
          <legend className='text-5xl font-bold p-2 mt-12 font-tinos'> Edit Event </legend>

          <fieldset className="flex flex-col items-center mt-8 p-2 w-full">
            <ul className="flex flex-col w-full">
              <li className="flex flex-col w-full mb-6">
                <label className='text-lg'>Title</label>
                <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500' value={title} type='text' onChange={(e) => setTitle(e.target.value)} />
              </li>

              <li className="flex flex-col w-full mb-6">
                <label className='text-lg'>Location</label>
                <Autocomplete selectedLocation={location} setSelectedLocation={setLocation} setCoordinates={setCoordinates}/>
              </li>

              <li className="flex flex-col w-full mb-6 mt-2">
                <div className="flex flex-row-start mt-2">
                  <div className="flex flex-col w-1/2 mr-3">
                    <label className="text-2xl font-bold mb-1">From</label>
                    <Calendar value={fromDate} onChange={(e) => setFromDate(e.value)} dateFormat="dd/mm/yy" showIcon hideOnDateTimeSelect readOnlyInput/>
                    <div className="flex justify-center items-center">
                      <TimePicker
                        onChange={setFromTime}
                        value={fromTime}
                        disableClock={true}
                        format="hh:mm a"
                        clearIcon={null}
                        className={'mt-1 p-1 rounded-md focus:border-gold text-md text-gray-600 '}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-1/2 ml-3">
                    <label className="text-2xl font-bold mb-1">To</label>
                    <Calendar value={toDate} onChange={(e) => setToDate(e.target.value)} showIcon dateFormat="dd/mm/yy" readOnlyInput hideOnDateTimeSelect/>
                    <div className="flex justify-center items-center">
                      <TimePicker
                        onChange={setToTime}
                        value={toTime}
                        disableClock={true}
                        format="hh:mm a"
                        clearIcon={null}
                        className={'mt-1 p-1 rounded-md focus:border-gold text-md text-gray-600 '}
                      />
                    </div>
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
            <button type="button" className="bg-gradient-to-l from-cyan to-gold text-white m-4 px-4 py-2  rounded-lg text-lg cursor-pointer hover:opacity-90" onClick={handleUpdateEvent}>
              Update Event
            </button>
          </div>
        </form>
        <div className="lg:flex flex-col items-center justify-center mt-4 ml-4 hidden">
          <img src='/edit.svg' className="size-96" />
        </div>
      </div>
    </div>
  )
}