import '../styles/global.css' // Importer les styles globaux
import { useEffect } from 'react'
import Navbar from '../components/Navbar' // Importer la Navbar
import {
  ThemeProvider,
  useTheme
} from '../context/ThemeContext' // Importer le contexte du thème

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Component {...pageProps} />
      </ThemeWrapper>
    </ThemeProvider>
  )
}

function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme() // Utilisation du contexte du thème

  // Appliquer dynamiquement la classe 'dark' sur l'élément <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add(
        'dark'
      ) // Ajouter la classe 'dark' à <html>
    } else {
      document.documentElement.classList.remove(
        'dark'
      ) // Retirer la classe 'dark' de <html>
    }
  }, [isDarkMode])

  return (
    <div className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text min-h-screen text-center transition-colors duration-500">
      <Navbar /> {/* Inclure la navbar */}
      <div className="mx-auto mt-8 w-full max-w-screen-lg px-4">
        {children}
      </div>
    </div>
  )
}

export default MyApp
