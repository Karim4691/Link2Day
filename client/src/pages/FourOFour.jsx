import { useNavigate } from "react-router-dom"
import { TbGhost2Filled } from "react-icons/tb"
import { FaLemon } from "react-icons/fa"

export default function FourOFour() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-row justify-around h-screen">
      <div className="flex items-center justify-center h-full">
        <TbGhost2Filled className="text-7xl text-cyan size-72" />
      </div>
      <div className="flex flex-col items-center mt-32 text-black/80">
        <div className="text-8xl">
          404
        </div>

        <div className="text-5xl mt-4">
          Nothing To See Here...
        </div>

        <div className="text-3xl mt-12 text-gold cursor-pointer hover:font-extrabold" onClick={() => navigate('/Home')}>
          Find Your Way Back Home
        </div>

      </div>
      <div className="flex items-center justify-center h-full">
        <FaLemon className="size-72 text-gold" />
      </div>
    </div>
  )
}