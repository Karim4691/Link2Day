import Header from '../components/Header.jsx'
import { FaPlus } from "react-icons/fa"

function YourEvents({ user }) {
  return (
    <div>
      <Header user={user} />
      <div className='flex flex-row w-full h-screen'>
        <div className='flex flex-col items-center w-3xl'>
          <div className='flex flex-col justify-evenly bg-gray-100 h-56 w-80 rounded-lg p-2 px-10 mt-32'>
            <div className='text-gray-500 font-bold hover:text-gold cursor-pointer w-fit'>
              Hosting
            </div>
            <div className='text-gray-500 font-bold hover:text-gold cursor-pointer w-fit'>
              Attending
            </div>
            <div className='text-gray-500 font-bold hover:text-gold cursor-pointer w-fit'>
              Past
            </div>
          </div>
        </div>

        <div className='w-full'>
          <div className='flex flex-row justify-between items-baseline'>
            <h2 className='text-5xl font-bold p-2 mt-12 ml-6'> Your events </h2>
            <button type='button' className='relative p-2 text-cyan'>
              Create an event
              <FaPlus className='absolute right-0 top-1/2 mr-10' />
            </button>
          </div>
          <div className='bg-red-300 h-full p-2 mt-10 ml-4 pl-20'>O</div>
        </div>
      </div>
    </div>
  )
}

export default YourEvents
