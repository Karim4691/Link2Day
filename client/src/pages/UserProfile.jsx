import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import errorHandler from '../utils/errorHandler'
import Loading from '../components/Loading'

function Profile( { user }) {
  const { uid } = useParams()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/users/${uid}`)
      .then(res => {
        return res.json()
      })
      .then(data => {
        if (data.code !== undefined) throw data // Handle error from API
        setUserData(data)
      })
      .catch(error => {
        errorHandler(error)
        console.log(error)
      })
      .finally( () => {
        setIsLoading(false)
      })
  }, [uid])

  const handleUpload = () => {
  }

  if (isLoading) return <Loading />

  return (
    <div>
      <h2>{user.displayName}</h2>
      <p>{user.bio}</p>
      <input type="file" className="" onChange={handleUpload} />
    </div>
  )
}

export default Profile