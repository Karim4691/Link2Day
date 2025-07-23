import { BrowserRouter, Routes, Route } from "react-router-dom"
import Authentication from './pages/Authentication.jsx'
import Private from "./pages/Private.jsx"
import YourEvents from "./pages/YourEvents.jsx"
import Home from './pages/Home.jsx'
import UserProfile from './pages/UserProfile.jsx'
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'
import { auth } from "./firebase.js"
import { Toaster } from 'react-hot-toast'
import Loading from "./components/Loading.jsx"

function App() {
  const [user, setUser] = useState(null)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user)
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
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Authentication user={user}/>} />
        <Route path="/Home" element={<Home user={user} />} />
        <Route path="/private" element={
          <ProtectedRoutes user={user}>
            <Private />
          </ProtectedRoutes>
        } />
        <Route path="/Your-events" element={<YourEvents user={user}/>} />
        <Route path="/users/:uid" element={<UserProfile user={user}/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
