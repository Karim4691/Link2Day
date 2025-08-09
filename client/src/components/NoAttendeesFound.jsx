export default function NoAttendeesFound() {
  return (
    <div className="relative w-full h-full flex flex-col items-center -mt-12">
      <img src="/no-attendees.svg" className="size-84" />
      <p className="text-xl -mt-8">
        No Attendees Found
      </p>
    </div>
  )
}