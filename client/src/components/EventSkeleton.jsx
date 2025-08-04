import Skeleton from 'react-loading-skeleton'

const EventSkeleton = ({ nb_cards }) => {
  return (
    Array(nb_cards).fill(0).map( (_, idx) => {
      return <div key={idx} className="flex flex-row items-start h-24 pr-2 mb-6">
        <div className='w-48 h-full'>
          <Skeleton className='h-full mr-2 p-2 text-gray-300' />
        </div>
        <div className='flex flex-col w-full h-full'>
          <div className='w-36'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-48'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-24'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
          <div className='w-36'>
            <Skeleton className='ml-2 text-gray-300'/>
          </div>
        </div>
      </div>
    })
  )
}

export default EventSkeleton
