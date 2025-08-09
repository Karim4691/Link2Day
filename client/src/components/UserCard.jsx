import { Link } from 'react-router-dom'

export default function UserCard({ user }) {
  return (
    <Link to={`/users/${user._id}`}>
      <div className="flex flex-row p-4 w-full">
        <img src={user.imgUrl} alt={`${user.name}'s avatar`} className="w-16 h-16 rounded-full" />
        <div className="flex flex-col ml-4">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600 line-clamp-2">{user.bio}</p>
        </div>
      </div>
    </Link>
  )
}
