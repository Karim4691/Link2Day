import Header from '../components/Header.jsx'
import { FaPlus } from "react-icons/fa"
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

function YourEvents({ user }) {
  const [selectedOpt, setSelectedOpt] = useState("hosting")
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })

  const navigate = useNavigate()

  if (!user?.emailVerified) navigate('/Home')


  return (
    <div>
      <Header user={user} />
      <div className='flex flex-row w-full h-screen'>
        <div className='flex flex-col items-center w-3xl'>
          <div className='flex flex-col justify-evenly bg-gray-100 h-56 w-80 rounded-lg p-2 px-10 mt-32'>
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

        <div className='w-full'>
          <div className='flex flex-row justify-between items-baseline'>
            <h2 className='text-5xl font-bold p-2 mt-12 ml-6'> Your events </h2>
            <button type='button' className='flex flex-row items-center justify-center p-2 cursor-pointer text-white bg-cyan rounded-lg w-fit h-fit mr-10 hover:opacity-80' onClick={() => navigate("/your-events/create")}>
              <FaPlus className='p-1 size-6' />
              <p className='p-1'>Create an event</p>
            </button>
          </div>
          <div className='h-full p-2 mt-10 ml-4 pl-20'>O</div>
        </div>
      </div>
    </div>
  )
}

export default YourEvents
