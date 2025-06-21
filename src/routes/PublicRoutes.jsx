import { Navigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { DASHBOARD } from "../constants/routes.constants"

const PublicRoutes = ({children}) => {
      const {user} = useAuth()

      if(user.role){
            return <Navigate to={DASHBOARD} replace/>
      }
      return children
}

export default PublicRoutes