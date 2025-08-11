import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase.js'
import Autocomplete from '../components/Autocomplete.jsx'
import errorHandler from '../utils/errorHandler.js'
import { verifyName, verifyEmail, verifyLocation, verifyPassword } from '../utils/validators.js'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import EmailVerification from '../components/EmailVerification.jsx'
import { storage } from '../firebase.js'
import { ref, uploadBytes } from 'firebase/storage'

function Authentication({ user }) {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("") //Used to store the selected address from PlacesAutocomplete
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [isSignUpActive, setIsSignUpActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [resetPasswordEmail, setResetPasswordEmail] = useState("")

  useEffect( () => {
    const signUp = searchParams.get("sign-up")
    if (signUp === 'true') setIsSignUpActive(true)
    else setIsSignUpActive(false)
  }, [searchParams])


  const navigate = useNavigate()
  // Redirect to Home if user is already authenticated
  useEffect(() => {
    if (user?.emailVerified) navigate('/home')
  }, [user, navigate])

  //handle toggle between sign-up and sign-in
  const handleAuthChange = () => {
    setName('')
    setEmail('')
    setPassword('')
    setSelectedLocation('')
    setCoordinates({ lat: null, lng: null })
    if (!isSignUpActive) navigate('/?sign-up=true')
    else navigate('')
  }

  const handleSignUp = async () => {
    var error = new Error("Invalid input")
    setIsLoading(true)
    try {
      if (!verifyName(name)) error.code = "auth/invalid-name"
      else if (!verifyLocation(coordinates)) error.code = "auth/invalid-location"
      else if (!verifyEmail(email)) error.code = "auth/invalid-email"
      else if (!verifyPassword(password)) error.code = "auth/invalid-password"

      if (error.code) throw error

      // Create user in the database
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: name,
          email: email,
          password: password,
          locationName: selectedLocation,
          location: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat]
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        error.message = data.message
        error.code = data.code
        throw error
      }

      const { uid } = await res.json()
      await signInWithEmailAndPassword(auth, email, password) // Sign in the user after account creation

      // upload default profile image to proper firebase storage path
      const fetchDefaultImage = await fetch('/l.svg')
      const defaultImage = await fetchDefaultImage.blob()
      const storageRef = ref(storage, `images/profile/${uid}`)
      await uploadBytes(storageRef, defaultImage)

      toast.success('Account created successfully! Please verify your email address (check your inbox/spam folder.)')
      navigate('/') // Switch to sign-in
      setIsSignUpActive(false)

    } catch (error) {
      console.log(error)
      errorHandler(error.code)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (!userCredential.user.emailVerified) toast.error("Please verify your email before attempting to sign in (check your inbox/spam folder.)")
      else {
        if (user && !user.emailVerified) await user.reload() //used for email verification
        navigate('/home')
      }
    }
    catch(error) {
      errorHandler(error.code)
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!verifyEmail(resetPasswordEmail)) {
      resetPasswordEmail === '' ? errorHandler('auth/missing-email') : errorHandler('auth/invalid-email')
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetPasswordEmail)
      setShowModal(false)
      toast.success("Please check your inbox/spam folder to change your password.")
    } catch (error) {
      errorHandler(error.code)
    }
  }

  return (
    <div className='absolute min-h-screen w-screen flex flex-col bg-white overflow-y-auto overflow-x-auto'>
      <div className='flex justify-center items-center h-36 bg-black cursor-default w-full'>
        <h1 className='font-sacramento text-6xl text-gold'>
          Link2Day
        </h1>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <label className='text-lg p-1' htmlFor='email'>Email address</label>
        <br />
        <input className='border border-gray-300 mt-2 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500 w-full' value={resetPasswordEmail} type='text' onChange={(e) => setResetPasswordEmail(e.target.value)}/>
        <div className='flex justify-center items-center'>
          <button type='button' className='bg-gold text-white rounded-md mt-6 px-6 py-3 text-lg cursor-pointer hover:opacity-80' onClick={handleResetPassword}>
            Reset password
          </button>
        </div>
      </Modal>

      <form className='flex flex-col flex-11/12 items-center'>
        {isSignUpActive &&
          <legend className='text-3xl mt-20 w-2/6'>Create an account
            <br /> <div className='text-lg text-gray-500'>Please enter your details</div>
          </legend>
        }
        {!isSignUpActive &&
        <legend className='text-3xl mt-20 w-2/6'>Welcome back
          <br />
          <div className='text-lg text-gray-500'>Please enter your details</div>
        </legend>}

        <fieldset className='flex flex-col mt-4 w-2/6'>
          <ul className='flex flex-col'>
            { isSignUpActive &&
              <li className='flex flex-col mb-6'>
                <label className='text-lg'>Your name</label>
                <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500' value={name} type='text' onChange={(e) => setName(e.target.value)}/>
              </li>
            }
            { isSignUpActive &&
              <li className='flex flex-col mb-6'>
                <label className='text-lg'>Location</label>
                <Autocomplete setSelectedLocation={setSelectedLocation} setCoordinates={setCoordinates}/>
              </li>
            }
            <li className='flex flex-col'>
              <label className='text-lg' htmlFor='email'>Email address</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500' value={email} type='text' onChange={(e) => setEmail(e.target.value)}/>
              { user && !user.emailVerified && !isSignUpActive &&
                <div className="flex justify-end">
                  <EmailVerification user={user}/>
                </div>
              }
            </li>
            <li className='flex flex-col mt-6'>
              <label className='text-lg' htmlFor='password'>Password</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500' value={password} type='password' onChange={(e) => setPassword(e.target.value)}/>
            </li>
          </ul>

          {isSignUpActive &&
          <button className='relative bg-black text-white rounded-md my-6 py-2 text-lg cursor-pointer hover:opacity-80' type='button' onClick={handleSignUp}>
            { isLoading &&
            <div className='absolute h-full right-3 top-0 flex items-center justify-center'>
              <img src='/spin.svg' className="w-6"/>
            </div>
            }
            Sign up
          </button>}

          {!isSignUpActive &&
            <div className='flex justify-end'>
              <button type='button' className='text-gold underline text-lg mt-4 cursor-pointer' onClick={() => setShowModal(true)}>
                Forgot password
              </button>
            </div>
          }
          {!isSignUpActive &&
          <button className='relative bg-black text-white rounded-md my-6 py-2 text-lg cursor-pointer hover:opacity-80' type='button' onClick={handleSignIn}>
            { isLoading &&
            <div className='absolute h-full right-3 top-0 flex items-center justify-center'>
              <img src='/spin.svg' className="w-6"/>
            </div>
            }
            Sign in
          </button>}
        </fieldset>
        {isSignUpActive &&
        <div className='flex flex-row items-center justify-center w-2/6'>
          <div className='text-lg text-black/80 pr-3'>
            Already have an account?</div>
          <a className='text-gold underline text-lg my-3 cursor-pointer' onClick={handleAuthChange}>Log in</a>
        </div>}
        {!isSignUpActive &&
        <div className='flex flex-row items-center justify-center w-2/6'>
          <div className='text-lg text-black/80 pr-3'> Don't have an account?</div>
          <a className='text-gold text-lg underline my-3 cursor-pointer' onClick={handleAuthChange}>Sign up</a>
        </div>}
      </form>
    </div>
  )
}

export default Authentication