import '../styles/global.css' // Importer les styles globaux
import { ThemeProvider, useTheme } from '../context/ThemeContext' // Importer le contexte du thème
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      {/* Fournisseur global */}
      <ThemeWrapper>
        <Component {...pageProps} /> {/* Rendu des pages */}
      </ThemeWrapper>
    </ThemeProvider>
  )
}

function ThemeWrapper({ children }) {
  const { isDarkMode, toggleDarkMode } = useTheme() // Récupération de isDarkMode et toggleDarkMode

  // Appliquer dynamiquement la classe 'dark' sur l'élément <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark') // Ajouter la classe 'dark' à <html>
    } else {
      document.documentElement.classList.remove('dark') // Retirer la classe 'dark' de <html>
    }
  }, [isDarkMode])

  return (
    <div className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text flex min-h-screen flex-col items-center justify-center transition-colors duration-500">
      {/* Conteneur centré verticalement et horizontalement avec flex */}
      <div className="w-full max-w-screen-xl px-4">
        {' '}
        {/* Ajuste la largeur */}
        <button
          onClick={toggleDarkMode} // Bascule entre le mode clair et sombre
          className="mx-auto my-6 block rounded bg-blue-500 p-2 text-white"
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        {children} {/* Contenu de la page */}
      </div>
    </div>
  )
}

export default MyApp
