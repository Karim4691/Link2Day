import { useEffect, useState } from "react"
import { sendEmailVerification } from 'firebase/auth'
import errorHandler from "../utils/errorHandler"

export default function EmailVerification ({ user }) {
  const [cooldown, setCooldown] = useState(60)

  useEffect(() => {
    if (cooldown === 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const handleSendVerificationEmail =  (async () => {
    try {
      await sendEmailVerification(user)
      setCooldown(60) //reset timer
    } catch (error) {
      console.log(error)
      errorHandler(error.code)
    }
  })

  return (
    <>
      {cooldown === 0 &&
        <button type="button" className="text-gold underline text-lg mt-4 cursor-pointer -mb-4" onClick={handleSendVerificationEmail}>
          Send another verification email
        </button>
      }
      {cooldown > 0 &&
        <div className="text-sm text-gray-500 mt-4 -mb-4">
          Retry in {cooldown}s
        </div>
      }
    </>
  )
}
