import { auth } from "../firebase"
import { signOut } from "firebase/auth"

function Private() {
  const handleSignOut = () => {
    signOut(auth)
      .then(() => console.log('Sign out'))
      .catch((error) => console.log(error))
  }

  return (
    <div>
      Private
      <button onClick={handleSignOut}> Sign Out </button>
    </div>
  )
}

export default Private
