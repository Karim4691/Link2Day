import { useState } from "react"
import Header from "../components/Header.jsx"


function Home({ user }) {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <div className="relative w-screen h-screen">
      <Header user={user} />
      <div className="bg-gray-100 w-screen h-screen">
        <h2 className="font-semibold font-tinos pt-24 py-2 ml-24 text-5xl">
          Events near you
        </h2>

        <div className="flex justify-center w-full h-3/5">
          
          {!isLoading && <div className="w-4/5 my-4 h-full bg-white rounded-lg">
            OI
          </div>
          }
        </div>
          
        

      </div>
    </div>
  )
}

export default Home
