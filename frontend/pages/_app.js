import '../styles/global.css' // Importer les styles globaux
import { useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import {
  ThemeProvider,
  useTheme
} from '../context/ThemeContext'
import {
  UserProvider,
  UserContext
} from '../context/UserContext' // Import du contexte utilisateur

function AuthChecker({ children }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } =
    useContext(UserContext) // Utilisation du contexte

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié et sur la page de login, rediriger vers /home
        if (router.pathname === '/login') {
          router.push('/home')
        }
      } else {
        // Si l'utilisateur n'est pas authentifié, rediriger vers /login
        if (router.pathname !== '/login') {
          router.push('/login')
        }
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Chargement...</div> // Afficher un écran de chargement tant que la session est vérifiée
  }

  return children // Rendre le composant enfant si tout est prêt
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThemeWrapper>
          <AuthChecker>
            <Navbar />{' '}
            {/* Navbar est affichée une seule fois */}
            <Component {...pageProps} />{' '}
            {/* Affiche la page courante */}
          </AuthChecker>
        </ThemeWrapper>
      </UserProvider>
    </ThemeProvider>
  )
}

function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(
        'dark'
      )
    } else {
      document.documentElement.classList.remove(
        'dark'
      )
    }
  }, [isDarkMode])

  return (
    <div className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text min-h-screen transition-colors duration-500">
      <div className="mx-auto w-full max-w-screen-lg px-4">
        {children}{' '}
        {/* Affiche les enfants, y compris le composant passé à MyApp */}
      </div>
    </div>
  )
}

export default MyApp
