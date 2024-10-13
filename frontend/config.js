const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Le code s'exécute côté client, donc nous pouvons utiliser window
    return `http://${window.location.hostname}:5000`
  } else {
    // Le code s'exécute côté serveur, nous devons retourner une URL par défaut ou une valeur appropriée
    return 'http://localhost:5000'
  }
}

const config = {
  apiBaseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000' // URL du serveur Flask en développement
      : getApiBaseUrl() // Utiliser la fonction pour obtenir l'URL en production
}

export default config
