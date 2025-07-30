import { useParams, useNavigate } from 'react-router-dom'
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

function Profile( { user }) {
  const { uid } = useParams()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState(null)
  const [showModal, setShowModal] = useState(false)
  //The attributes below are used to update the user's profile
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({
    lat: null, lng: null
  })
  const [bio, setBio] = useState("")
  const [refreshKey, setRefreshKey] = useState(0) //used to refresh autocomplete component

  useEffect(() => {
    setIsLoading(true)
    async function fetchUserData () {
      try {
        const res = await fetch(`/api/users/${uid}`)
        const data = await res.json()
        if (data.code !== undefined) throw data // Handle error from API
        setUserData(data)
        const imageRef = ref(storage, `${data.photoURL}`)
        const url = await getDownloadURL(imageRef) //get profile image url
        setImageUrl(url)
      } catch (error) {
        errorHandler(error.code)
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [user, uid])

  useEffect(() => { //set user data as placeholders for profile editing
    if (user?.uid === uid && userData && !showModal) {
      setName(userData.name)
      setLocation(userData.location)
      setCoordinates({ lat : null, lng : null }) //reset to original state
      setBio(userData.bio)
      setRefreshKey((prev) => prev+1) //reset autocomplete component
    }
  }, [user, uid, userData, showModal])

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
      if (coordinates.lat !== null) {
        updates.location = location
        updates.coordinates = coordinates
      }
      if (bio !== userData.bio) updates.bio = bio
      setIsLoading(true)
      const idToken = await user.getIdToken()
      var res = await fetch(`/api/users/update-profile`, {
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
        location: location,
        bio: bio
      }))
      setShowModal(false)
    }
    catch(error) {
      console.log(error)
      errorHandler(error.code)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      if (!verifyFileSize(file)) {
        errorHandler('image/too-large')
        return
      }

      setIsLoading(true)
      const storageRef = ref(storage, `images/profile/${uid}`)
      await uploadBytes(storageRef, file)

      const url = await getDownloadURL(storageRef)

      const idToken = await user.getIdToken()
      var res = await fetch(`/api/users/update-profile`, {
        method : 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
          photoURL:url
        })
      })

      if (!res.ok) {
        res = await res.json()
        throw res
      }

      setImageUrl(url) //re-render profile picture

    } catch(error) {
      console.log(error)
      errorHandler(error.code)
    } finally {
      setIsLoading(false)
    }
  }

  const navigate = useNavigate()
  if (!user?.emailVerified) navigate("/home") // Redirect if email is not verified
  if (isLoading) return <Loading />
  return (
    <div>
      <Header user={user}/>

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
            <Autocomplete key={refreshKey} setSelectedLocation={setLocation} setCoordinates={setCoordinates} setPlaceholder={location} onErrorResetSelected={false}/>
          </li>
          <li className='mt-2'>
            <label className='text-lg p-1'>Biography</label>
            <br />
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

      <div className='bg-gray-100 h-screen pt-20 pl-20 w-screen flex flex-row'>
        <div className='flex flex-col items-center'>
          <img src={imageUrl} className='rounded-full w-48 h-48'/>
          {user?.uid === uid && <label>
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
          <div className='flex flex-col py-3 px-2 mt-8 text-md bg-white rounded-md'>
            <div className='text-3xl mx-1 mb-4'>
              {userData.name}
            </div>
            <div className='flex flex-row items-center mb-4'>
              <IoLocationSharp className='text-gold w-6 mx-1'/>
              {userData.location}
            </div>
            { user?.uid === uid &&
              <button className='flex flex-row items-center justify-center  cursor-pointer text-cyan h-fit w-fit' onClick={() => setShowModal(true)}>
                <AiFillEdit className='w-6 mx-1 text-cyan'/>
                Edit Profile
              </button>
            }
          </div>
        </div>

        <div className='flex flex-col bg-white mt-20 text-md h-3/5 ml-20 w-3/5 rounded-md p-2'>
          <div className='flex flex-row justify-around items-center'>
            <ul className='flex flex-col items-center justify-center'>
              <li className='text-5xl'>
                {userData.eventsCreated}
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

          <hr className='mx-16 my-5'/>

          <div className='flex flex-col mx-10 my-5'>
            <div className='text-3xl mb-3'>
              Biography
            </div>
            <div className='text-md overflow-y-auto'>
              {userData.bio}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile