const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let flaskProcess = null // Variable pour stocker le processus Flask

// Fonction pour lancer le serveur Flask
function startFlask() {
  const flaskExecutablePath = path.join(__dirname, '../backend/dist/app.exe') // Assurez-vous que le chemin est correct

  flaskProcess = spawn(flaskExecutablePath)

  flaskProcess.on('error', (error) => {
    console.error(`Erreur lors du démarrage de Flask : ${error}`)
    dialog.showErrorBox(
      'Erreur Flask',
      `Erreur lors du démarrage du backend Flask : ${error.message}`,
    )
  })

  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask stdout: ${data}`)
  })

  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask stderr: ${data}`)
  })

  flaskProcess.on('close', (code) => {
    console.log(`Le processus Flask s'est terminé avec le code ${code}`)
  })
}

// Fonction pour arrêter le serveur Flask
function stopFlask() {
  if (flaskProcess) {
    try {
      flaskProcess.kill('SIGTERM') // Utiliser SIGTERM pour demander l'arrêt gracieux du processus
      console.log('Serveur Flask arrêté avec succès.')
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur Flask : ${error}`)
    }
    flaskProcess = null // Nettoyer la référence au processus
  }
}

// Fonction pour créer la fenêtre Electron
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL('http://localhost:5000')

  mainWindow.on('closed', () => {
    stopFlask() // Arrêter le serveur Flask lorsque la fenêtre Electron est fermée
    app.quit() // Fermer l'application lorsqu'on ferme la fenêtre
  })
}

app.whenReady().then(() => {
  startFlask() // Démarrer le backend Flask
  setTimeout(createWindow, 5000) // Attendre 5 secondes pour s'assurer que Flask démarre avant de créer la fenêtre Electron
})

app.on('window-all-closed', () => {
  stopFlask() // Arrêter le serveur Flask lorsque toutes les fenêtres sont fermées
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
