import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

function PrivateRoutes({children, allowedRoles}){
      const {user} = useAuth()
      if(!user.role || !allowedRoles.includes(user.role)){
            return <Navigate to="/login" replace/>
      }
      return children
}

export default PrivateRoutes