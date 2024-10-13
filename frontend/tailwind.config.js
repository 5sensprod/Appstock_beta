// Configuration de Tailwind
module.exports = {
  darkMode: 'class', // Active le mode sombre via la classe 'dark'
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'light-background': '#ffffff', // Couleur de fond pour le mode clair
        'dark-background': '#1a202c', // Couleur de fond pour le mode sombre
        'light-text': '#000000', // Couleur de texte pour le mode clair
        'dark-text': '#ffffff', // Couleur de texte pour le mode sombre
        'toggle-dark': '#ffffff', // Couleur pour le toggle en mode sombre (blanc)
        'toggle-light': '#000000' // Couleur pour le toggle en mode clair (noir)
      }
    }
  },
  plugins: []
}
