

const AuthErrorHandler = (error) => {
  switch (error.code) {
    case "auth/invalid-email":
      alert("Invalid email address. Please enter a valid email.")
      break
    case "auth/user-not-found":
      alert("User not found. Please check the email address.")
      break
    case "auth/wrong-password":
      alert("Incorrect password. Please try again.")
      break
    case "auth/email-already-in-use":
      alert("Email already in use. Please try another email.")
      break
    case "auth/weak-password":
      alert("Password should be at least 6 characters.")
      break
    case "auth/operation-not-allowed":
      alert("Operation not allowed. Please try again later.")
      break
    case "auth/invalid-verification-code":
      alert("Invalid verification code. Please try again.")
      break
    case "auth/code-expired":
      alert("Code expired. Please try again.")
      break
    case "auth/invalid-credential":
      alert("Invalid credential. Please try again.")
      break
    case "auth/quota-exceeded":
      alert("Quota exceeded. Please try again.")
      break
    case "auth/session-expired":
      alert("Session expired. Please try again.")
      break
    case "auth/network-request-failed":
      alert("Network request failed. Please try again.")
      break
    case "auth/account-exists-with-different-credential":
      alert("Account exists with different credential. Please try again.")
      break
    case "auth/credential-already-in-use":
      alert("Credential already in use. Please try again.")
      break
    case "auth/timeout":
      alert("Timeout. Please try again.")
      break
    case "auth/invalid-argument":
      alert("Invalid argument. Please try again.")
      break
    case "auth/invalid-email-verified":
      alert("Please verify your email address before attempting to sign in")
      break
    case "auth/invalid-id-token":
      alert("Invalid ID token. Please try again.")
      break
    case "auth/invalid-password":
      alert("Invalid password. Please try again.")
      break
    case "auth/email-already-exists":
      alert("Email already exists. Please try again.")
      break
    case "auth/internal-error":
      alert("Internal error. Please try again.")
      break
    default:
      alert("Something went wrong. Please try again later.")
  }
}

export default AuthErrorHandler