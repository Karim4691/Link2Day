import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.js'
import { Navigate } from 'react-router-dom'
import Autocomplete from '../components/Autocomplete.jsx'
import errorHandler from '../utils/errorHandler.js'
import SpinLoader from '../components/SpinLoader.jsx'
import { verifyName, verifyEmail, verifyLocation, verifyPassword } from '../utils/validators.js'

function Authentication({ user }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("") //Used to store the selected address from PlacesAutocomplete
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [isSignUpActive, setIsSignUpActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to Home if user is already authenticated
  if(user) {
    return <Navigate to='/Home' />
  }

  const handleSignUpChange = () => {
    setName('')
    setEmail('')
    setPassword('')
    setSelectedLocation('')
    setCoordinates({ lat: null, lng: null })
    setIsSignUpActive(!isSignUpActive)
  }

  const handleSignUp = async () => {
    var error = new Error("Invalid input")
    setIsLoading(true)
    try {
      if (!verifyName(name)) error.code = "auth/invalid-name"
      else if (!verifyEmail(email)) error.code = "auth/invalid-email"
      else if (!verifyPassword(password)) error.code = "auth/invalid-password"
      else if (!verifyLocation(coordinates)) error.code = "auth/invalid-location"

      if (error.code) throw error

      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: name,
          email: email,
          password: password,
          location: selectedLocation,
          coordinates: coordinates,
        })
      })

      if (!res.ok) {
        const res = await res.json()
        error.message = res.message
        error.code = res.code
        throw error
      }
    } catch (error) {
      console.log(error.code)
      errorHandler(error.code)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    setIsLoading(true)
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      console.log(userCredential.user)
    })
      .catch((error) => {
        const [errorCode, errorMessage] = [error.code, error.message]
        console.log(errorCode, errorMessage)
        errorHandler(error)
      })
      .finally(() => setIsLoading(false))
  }

  const handleEmailChange = (event) => setEmail(event.target.value)
  const handlePasswordChange = (event) => setPassword(event.target.value)
  const handleNameChange = (event) => setName(event.target.value)

  return (
    <section className='absolute h-full w-full flex flex-col'>
      <h1 className='flex-1/12 font-sacramento bg-gold text-center text-4xl py-3 text-white cursor-default'>
        Link2Day
      </h1>

      <form className='flex flex-col flex-11/12 items-center'>
        {isSignUpActive &&
          <legend className='text-2xl mt-20 w-2/6'>Create an account
            <br /> <div className='text-sm text-gray-500'>Please enter your details</div>
          </legend>
        }
        {!isSignUpActive &&
        <legend className='text-2xl mt-20 w-2/6'>Welcome back
          <br /> <div className='text-sm text-gray-500'>Please enter your details</div>
        </legend>}

        <fieldset className='flex flex-col mt-4 w-2/6'>
          <ul className='flex flex-col'>
            {
              isSignUpActive &&
                  <li className='flex flex-col mb-6'>
                    <label className='text-sm'>Your name</label>
                    <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' value={name} type='text' onChange={handleNameChange}/>
                  </li>
            }
            {
              isSignUpActive &&
                  <li className='flex flex-col mb-6'>
                    <label className='text-sm'>Location</label>
                    <Autocomplete setSelectedLocation={setSelectedLocation} setCoordinates={setCoordinates}/>
                  </li>
            }
            <li className='flex flex-col'>
              <label className='text-sm' htmlFor='email'>Email address</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' value={email} type='text' onChange={handleEmailChange}/>
            </li>
            <li className='flex flex-col mt-6'>
              <label className='text-sm' htmlFor='password'>Password</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' value={password} type='password' onChange={handlePasswordChange}/>
            </li>
          </ul>

          {isSignUpActive && <button className='relative bg-black text-white rounded-md my-6 py-2 text-sm cursor-pointer hover:opacity-80' type='button' onClick={handleSignUp}>
            { isLoading &&
            <div className='absolute h-full right-3 top-0 flex items-center justify-center'>
              <SpinLoader />
            </div>
            }
            Sign up</button>}
          {!isSignUpActive && <button className='relative bg-black text-white rounded-md my-6 py-2 text-sm cursor-pointer hover:opacity-80' type='button' onClick={handleSignIn}>
            { isLoading &&
            <div className='absolute h-full right-3 top-0 flex items-center justify-center'>
              <SpinLoader />
            </div>
            }
            Sign in</button>}
        </fieldset>
        {isSignUpActive &&
        <div className='flex flex-row items-center justify-center w-2/6'>
          <div className='text-sm text-black/80 pr-3'>
            Already have an account?</div>
          <a className='text-gold underline text-sm my-3 cursor-pointer' onClick={handleSignUpChange}>Log in</a>
        </div>}
        {!isSignUpActive &&
        <div className='flex flex-row items-center justify-center w-2/6'>
          <div className='text-sm text-black/80 pr-3'> Don't have an account?</div>
          <a className='text-gold text-sm underline my-3 cursor-pointer' onClick={handleSignUpChange}>Sign up</a>
        </div>}
      </form>
    </section>
  )
}

export default Authentication
