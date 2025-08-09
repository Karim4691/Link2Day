import { Link } from "react-router-dom"
import { utcTimestampToLocal } from "../utils/utcTimestampConversion.js"

export default function EventCard({ event }) {

  return (
    <Link to={`/events/${event._id}`}>
      <div className="text-left flex flex-row items-start cursor-pointer h-36 pr-2 mb-6 w-fit">
        <img src={event.photoUrl} alt="Event" className='h-full mr-2 p-2 rounded-xl w-32 md:w-64' />
        <div className='flex flex-col h-full justify-evenly ml-2'>
          <h3 className='text-lg text-[#C19A6B] line-clamp-2 w-36 md:w-72'>{utcTimestampToLocal(event.eventStart, event.timeZoneId)}</h3>
          <p className='font-semibold text-lg line-clamp-2 w-36 md:w-72'>{event.title}</p>
          <p className='text-gray-500 text-sm line-clamp-2 w-36 md:w-72'>Hosted by {event.hostName} {" · "} {event.locationName}</p>
          <p className="text-gray-500 text-[16px] text-right"> {event.attendees.length} attendee{event.attendees.length === 0 ? "s" : ""} </p>
        </div>
      </div>
    </Link>
  )
}