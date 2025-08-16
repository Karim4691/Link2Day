import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import errorHandler from '../utils/errorHandler'
import Loading from '../components/Loading'
import Header from '../components/Header'
import { storage } from "../firebase.js"
import { AiFillEdit } from "react-icons/ai"
import { IoLocationSharp } from "react-icons/io5"
import Modal from '../components/Modal.jsx'
import { verifyBio, verifyName } from '../utils/validators.js'
import Autocomplete from '../components/Autocomplete.jsx'
import { verifyFileSize } from '../utils/validators.js'
import toast from 'react-hot-toast'

function Profile( { user }) {
  const { uid } = useParams()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserProfileUrl, setCurrentUserProfileUrl] = useState(null) //current user's profile image url (i.e. the user that is logged in)
  const [profileImgUrl, setProfileImgUrl] = useState(null) //profile image url
  const [file, setFile] = useState(null) //profile image
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({
    lat: null, lng: null
  })
  const [bio, setBio] = useState("")
  const [refreshKey, setRefreshKey] = useState(0) //used to refresh autocomplete component

  //Load the current and selected user's profile image
  useEffect(() => {
    async function fetchUserProfileImage() {
      try {
        if (user) { // Load the current user's profile image
          const currentImgRef = ref(storage, `images/profile/${user.uid}`)
          const currentUrl = await getDownloadURL(currentImgRef)
          setCurrentUserProfileUrl(currentUrl)
        }
        const imgRef = ref(storage, `images/profile/${uid}`) // Load the profile image of the user being viewed
        const url = await getDownloadURL(imgRef)
        setProfileImgUrl(url)
      } catch (error) {
        console.error("Error fetching user profile image:", error)
      }
    }
    fetchUserProfileImage()
  }, [user, uid])

  useEffect(() => {
    setIsLoading(true)
    async function fetchUserData () {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${uid}`)
        const data = await res.json()
        if (data.code !== undefined) throw data // Handle error from API
        setUserData(data)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [uid])

  useEffect(() => { //set user data as placeholders for profile editing/reset any uncommitted changes towards the profile editing
    if (user?.uid === uid && userData && !showModal) {
      setName(userData.name)
      setLocation(userData.locationName)
      setCoordinates({ lng: userData.coordinates[0], lat: userData.coordinates[1] })
      setBio(userData.bio)
      setRefreshKey((prev) => prev+1) //reset autocomplete component
    }
  }, [user, uid, userData, showModal])

  useEffect(() => { //used to re-render profile image when user uploads a new image
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setProfileImgUrl(objectUrl)
    setCurrentUserProfileUrl(objectUrl) //also update current user's profile image url

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleUpdateProfile = async () => {
    try {
      //ensure the bio and name are valid
      if (!verifyName(name)) {
        errorHandler('auth/invalid-name')
        return
      }
      if (!verifyBio(bio)) {
        errorHandler('auth/invalid-bio')
        return
      }

      const updates = {} //updates to implement
      if (name !== userData.name) updates.name=name
      if (userData.locationName !== location) {
        updates.locationName = location
        updates.location = {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        }
      }
      if (bio !== userData.bio) updates.bio = bio
      const idToken = await user.getIdToken()
      var res = await fetch(`${import.meta.env.VITE_API_URL}/users/update-profile`, {
        method : 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify(updates)
      })

      if (!res.ok) {
        res = await res.json()
        throw res
      }

      setUserData((data) => ({
        ...data,
        name: name,
        locationName: location,
        bio: bio
      }))
      setShowModal(false)
      toast.success('Profile updated!')
    }
    catch(error) {
      console.log(error)
      errorHandler(error.code)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      if (!verifyFileSize(file)) {
        errorHandler('image/too-large')
        return
      }
      const imageRef = ref(storage, `images/profile/${user.uid}`)
      await uploadBytes(imageRef, file)

      //trigger re-render of profile image
      setFile(file)
    } catch(error) {
      console.log(error)
      errorHandler(error.code)
    }

  }

  if (isLoading) return <Loading />
  return (
    <div className='w-fit min-h-screen h-full bg-gray-100 pb-4'>
      { (user && profileImgUrl) ? <Header user={user} profileImgUrl={currentUserProfileUrl} /> : <Header user={user} />}

      {user?.uid === uid && <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ul>
          <li>
            <label className='text-lg p-1'>Name</label>
            <br />
            <input className='border border-gray-300 mt-2 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500 w-full' value={name} type='text' onChange={(e) => setName(e.target.value)}/>
          </li>
          <li className='mt-2'>
            <label className='text-lg p-1'>Location</label>
            <br />
            <Autocomplete key={refreshKey} selectedLocation={location} setSelectedLocation={setLocation} setCoordinates={setCoordinates} onErrorFailToResetSelected={true}/>
          </li>
          <li className='mt-2'>
            <label className='text-lg p-1'>Biography</label>
            <textarea className='border border-gray-300 mt-2 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500 w-full overflow-y-scroll overflow-x-hidden' value={bio} onChange={(e) => setBio(e.target.value)}/>
          </li>
        </ul>

        <div className='flex justify-center items-center'>
          <button type='button' className='bg-gold text-white rounded-md mt-6 px-6 py-3 text-lg cursor-pointer hover:opacity-80' onClick={handleUpdateProfile}>
            Update profile
          </button>
        </div>
      </Modal>
      }

      <div className='min-h-screen py-10 px-10 lg:px-20 flex flex-col lg:flex-row items-center lg:items-start lg:justify-center justify-start'>
        <div className='flex flex-col items-center'>
          <img src={profileImgUrl} className='rounded-full w-48 h-48'/>
          {user?.uid === uid &&
          <label>
            <input className='hidden' type='file' accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }} id='img'/>
            <div className='bg-cyan text-white rounded-md mt-6 px-6 py-3 text-lg cursor-pointer hover:opacity-80'>
              Edit Picture
            </div>
          </label>
          }
          <div className='flex flex-col py-3 px-2 mt-8 text-md bg-white rounded-md lg:w-96'>
            <div className='text-3xl mx-1 mb-4'>
              {userData.name}
            </div>
            <div className='flex flex-row items-center mb-4 text-lg'>
              <IoLocationSharp className='text-gold size-6 mx-1 shrink-0'/>
              {userData.locationName}
            </div>
            { user?.uid === uid &&
              <button className='flex flex-row items-center justify-center  cursor-pointer text-cyan h-fit w-fit text-lg' onClick={() => setShowModal(true)}>
                <AiFillEdit className='size-6 mx-1 text-cyan shrink-0'/>
                Edit Profile
              </button>
            }
          </div>
        </div>

        <div className='flex flex-col bg-white mt-20 lg:ml-10 w-[300px] md:w-[500px] lg:w-[800px] rounded-md p-2 overflow-y-scroll'>
          <div className='flex flex-row justify-around items-center'>
            <ul className='flex flex-col items-center justify-center'>
              <li className='text-5xl'>
                {userData.eventsHosted}
              </li>
              <li>
                Events Hosted
              </li>
            </ul>

            <ul className='flex flex-col items-center justify-center'>
              <li className='text-5xl'>
                {userData.eventsJoined}
              </li>
              <li>
                RSVP
              </li>
            </ul>
          </div>

          <hr className='mx-8 lg:mx-16 my-5'/>

          <div className='flex flex-col mx-5 lg:mx-10 my-0 lg:my-5'>
            <div className='text-3xl mb-3'>
              Biography
            </div>
            <div className='text-md min-h-32 break-words'>
              {userData.bio}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile