import { IoIosClose } from "react-icons/io"
import { useEffect } from "react"
import { useRef } from "react"

export default function Modal( { open, onClose, children }) {
  const modal = useRef(null)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  //handle a click outside of the modal
  useEffect(() => {
    function handleClickOutside(e) {
      if (modal.current && !(modal.current).contains(e.target)) onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div className={`
      fixed inset-0 flex justify-center items-center z-50
      ${open ? "visible bg-black/20 overflow-y-hidden" : "invisible"}
    `}>
      <div className="relative bg-white rounded-lg shadow p-6 w-96" ref={modal}>
        <button onClick={onClose} className="absolute top-1 right-1 text-black hover:text-gold cursor-pointer">
          <IoIosClose className="size-8"/>
        </button>
        {children}
      </div>
    </div>
  )
}