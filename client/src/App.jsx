import { BrowserRouter, Routes, Route } from "react-router-dom"
import Authentication from './pages/Authentication.jsx'
import YourEvents from "./pages/YourEvents.jsx"
import Home from './pages/Home.jsx'
import UserProfile from './pages/UserProfile.jsx'
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth"
import { useEffect, useState } from "react"
import { auth } from "./firebase.js"
import { Toaster } from 'react-hot-toast'
import Loading from "./components/Loading.jsx"
import FourOFour from "./pages/FourOFour.jsx"

function App() {
  const [user, setUser] = useState(null)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!user.emailVerified) sendEmailVerification(user)
        setUser(user)
      }
      else setUser(null)

      setIsFetching(false)
    })

    return () => unsubscribe()
  }, [])

  if (isFetching) {
    return <Loading />
  }
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 7000
      }}/>
      <Routes>
        <Route path="/" element={<Authentication user={user}/>} />
        <Route path="/Home" element={<Home user={user}/>} />
        <Route path="/Your-events" element={<YourEvents user={user}/>} />
        <Route path="/users/:uid" element={<UserProfile user={user}/>} />
        <Route path="*" element={<FourOFour />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
