// electron/window.js
const { BrowserWindow } = require('electron')
const path = require('path')

function createWindow(flaskIpAddress) {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  })

  mainWindow.loadURL(`http://${flaskIpAddress}:5000`)

  mainWindow.on('closed', () => {
    // Ne rien mettre ici, la gestion se fait dans 'window-all-closed'
  })
}

module.exports = {
  createWindow,
}
