import auth from '../firebase.js'

// Middleware to validate Firebase ID token
const validateTokenID = (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]
  
    auth.verifyIdToken(idToken)
    .then((decodedToken) => {
      req.uid = decodedToken.uid // Store uid
      next()
    })
    .catch((error) => {
      res.status(401).json({
        message : error.message, 
        code: "auth/invalid-id-token"
      })
    })
}

export default validateTokenID