/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Active le mode sombre via la classe 'dark'
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'light-background': '#ffffff', // Couleur de fond pour le mode clair
        'dark-background': '#1a202c', // Couleur de fond pour le mode sombre
        'light-text': '#000000', // Couleur de texte pour le mode clair
        'dark-text': '#ffffff' // Couleur de texte pour le mode sombre
      }
    }
  },
  plugins: []
}
