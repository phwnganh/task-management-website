import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext()

function AuthProvider({children}){
      const [user, setUser] = useState(() => {
            const savedUser = localStorage.getItem('user')
            return savedUser ? JSON.parse(savedUser) : {role: null}
      })

      useEffect(() => {
            if(user.role){
                  localStorage.setItem('user', JSON.stringify(user))
            }else{
                  localStorage.removeItem('user')
            }
      }, [user])

      const login = (userData) => {
            setUser(userData)
      }

      const logout = () => {
            setUser({role: null})
            localStorage.removeItem('user')
      }

      return (
            <AuthContext.Provider value={{user, login, logout}}>
                  {children}
            </AuthContext.Provider>
      )
}

export {AuthContext, AuthProvider}