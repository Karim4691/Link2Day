import { useEffect, useState } from 'react'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import ErrorHandler from '../utils/errorHandler.js'
import { CiSearch } from "react-icons/ci"

/*
@param {string} selectedLocation - The currently selected location
@param {function} setSelectedLocation - Function to update the selected location
@param {function} setCoordinates - Function to update the coordinates
@param {string} placeholder - Placeholder text for the input
@param {boolean} onErrorFailToResetSelected - Whether to reset the selected location on an error, this is used when updating the user profile
@param {string} inputClassName - Custom class name for the input
@param {boolean} showIcon - Whether to show the search icon
*/
function Autocomplete( { selectedLocation, setSelectedLocation, setCoordinates, placeholder, onErrorFailToResetSelected, inputClassName, showIcon, onIconClick } ) {
  const [location, setLocation] = useState('') //Used to store the user's input (and not the selection, this avoids a mismatch between the coordinates and the selected location)

  useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation)
    }
  }, [selectedLocation])

  const onError = (status, clearSuggestions) => {
    console.log('Google Maps API returned error with status: ', status)
    clearSuggestions()
  }

  const handleSelect = async (selected) => {
    try {
      if (location.split(',').length === 1 && location.split('-').length === 1) { //UAE and other uses dashes instead of commas
        const error = new Error("Must specify city or state")
        error.code = "auth/missing-city-or-state"
        throw error
      }
      const results = await geocodeByAddress(selected)
      const lat_lon = await getLatLng(results[0])
      setSelectedLocation(selected)
      setCoordinates(lat_lon)
    }
    catch (error) {
      setLocation('')
      if (!onErrorFailToResetSelected) {
        setSelectedLocation('')
        setCoordinates({ lat: null, lng: null })
      }
      ErrorHandler(error.code)
      console.log(error)
    }
  }

  return (
    <PlacesAutocomplete value={location} onChange={setLocation} onSelect={handleSelect} onError={onError} >
      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
        <div className='relative'>
          <input {...getInputProps({
            className: inputClassName || 'border border-gray-300 mt-1 p-1 rounded-md shadow-lg focus:outline-none focus:border-gold text-lg hover:border-gray-500 w-full',
            placeholder : placeholder || ""
          })} />
          {showIcon &&
            <button type='button' className="absolute h-full cursor-pointer right-0 top-0 rounded-r-md bg-gold w-1/5 flex items-center justify-center" onClick={onIconClick}>
              <CiSearch className="text-white text-2xl"/>
            </button>
          }

          <div className='bg-gray-100 rounded-md my-1 z-50 absolute w-full overflow-y-auto'>
            {suggestions.map((suggestion, index) => {
              const className = "cursor-pointer text-lg px-2 py-1 hover:text-gold"
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
