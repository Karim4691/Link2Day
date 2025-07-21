import { getAuth } from 'firebase-admin/auth'

// Middleware to validate Firebase ID token
const validateTokenID = (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]
  
    getAuth().verifyIdToken(idToken)
    .then((decodedToken) => {
      console.log("Token successfully validated")

      req.user = decodedToken // Store decoded token for next
      next()
    })
    .catch((error) => {
      res.status(401).json({
        message : error.message, 
        code: "auth/invalid-id-token"
      })
      console.log(error)
    })
}

export default validateTokenID