import toast from "react-hot-toast"


const ErrorHandler = (code) => {
  switch (code) {
    //Firebase Auth errors
    case "auth/invalid-email":
      toast.error("The email address is not valid. Please try again.")
      break
    case "auth/wrong-password":
      toast.error("Wrong password. Please try again.")
      break
    case "auth/missing-password":
      toast.error("Password is required.")
      break
    case "auth/missing-email":
      toast.error("Email is required.")
      break
    case "auth/email-already-in-use":
      toast.error("The account already exists. Please try logging in instead.")
      break
    case "auth/weak-password":
      toast.error("Password should be at least 6 characters.")
      break
    case "auth/operation-not-allowed":
      toast.error("The operation is not allowed. Please try again later.")
      break
    case "auth/invalid-verification-code":
      toast.error("Invalid verification code. Please try again.")
      break
    case "auth/code-expired":
      toast.error("The code expired. Please try again.")
      break
    case "auth/invalid-credential":
      toast.error("The email or password is wrong. Please try again.")
      break
    case "auth/quota-exceeded":
      toast.error("Quota exceeded. Please try again later.")
      break
    case "auth/session-expired":
      toast.error("The session expired. Please try again.")
      break
    case "auth/network-request-failed":
      toast.error("Network request failed. Please try again.")
      break
    case "auth/account-exists-with-different-credential":
      toast.error("The account exists with a different credential.")
      break
    case "auth/credential-already-in-use":
      toast.error("The credential is already in use.")
      break
    case "auth/invalid-email-verified":
      toast.error("Please verify your email address before attempting to sign in")
      break
    case "auth/invalid-id-token":
      toast.error("Unable to validate the ID token. Please try again.")
      break
    case "auth/internal-error":
      toast.error("Internal error. Please try again.")
      break

    // App specific errors
    case "auth/missing-city-or-state":
      toast.error("You must specify the city or state.")
      break
    case "auth/invalid-location":
      toast.error("Invalid location. Please select a valid address.")
      break
    case "auth/invalid-name":
      toast.error("Name is required.")
      break
    case "auth/invalid-bio":
      toast.error("Invalid bio. Please try again.")
      break

    case "user/not-found":
      toast.error("The user cannot be found.")
      break

    case "image/too-large":
      toast.error("The image must be less than 100MB")
      break

    default:
      toast.error("Something went wrong. Please try again.")
  }
}

export default ErrorHandler