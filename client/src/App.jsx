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
    return <div>Loading...</div>
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authentication user={user}/>} />
        <Route path="/Home" element={<Home user={user} />} />
        <Route path="/private" element={
          <ProtectedRoutes user={user}>
            <Private />
          </ProtectedRoutes>
        } />
        <Route path="/Your-events" element={<YourEvents user={user}/>} />
        <Route path="/user/:id" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
