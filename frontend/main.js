const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const treeKill = require('tree-kill')
const net = require('net')
const axios = require('axios')

let flaskProcess = null // Variable pour stocker le processus Flask
let flaskIpAddress = 'localhost' // Par défaut, utiliser localhost si l'IP n'est pas récupérée

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
  const flaskExecutablePath = path.join(__dirname, '../backend/dist/app.exe')

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
      flaskProcess = null
    })
  }
}

// Fonction pour récupérer dynamiquement l'adresse IP locale du serveur Flask
async function fetchLocalIp() {
  try {
    const response = await axios.get('http://127.0.0.1:5000/get_local_ip')
    flaskIpAddress = response.data.local_ip
    console.log(`IP locale du serveur Flask : ${flaskIpAddress}`)
  } catch (error) {
    console.error(
      "Impossible de récupérer l'IP locale du serveur Flask :",
      error,
    )
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
      preload: path.join(__dirname, 'preload.js'), // Chemin vers preload.js
    },
  })

  // Charger l'URL du serveur Flask avec l'adresse IP récupérée
  mainWindow.loadURL(`http://${flaskIpAddress}:5000`)

  mainWindow.on('closed', () => {
    // Ne rien mettre ici, la gestion se fait dans 'window-all-closed'
  })
}

// Gestionnaire IPC pour obtenir l'IP du serveur
ipcMain.handle('get-server-ip', async () => {
  await fetchLocalIp()
  return flaskIpAddress
})

app.whenReady().then(async () => {
  await fetchLocalIp() // Récupérer l'IP locale du serveur Flask
  isPortInUse(5000, (inUse) => {
    if (!inUse) {
      startFlask()
    } else {
      console.log(
        "Le port 5000 est déjà utilisé. Assurez-vous que le serveur Flask n'est pas déjà en cours d'exécution.",
      )
    }
    setTimeout(createWindow, 5000) // Assurez-vous que Flask est démarré avant de créer la fenêtre Electron
  })
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
    createWindow()
  }
})
