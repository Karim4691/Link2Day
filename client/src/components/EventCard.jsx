import { useNavigate } from "react-router-dom"
import { utcTimestampToLocal } from "../utils/utcTimestampConversion.js"

export default function EventCard({ event, eventImgUrl }) {
  const navigate = useNavigate()

  if (!event || !eventImgUrl) return null // wait for event data to be fetched
  return (
    <button type='button' className="text-left flex flex-row items-start cursor-pointer h-36 pr-2 mb-6 w-fit" onClick={() => navigate(`/events/${event._id}`)}>
      <img src={eventImgUrl} alt="Event" className='h-full mr-2 p-2 rounded-xl w-64' />
      <div className='flex flex-col h-full justify-evenly ml-2'>
        <h3 className='text-lg text-[#C19A6B]'>{utcTimestampToLocal(event.eventStart, event.timeZoneId)}</h3>
        <p className='font-semibold text-lg line-clamp-2 max-w-72'>{event.title}</p>
        <p className='text-gray-500 text-sm line-clamp-2 max-w-72'>Hosted by {event.hostName} {" · "} {event.locationName}</p>
        <p className="text-gray-500 text-[16px] text-right"> {event.attendees.length + 1} attendee{event.attendees.length === 0 ? "" : "s"} </p> {/* +1 to include host */}
      </div>
    </button>
  )
}