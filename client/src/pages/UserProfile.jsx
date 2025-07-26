import { Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDownloadURL, ref } from "firebase/storage"
import errorHandler from '../utils/errorHandler'
import Loading from '../components/Loading'
import Header from '../components/Header'
import { storage } from "../firebase.js"
import { AiFillEdit } from "react-icons/ai"
import { IoLocationSharp } from "react-icons/io5"

function Profile( { user }) {
  const { uid } = useParams()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/users/${uid}`)
      .then(res => {
        return res.json()
      })
      .then(res => {
        if (res.code !== undefined) throw res // Handle error from API
        setUserData(res)
        const imageRef = ref(storage, `${res.photoURL}`)
        return getDownloadURL(imageRef)
      })
      .then(url => {
        setImageUrl(url)
      })
      .catch(error => {
        errorHandler(error.code)
        console.log(error)
      })
      .finally( () => {
        setIsLoading(false)
      })
  }, [uid])

  if (isLoading) return <Loading />
  if (!userData) return <div>404 :()</div>
  return (
    <div>
      <Header user={user}/>
      <div className='bg-gray-100 h-screen pt-20 pl-20 w-screen flex flex-row'>
        <div className='flex flex-col'>
          <img src={imageUrl} className='rounded-full w-48'/>
          <div className='flex flex-col py-3 px-2 mt-8 text-md bg-white rounded-md'>
            <div className='text-3xl mx-1 mb-4'>
              {userData.name}
            </div>
            <div className='flex flex-row items-center mb-4'>
              <IoLocationSharp className='text-gold w-6 mx-1'/>
              {userData.location}
            </div>
            { user && user.uid === uid &&
              <button className='flex flex-row items-center justify-center  cursor-pointer text-cyan h-fit w-fit'>
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
            <div className='text-md'>
              {userData.bio}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile