// components/ThemeWrapper.js
import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeWrapper = ({ children }) => {
  const { isDarkMode } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      isDarkMode
    )
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-light-background text-light-text transition-colors duration-500 dark:bg-dark-background dark:text-dark-text">
      <div className="mx-auto w-full max-w-screen-lg px-4">
        {children}
      </div>
    </div>
  )
}

export default ThemeWrapper
