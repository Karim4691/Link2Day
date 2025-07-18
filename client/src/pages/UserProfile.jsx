import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Profile() {
  const { uid } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${uid}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user')
        return res.json()
      })
      .then(data => setUser(data))
      .catch(err => setError(err.message))
  }, [])

  if (error) return <p>Error: {error}</p>
  if (!user) return <p>Loading...</p>

  const handleUpload = () => {
  }

  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>{user.bio}</p>
      <input type="file" className="" onChange={handleUpload} />
    </div>
  )
}

export default Profile