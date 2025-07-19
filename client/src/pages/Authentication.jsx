import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase.js'
import { Navigate } from 'react-router-dom'
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete'

function Authentication({ user }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
  const [isSignUpActive, setIsSignUpActive] = useState(true)

  // Redirect to Home if user is already authenticated
  if(user) {
    return <Navigate to='/Home' />
  }

  const handleSignUpChange = () => {
    setIsSignUpActive(!isSignUpActive)
  }

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth,email,password).then((userCredential) => {
      const user = userCredential.user
      console.log(user)
    }).catch((error) => {
      const [errorCode, errorMessage] = [error.code, error.message]
      console.log(errorCode, errorMessage)
    })
  }

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      console.log(userCredential.user)
    })
      .catch((error) => {
        const [errorCode, errorMessage] = [error.code, error.message]
        console.log(errorCode, errorMessage)
      })
  }

  const handleEmailChange = (event) => setEmail(event.target.value)
  const handlePasswordChange = (event) => setPassword(event.target.value)
  const handleNameChange = (event) => setName(event.target.value)


  const handleSelect = async (selected) => {
    try {
      console.log(location)
      const addr_array = location.split(',')
      if (addr_array.length === 1) {
        const error = new Error("Must specify city or state")
        error.code = 400
        throw error
      }
      const results = await geocodeByAddress(selected)
      const lat_lon = await getLatLng(results[0])
      console.log('Coordinates: ', lat_lon)
      setCoordinates(lat_lon)
    }
    catch (error) {
      setLocation('')
      console.log(error)
    }
  }

  const onError = (status, clearSuggestions) => {
    console.log('Google Maps API returned error with status: ', status)
    clearSuggestions()
  }

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
                    <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' type='text' onChange={handleNameChange}/>
                  </li>
            }
            <li className='flex flex-col'>
              <label className='text-sm' htmlFor='email'>Email address</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' type='text' onChange={handleEmailChange}/>
            </li>
            <li className='flex flex-col mt-6'>
              <label className='text-sm' htmlFor='password'>Password</label>
              <input className='border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500' type='password' onChange={handlePasswordChange}/>
            </li>
            {
              isSignUpActive &&
                  <li className='flex flex-col mt-6'>
                    <label className='text-sm'>Location</label>
                    <PlacesAutocomplete value={location} onChange={setLocation} onSelect={handleSelect} onError={onError} >
                      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                        <div className='relative'>
                          <input {...getInputProps({
                            className: 'border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-sm hover:border-gray-500 w-full'
                          })} />

                          <div className='bg-gray-100 rounded-md my-1 z-50 absolute w-full overflow-y-auto'>
                            {suggestions.map((suggestion, index) => {
                              const className = "cursor-pointer text-sm px-2 py-1 hover:text-gold"
                              return (
                                <div {...getSuggestionItemProps(suggestion, { className }) } key={index} onMouseEnter={() => setLocation(suggestion.description)}>
                                  {suggestion.description}
                                </div>
                              )
                            }) }
                          </div>
                        </div>
                      )
                      }
                    </PlacesAutocomplete>
                  </li>
            }
          </ul>

          {isSignUpActive && <button className='bg-black text-white/90 rounded-md my-6 py-2 text-sm cursor-pointer hover:text-white/100' type='button' onClick={handleSignUp}>Sign up</button>}
          {!isSignUpActive && <button className='bg-black text-white/90 rounded-md my-6 py-2 text-sm cursor-pointer hover:text-white/100' type='button' onClick={handleSignIn}>Sign in</button>}
        </fieldset>
        {isSignUpActive &&
        <div className='flex flex-row items-center justify-center w-2/6'>
          <div className='text-sm text-black/80 pr-3'> Already have an account?</div>
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
