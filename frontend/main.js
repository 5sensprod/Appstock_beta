// main.js
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

app.whenReady().then(async () => {
  await fetchLocalIp() // Récupérer l'IP locale du serveur Flask
  const inUse = await isPortInUse(5000)
  if (!inUse) {
    startFlask()
  } else {
    console.log(
      "Le port 5000 est déjà utilisé. Assurez-vous que le serveur Flask n'est pas déjà en cours d'exécution.",
    )
  }
  // Attendre que Flask soit démarré avant de créer la fenêtre Electron
  setTimeout(() => createWindow(getFlaskIpAddress()), 5000)
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
