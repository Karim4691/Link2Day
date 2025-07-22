import { useState } from 'react'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import ErrorHandler from '../utils/errorHandler.js'

function Autocomplete( { setSelectedLocation, setCoordinates } ) {
  const [location, setLocation] = useState('') //Used to store the user's input

  const onError = (status, clearSuggestions) => {
    console.log('Google Maps API returned error with status: ', status)
    clearSuggestions()
  }

  const handleSelect = async (selected) => {
    try {
      const addr_array = location.split(',')
      if (addr_array.length === 1) {
        const error = new Error("Must specify city or state")
        error.code = "auth/missing-city-or-state"
        throw error
      }
      const results = await geocodeByAddress(selected)
      const lat_lon = await getLatLng(results[0])
      setSelectedLocation(selected)
      setCoordinates(lat_lon)
      console.log('Coordinates: ', lat_lon)
      console.log(selected)
    }
    catch (error) {
      setLocation('')
      setSelectedLocation('')
      setCoordinates({ lat: null, lng: null })
      ErrorHandler(error)
      console.log(error)
    }
  }

  return (
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
  )
}
export default Autocomplete
