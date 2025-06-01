import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const ProtectedRoutes = ({children}) => {
      const {user} = useAuth()

      if(!user.role){
            return <Navigate to="/login" replace/>
      }
      return children
}

export default ProtectedRoutes