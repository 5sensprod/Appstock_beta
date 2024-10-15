import { useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../context/UserContext'

const AuthChecker = ({ children }) => {
  const router = useRouter()
  const { isAuthenticated, isLoading } =
    useContext(UserContext)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (router.pathname === '/login') {
          router.push('/home')
        }
      } else {
        if (router.pathname !== '/login') {
          router.push('/login')
        }
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Chargement...</div> // Afficher un écran de chargement
  }

  return children
}

export default AuthChecker
