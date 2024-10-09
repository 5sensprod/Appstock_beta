const { app, BrowserWindow } = require('electron')
const {
  isPortInUse,
  startFlask,
  stopFlask,
  fetchLocalIp,
  getFlaskIpAddress,
} = require('./electron/flask')
const { createWindow } = require('./electron/window')
require('./electron/ipcHandlers') // Pour enregistrer les gestionnaires IPC
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  require('electron-reload')(path.join(__dirname, '.'), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  })
}

app.whenReady().then(async () => {
  if (!isDev) {
    // En production, démarrer Flask
    await fetchLocalIp()
    const inUse = await isPortInUse(5000)
    if (!inUse) {
      startFlask()
    } else {
      console.log(
        "Le port 5000 est déjà utilisé. Assurez-vous que le serveur Flask n'est pas déjà en cours d'exécution.",
      )
    }
    // Attendre que Flask soit démarré avant de créer la fenêtre Electron
    setTimeout(() => createWindow(), 5000)
  } else {
    // En développement, créer la fenêtre immédiatement
    createWindow()
  }
})

app.on('before-quit', (event) => {
  event.preventDefault()
  stopFlask()

  setTimeout(() => {
    app.exit()
  }, 2000)
})

app.on('window-all-closed', () => {
  stopFlask()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(getFlaskIpAddress())
  }
})
