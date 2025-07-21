import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Profile() {
  const { uid } = useParams()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${uid}`)
      .then(res => {
        return res.json()
      })
      .then(data => {
        if (data.code !== undefined) throw data // Handle error from API
      })
      .catch(error => {
        
      })
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