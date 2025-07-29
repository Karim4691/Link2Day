import { useNavigate } from "react-router-dom"
import { TbGhost2Filled } from "react-icons/tb"
import { FaLemon } from "react-icons/fa"

export default function FourOFour() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-row justify-around h-screen">
      <div className="flex items-center justify-center h-full">
        <TbGhost2Filled className="size-72 text-cyan" />
      </div>
      <div className="flex flex-col items-center mt-32 text-transparent bg-clip-text bg-gradient-to-r from-gold to-cyan">
        <div className="text-8xl">
          404
        </div>

        <div className="text-5xl mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan to-gold">
          Nothing To See Here...
        </div>

        <a className="text-3xl mt-12 cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-cyan to-gold hover:from-gold hover:to-cyan transition duration-500" onClick={() => navigate('/Home')}>
          Home lies this way
        </a>

      </div>
      <div className="flex items-center justify-center h-full">
        <FaLemon className="text-7xl text-gold size-72" />
      </div>
    </div>
  )
}