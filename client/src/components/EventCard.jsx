export default function EventCard({ event }) {
  return (
    <div className="">
      <h2>{event.title}</h2>
      <p>{event.details}</p>
    </div>
  )
}