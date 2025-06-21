import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { LOGIN } from "../constants/routes.constants"

function PrivateRoutes({children, allowedRoles}){
      const {user} = useAuth()
      if(!user.role || !allowedRoles.includes(user.role)){
            return <Navigate to={LOGIN} replace/>
      }
      return children
}

export default PrivateRoutes