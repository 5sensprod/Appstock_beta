import { useTheme } from '../context/ThemeContext' // Utiliser le contexte du thème
import {
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/solid' // Importer les icônes de Heroicons v2
import WelcomeMessage from './WelcomeMessage'

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } =
    useTheme() // Utilisation du contexte global du thème

  return (
    <nav className="flex w-full items-center justify-between p-4 text-light-text dark:text-dark-text">
      <WelcomeMessage />{' '}
      {/* Message de bienvenue */}
      <div className="flex items-center">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={isDarkMode}
            onChange={toggleDarkMode} // Bascule entre clair/sombre
          />
          {/* Fond du toggle switch */}
          <div className="h-6 w-11 rounded-full bg-toggle-light transition-colors duration-500 dark:bg-toggle-dark"></div>
          {/* Icône du toggle */}
          <div className="absolute left-1 top-1 flex size-4 items-center justify-center transition-transform duration-300 peer-checked:translate-x-5">
            {isDarkMode ? (
              <MoonIcon className="size-4 text-light-text" />
            ) : (
              <SunIcon className="size-4 text-dark-text" />
            )}
          </div>
        </label>
      </div>
    </nav>
  )
}

export default Navbar
