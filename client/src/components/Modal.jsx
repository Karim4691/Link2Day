import { IoIosClose } from "react-icons/io"
import { useEffect } from "react"

export default function Modal( { open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div onClick={onClose} className={`
      fixed inset-0 flex justify-center items-center z-50
      ${open ? "visible bg-black/20 overflow-y-hidden" : "invisible"}
    `}>
      <div className="relative bg-white rounded-lg shadow p-6 w-96" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-1 right-1 text-black hover:text-gold cursor-pointer">
          <IoIosClose className="size-8"/>
        </button>
        {children}
      </div>
    </div>
  )
}