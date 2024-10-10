// frontend/src/config.js
const config = {
  apiBaseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000' // URL du serveur Flask en développement
      : `http://${window.location.hostname}:5000`, // URL du serveur Flask en production
}

export default config
