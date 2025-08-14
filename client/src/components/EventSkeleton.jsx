import Skeleton from 'react-loading-skeleton'

const EventSkeleton = ({ nb_cards }) => {
  return (
    Array(nb_cards).fill(0).map( (_, idx) => {
      return <li key={idx} className="flex flex-row items-start h-24 pr-2 mb-6">
        <div className='w-36 md:w-48 h-full'>
          <Skeleton className='h-full mr-2 p-2 text-gray-300' />
        </div>
        <div className='flex flex-col w-full h-full'>
          <div className='w-64 md:w-72'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-36 md:w-48'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-48 md:w-56'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-56 md:w-64'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
        </div>
      </li>
    })
  )
}

export default EventSkeleton
