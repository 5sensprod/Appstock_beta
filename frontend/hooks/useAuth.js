// hooks/useAuth.js
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    handleLogin
  } = useContext(UserContext)
  return {
    isAuthenticated,
    isLoading,
    handleLogin
  }
}

export default useAuth
