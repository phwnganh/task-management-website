import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const PublicRoutes = ({children}) => {
      const {user} = useAuth()

      if(user.role){
            return <Navigate to="/dashboard" replace/>
      }
      return children
}

export default PublicRoutes