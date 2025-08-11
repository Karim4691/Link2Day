import { useRef, useState } from "react"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"
import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"

function Header( { user, profileImgUrl } ) {
  const [selectProfile, setSelectProfile] = useState(false)

  const navigate = useNavigate()
  const dropdown = useRef(null)
  const profile = useRef(null)

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigate('/home'))
      .catch((error) => console.log(error))
  }


  //Handle a user click outside of the profile dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdown.current && !(dropdown.current).contains(e.target) && !(profile.current).contains(e.target)) setSelectProfile(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative pt-4 px-10 py-4 flex flex-row justify-start sm:justify-center items-center border-b w-screen h-32 bg-black">
      <Link to="/home">
        <h1 className="font-sacramento text-gold text-5xl cursor-pointer pr-5">
          Link2Day
        </h1>
      </Link>

      { !user?.emailVerified &&
        <div className="absolute h-full right-0 flex flex-row items-center">
          <Link to="/" className="mr-4 text-white hover:text-gold">
            Log in
          </Link>
          <Link to="/?sign-up=true" className="p-3 px-4 rounded-md bg-gold text-white text-sm hover:opacity-80">
            Sign up
          </Link>
        </div>
      }

      { user?.emailVerified &&
        <div className='absolute h-full w-fit right-0 flex items-center justify-end'>
          <button className="hover:text-gold ml-2 text-3xl cursor-pointer font-normal mr-8" onClick={() => setSelectProfile(!selectProfile)} ref={profile}>
            <img src={profileImgUrl} className="size-16 rounded-full"/>
          </button>
        </div>
      }

      {selectProfile && user &&
      <div className="absolute flex flex-col right-4 mt-48 w-48 rounded-md shadow-lg ring-1 ring-black/30 bg-white z-10" ref={dropdown}>
        <Link to={`/users/${user.uid}`} className="text-xs mx-2 my-4 hover:text-gold w-fit">
          View profile
        </Link>
        <Link to="/your-events" className="text-xs mx-2 hover:text-gold w-fit">
          Your events
        </Link>
        <div className="cursor-pointer text-xs mx-2 my-4 hover:text-gold w-fit" onClick={handleSignOut}>
          Log out
        </div>
      </div>}
    </div>
  )
}

export default Header
