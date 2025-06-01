import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { LOGIN } from "../constants/routes.constants"

const ProtectedRoutes = ({children}) => {
      const {user} = useAuth()

      if(!user.role){
            return <Navigate to={LOGIN} replace/>
      }
      return children
}

export default ProtectedRoutes