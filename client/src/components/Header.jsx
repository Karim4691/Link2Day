import { CiSearch } from "react-icons/ci"
import { useRef, useState } from "react"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "../firebase.js"
import Loading from "./Loading.jsx"
import Autocomplete from "./Autocomplete.jsx"

function Header( { user, profileImgUrl } ) {
  const [selectProfile, setSelectProfile] = useState(false)
  const [imgUrl, setImgUrl] = useState(profileImgUrl) // user's profile image url
  const [isLoading, setIsLoading] = useState(false) // loading state for profile image
  const [location, setLocation] = useState("") // search location
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null }) // user's coordinates
  const [search, setSearch] = useState("") // search query

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

  useEffect(() => {
    setIsLoading(true)
    async function fetchProfileImage() {
      try {
        if (user?.emailVerified) {
          const imgRef = ref(storage, `images/profile/${user.uid}`)
          setImgUrl(await getDownloadURL(imgRef))
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfileImage()
  }, [user])

  useEffect(() => {
    if (profileImgUrl) {
      setImgUrl(profileImgUrl)
    }
  }, [profileImgUrl])

  if (isLoading) return <Loading />

  return (
    <div className="relative mt-4 px-10 py-3 flex flex-row items-center border-b border-gray-300 w-screen h-24">
      <div className="font-sacramento text-gold text-5xl cursor-pointer mr-5" onClick={() => navigate('/Home')}>
        Link2Day
      </div>

      <div className="relative flex flex-row items-center justify-center w-xl mx-5">
        <input className="w-64 border border-gray-300 py-2 p-1 rounded-l-md shadow-inner focus:outline-gold text-sm hover:border-gray-500" type="text" />
        <Autocomplete setSelectedLocation={setLocation} setCoordinates={setCoordinates}
          inputClassName={"relative w-64 border border-gray-300 py-2 p-1 rounded-r-md shadow-inner focus:outline-gold text-sm hover:border-gray-500 pr-14"} showIcon/>
      </div>

      { !user?.emailVerified &&
        <div className="absolute h-full right-0 flex flex-row items-center">
          <button type='button' className="mr-4 cursor-pointer text-black hover:text-gold" onClick={() => navigate('/')}>Log in</button>
          <button type='button' className="p-3 mx-4 rounded-md bg-gold text-white text-sm cursor-pointer hover:shadow-lg" onClick={() => navigate('/?sign-up=true')}>Sign up</button>
        </div>
      }

      { user?.emailVerified &&
        <div className='absolute h-full right-0 flex items-center justify-end'>
          <button className="hover:text-gold ml-2 text-3xl cursor-pointer font-normal mr-8" onClick={handleProfile} ref={profile}>
            {imgUrl && <img src={imgUrl} alt="Profile" className="size-16 rounded-full"/>}
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
