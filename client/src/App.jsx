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
import CreateEvent from "./pages/CreateEvent.jsx"
import EditEvent from "./pages/EditEvent.jsx"
import Event from "./pages/Event.jsx"
import './assets/calendar_theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './assets/TimePicker.css'
import './assets/skeleton.css'



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


  //set the background color of the body to black
  useEffect(() => {
    document.body.style.backgroundColor = "black"
    return () => {
      document.body.style.backgroundColor = ""
    }
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
        <Route path="/home" element={<Home user={user}/>} />
        <Route path="/your-events" element={<YourEvents user={user}/>} />
        <Route path="/users/:uid" element={<UserProfile user={user}/>} />
        <Route path="/your-events/create" element={<CreateEvent user={user}/>} />
        <Route path="*" element={<FourOFour />} />
        <Route path='/events/:eid' element={<Event user={user}/>} />
        <Route path='/events/edit/:eid' element={<EditEvent user={user} />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
