import {
  createContext,
  useState,
  useEffect
} from 'react'
import {
  checkSession,
  login,
  logout
} from '../services/authService' // Import des fonctions d'authentification

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('')
  const [isAuthenticated, setIsAuthenticated] =
    useState(false)
  const [isLoading, setIsLoading] = useState(true) // Gérer l'état de chargement

  // Fonction pour vérifier la session au démarrage de l'application
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await checkSession() // Utilisation de checkSession depuis authService
        if (data.authenticated) {
          setUsername('admin') // Utiliser data.username si disponible
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error(
          'Erreur lors de la vérification de la session',
          err
        )
      } finally {
        setIsLoading(false) // La session est vérifiée, qu'elle soit réussie ou non
      }
    }

    fetchSession()
  }, [])

  // Fonction pour gérer la connexion
  const handleLogin = async (username, pin) => {
    try {
      const data = await login(username, pin) // Utilisation de login depuis authService
      if (data.success) {
        setUsername(username)
        setIsAuthenticated(true)
      }
      return data
    } catch (error) {
      console.error(
        'Erreur lors de la connexion:',
        error
      )
      throw error
    }
  }

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout() // Utilisation de logout depuis authService
      setUsername('')
      setIsAuthenticated(false)
    } catch (error) {
      console.error(
        'Erreur lors de la déconnexion:',
        error
      )
    }
  }

  return (
    <UserContext.Provider
      value={{
        username,
        isAuthenticated,
        isLoading, // Ajouter l'état de chargement
        handleLogin,
        handleLogout,
        setUsername
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
