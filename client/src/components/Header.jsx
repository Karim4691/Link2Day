import { CiSearch } from "react-icons/ci"
import { IoChatbubbleOutline } from "react-icons/io5"
import { LiaUserFriendsSolid } from "react-icons/lia"
import { CgProfile } from "react-icons/cg"
import { useRef, useState } from "react"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

function Header( { user } ) {
  const [selectProfile, setSelectProfile] = useState(false)
  const navigate = useNavigate()
  const dropdown = useRef(null)
  const profile = useRef(null)

  const handleProfile = () => {setSelectProfile(!selectProfile)}
  const handleYourEvents = () => {navigate('/Your-events')}
  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigate('/'))
      .catch((error) => console.log(error))
  }
  const handleViewProfile = () => {navigate(`/users/${user.uid}`)}


  //Handle a user click outside of the profile dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdown.current && !(dropdown.current).contains(e.target) && !(profile.current).contains(e.target)) setSelectProfile(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative mt-4 px-10 py-3 flex flex-row items-center border-b border-gray-300 w-screen h-24">
      <div className="font-sacramento text-gold text-5xl cursor-pointer mr-5" onClick={() => navigate('/Home')}>
        Link2Day
      </div>

      <div className="relative flex flex-row items-center justify-center w-2/5 mx-5">
        <input className="w-1/2 border border-gray-300 py-2 p-1 rounded-l-md shadow-inner focus:outline-gold text-sm hover:border-gray-500" type="text" />
        <div className="relative w-1/2">
          <input className="w-full border border-gray-300 py-2 p-1 rounded-r-md shadow-inner focus:outline-gold text-sm hover:border-gray-500" type="text" />
          <div className="absolute h-full cursor-pointer right-0 top-0 rounded-r-md bg-gold w-1/5 flex items-center justify-center">
            <CiSearch className="text-white text-2xl"/>
          </div>
        </div>
      </div>

      { !user?.emailVerified &&
        <div className="absolute h-full right-0 flex flex-row items-center">
          <button type='button' className="mr-4 cursor-pointer text-black hover:text-gold" onClick={() => navigate('/')}>Log in</button>
          <button type='button' className="p-3 mx-4 rounded-md bg-gold text-white text-sm cursor-pointer hover:shadow-lg" onClick={() => navigate('/?sign-up=true')}>Sign up</button>
        </div>
      }

      { user?.emailVerified &&
        <div className='absolute h-full right-0 flex flex-row items-center justify-end'>
          <div className="flex flex-col justify-center items-center mx-2 hover:text-gold cursor-pointer h-full" >
            <button className="cursor-pointer">
              <IoChatbubbleOutline className="text-2xl"/>
            </button>
            <div className="text-xs">Messages</div>
          </div>
          <div className="flex flex-col justify-center items-center hover:text-gold cursor-pointer mx-2">
            <button className="cursor-pointer">
              <LiaUserFriendsSolid className="text-2xl"/>
            </button>
            <div className="text-xs">Connections</div>
          </div>
          <button className="hover:text-gold ml-2 text-3xl cursor-pointer font-normal mr-4" onClick={handleProfile} ref={profile}>
            <CgProfile />
          </button>
        </div>
      }

      {selectProfile &&
      <div className="absolute flex flex-col right-4 mt-48 w-48 rounded-md shadow-lg ring-1 ring-black/30 bg-white" ref={dropdown}>
        <div className="cursor-pointer text-xs mx-2 my-4 hover:text-gold w-fit" onClick={handleViewProfile}>
          View profile
        </div>
        <div className="cursor-pointer text-xs mx-2 hover:text-gold w-fit" onClick={handleYourEvents}>
          Your events
        </div>
        <div className="cursor-pointer text-xs mx-2 my-4 hover:text-gold w-fit" onClick={handleSignOut}>
          Log out
        </div>
      </div>}
    </div>
  )
}

export default Header
