import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import errorHandler from '../utils/errorHandler.js'
import Loading from '../components/Loading.jsx'
import Header from '../components/Header.jsx'
import { ref, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase.js'
import { IoLocationSharp } from "react-icons/io5"
import { GoClock } from "react-icons/go"
import { utcTimestampToLocal } from '../utils/utcTimestampConversion.js'
import { AiFillEdit } from "react-icons/ai"
import { FaTrashAlt } from "react-icons/fa"
import { RiDeleteBack2Line } from "react-icons/ri"
import Modal from '../components/Modal.jsx'

export default function Event ( { user } ) {
  const { eid } = useParams()
  const [event, setEvent] = useState(null)
  const [eventImgURL, setEventImgURL] = useState(null)
  const [hostImgURL, setHostImgURL] = useState(null)
  const [profileImgUrl, setProfileImgUrl] = useState(null) //current user's profile image url
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()

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
    const fetchEventAndHost = async () => {
      try {
        //fetch event
        var res = await fetch(`/api/events/${eid}`)
        var data = await res.json()
        if (!res.ok) throw data
        setEvent(data)

        //set event img url
        const eventImgRef = ref(storage, data.photoUrl)
        const eventImgUrl = await getDownloadURL(eventImgRef)
        setEventImgURL(eventImgUrl)

        //set host img url
        const hostImgRef = ref(storage, `images/profile/${data.hostedBy}`)
        const hostImgUrl = await getDownloadURL(hostImgRef)
        setHostImgURL(hostImgUrl)

      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEventAndHost()
  }, [eid])

  const handleDelete = async () => {
    try {
      //remove event from database
      const idToken = await user.getIdToken()
      const res = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      })
      if (!res.ok) throw await res.json()

      //remove event image from storage
      const eventImgRef = ref(storage, `images/events/${user.uid}/${event._id}`)
      await deleteObject(eventImgRef)

      navigate('/home')
    } catch (error) {
      console.error(error)
      errorHandler(error.code)
    }
  }

  if (isLoading) return <Loading />
  return (
    <div className='w-screen min-h-screen bg-white overflow-x-hidden overflow-y-hidden'>
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className='flex flex-col items-center justify-center text-lg'>
          <p className='mb-2 text-gray-500'>Are you sure?</p>
          <button className='rounded-lg bg-red-500 p-3 text-white hover:opacity-80 cursor-pointer flex flex-row items-center' onClick={handleDelete}> Delete <RiDeleteBack2Line className='inline ml-2' />
          </button>
        </div>
      </Modal>
      { (user && profileImgUrl) ? <Header user={user} profileImgUrl={profileImgUrl} /> : <Header user={user} />}
      <h2 className='w-screen h-48 pl-4 py-4 flex flex-col justify-center items-start p-2 border-b-2 border-gray-300'>
        <div className='mb-4 text-5xl font-tinos h-1/2'>{event.title}</div>
        <div className='flex flex-row items-center w-full h-1/2 justify-between'>
          <div className='flex flex-row items-center'>
            <Link to={`/users/${event.hostedBy}`}>
              <img src={hostImgURL} className='rounded-full w-20 h-20 mr-2' />
            </Link>
            <div className='flex flex-col text-lg'>
              <div>Hosted by</div>
              <div className='font-bold'>{event.hostName}</div></div>
          </div>

          {user?.uid === event.hostedBy &&
          <div className='flex flex-row items-center mr-4'>
            <Link to={`/events/edit/${event._id}`}>
              <div className='mr-12 rounded-lg bg-cyan p-4 text-white hover:opacity-80 flex flex-row items-center'> <AiFillEdit className='inline mr-2' /> Edit Event </div>
            </Link>
            <button className='rounded-lg bg-red-500 p-4 text-white hover:opacity-80 cursor-pointer flex flex-row items-center' onClick={() => setShowDeleteModal(true)}> <FaTrashAlt className='inline mr-2' /> Delete Event
            </button>
          </div>}
        </div>
      </h2>

      <div className='flex flex-row w-screen h-screen bg-gray-100 p-4 pt-10'>
        <div className='flex flex-col w-2/3 h-full'>
          <img src={eventImgURL} className='rounded-xl w-3/4 h-[32rem] mb-4'/>
          <div className='text-lg p-4 flex flex-col items-start justify-start'>
            <h3 className='text-2xl font-bold mb-2'>Details</h3>
            <p className='text-[16px] overflow-y-scroll'>{event.details}</p>
            <button className='text-cyan mt-4 hover:underline text-lg cursor-pointer font-tinos' onClick={() => {
              //todo
            }}> View Attendees </button>
          </div>
        </div>

        <div className='flex flex-col w-1/3 h-full items-center'>
          <div className='bg-white w-96 h-48 rounded-lg flex flex-col p-4 mt-20 justify-evenly pb-4'>
            <div className='flex flex-row justify-start items-center'>
              <IoLocationSharp className='size-8 text-gray-300 mr-2 shrink-0' />
              <span className='text-lg'>{event.locationName}</span>
            </div>
            <div className='flex flex-row justify-start mt-2 items-center'>
              <GoClock className='size-8 text-gray-300 mr-2 shrink-0' />
              <span className='text-lg'>{utcTimestampToLocal(event.eventStart, event.timeZoneId)} {" "} - <br />{utcTimestampToLocal(event.eventEnd, event.timeZoneId)} {" "} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}