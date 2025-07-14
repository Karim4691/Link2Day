import { Navigate } from "react-router-dom"

export const ProtectedRoutes = ({ children, user }) => {
  return user ? children : <Navigate to='/' />
}
