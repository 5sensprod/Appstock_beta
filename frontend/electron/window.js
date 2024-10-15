const { BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const isDev =
    process.env.NODE_ENV === 'development'

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(
        __dirname,
        '../preload.js'
      ),
      webSecurity: !isDev // Désactiver la sécurité web en développement
    }
  })

  // Charger l'URL en fonction de l'environnement
  const startUrl = isDev
    ? 'http://localhost:3000' // Utilise Next.js en mode développement
    : `http://localhost:3000` // En production, Express servira les fichiers statiques
  mainWindow.loadURL(startUrl)

  return mainWindow
}

module.exports = {
  createWindow
}
