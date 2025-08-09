export default function NoEventsFound() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-fit h-fit">
        <img src="/no-events.svg" className="size-96 mt-5"/>
        <p className="absolute text-xl bottom-0 left-1/2 -translate-x-1/2">
          No Events Found
        </p>
      </div>
    </div>
  )
}