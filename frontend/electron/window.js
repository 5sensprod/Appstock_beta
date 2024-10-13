const { BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development'

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
      webSecurity: !isDev // Désactiver la sécurité web en développement
    }
  })

  const startUrl = isDev ? 'http://localhost:3000' : `http://localhost:5000`
  mainWindow.loadURL(startUrl)

  // En production, retourner mainWindow, mais pas en développement
  if (!isDev) {
    return mainWindow
  }
}

module.exports = {
  createWindow
}
