const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const treeKill = require('tree-kill')
const net = require('net')

let flaskProcess = null // Variable pour stocker le processus Flask

// Fonction pour vérifier si le port 5000 est déjà utilisé
function isPortInUse(port, callback) {
  const server = net.createServer()

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      callback(true)
    } else {
      callback(false)
    }
  })

  server.once('listening', () => {
    server.close()
    callback(false)
  })

  server.listen(port, '127.0.0.1')
}

// Fonction pour lancer le serveur Flask
function startFlask() {
  const flaskExecutablePath = path.join(__dirname, '../backend/dist/app.exe') // Assurez-vous que le chemin est correct

  flaskProcess = spawn(flaskExecutablePath, [], {
    stdio: 'ignore',
  })

  flaskProcess.on('error', (error) => {
    console.error(`Erreur lors du démarrage de Flask : ${error}`)
    dialog.showErrorBox(
      'Erreur Flask',
      `Erreur lors du démarrage du backend Flask : ${error.message}`,
    )
  })

  flaskProcess.on('close', (code) => {
    console.log(`Le processus Flask s'est terminé avec le code ${code}`)
  })
}

// Fonction pour arrêter le serveur Flask
function stopFlask() {
  if (flaskProcess) {
    treeKill(flaskProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Erreur lors de l'arrêt du serveur Flask : ${err}`)
      } else {
        console.log('Serveur Flask arrêté avec succès.')
      }
      flaskProcess = null // Nettoyer la référence au processus
    })
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

  mainWindow.loadURL('http://localhost:5000') // Assurez-vous que Flask tourne sur ce port

  mainWindow.on('closed', () => {
    // Ne rien mettre ici, la gestion se fait dans 'window-all-closed'
  })
}

app.whenReady().then(() => {
  isPortInUse(5000, (inUse) => {
    if (!inUse) {
      startFlask() // Démarrer Flask uniquement si le port 5000 n'est pas déjà utilisé
    } else {
      console.log(
        "Le port 5000 est déjà utilisé. Assurez-vous que le serveur Flask n'est pas déjà en cours d'exécution.",
      )
    }
    setTimeout(createWindow, 5000) // Assurez-vous que Flask est démarré avant de créer la fenêtre Electron
  })
})

// Événement déclenché avant la fermeture complète de l'application Electron
app.on('before-quit', (event) => {
  event.preventDefault() // Annuler l'événement de fermeture par défaut pour s'assurer que Flask est arrêté d'abord
  stopFlask() // Arrêter Flask avant que l'application Electron ne se ferme

  setTimeout(() => {
    app.exit() // Quitter l'application Electron après avoir arrêté Flask
  }, 2000) // Attendre quelques secondes pour s'assurer que le processus Flask est complètement arrêté
})

app.on('window-all-closed', () => {
  stopFlask() // Arrêter Flask lorsque toutes les fenêtres sont fermées
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
