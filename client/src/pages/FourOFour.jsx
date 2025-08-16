import { useNavigate } from "react-router-dom"
import { TbGhost2Filled } from "react-icons/tb"
import { FaLemon } from "react-icons/fa"

export default function FourOFour() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col justify-start lg:flex-row w-fit min-w-screen lg:justify-center items-center lg:items-start min-h-screen bg-white overflow-auto pt-12 lg:pt-24">
      <div className="flex items-center justify-center">
        <TbGhost2Filled className="text-4xl md:text-5xl lg:text-7xl size-56 md:size-64 lg:size-72 text-cyan" />
      </div>
      <div className="flex flex-col items-center text-transparent bg-clip-text bg-gradient-to-r from-gold to-cyan mx-0 lg:mx-6">
        <div className="text-6xl lg:text-8xl">
          404
        </div>

        <div className="text-2xl lg:text-4xl my-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan to-gold">
          Nothing To See Here...
        </div>

        <a className="text-xl lg:text-3xl mx-12 cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan transition duration-500" onClick={() => navigate('/home')}>
          Home lies this way
        </a>

      </div>
      <div className="flex items-center justify-center h-full">
        <FaLemon className="mt-8 lg:mt-0 text-4xl md:text-5xl lg:text-7xl text-gold size-56 md:size-64 lg:size-72" />
      </div>
    </div>
  )
}