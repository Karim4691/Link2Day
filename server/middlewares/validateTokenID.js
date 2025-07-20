import admin from "firebase-admin"

const validateTokenID = (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]
  
    getAuth().verifyIdToken(idToken)
    .then((decodedToken) => {
      console.log("Token successfully validated")
      console.log(req.body)

      req.user = decodedToken // Store decoded token for next
      next()
    })
    .catch((error) => {
      res.status(401).json({
        message : error.message, 
        code: error.code
      })
      console.log(error)
    })
}

export default validateTokenID