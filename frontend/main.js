require('dotenv').config() // Charger dotenv
const { app, BrowserWindow } = require('electron')
const { isPortInUse, startFlask, stopFlask, fetchLocalIp } = require('./electron/flask')
const { createWindow } = require('./electron/window')
const { createCustomMenu } = require('./electron/menu')
const { waitForServer } = require('./electron/serverUtils')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const log = require('electron-log')

log.info('Application lancée avec succès')
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log')

let mainWindow

// Ajout d'électron-reload pour le développement
if (isDev) {
  require('electron-reload')(path.join(__dirname, '.'), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true
  })
}

// Démarrer Express.js pour servir le frontend en mode développement et production
function startExpress() {
  require('./scripts_package/express-server') // Démarre le serveur Express directement
}

app.whenReady().then(async () => {
  if (!isDev) {
    console.log('Production : démarrage du serveur Flask et Express')

    // En production, démarrer Flask (backend) et Express (frontend)
    await fetchLocalIp()
    const inUse = await isPortInUse(5001)
    if (!inUse) {
      startFlask()
      console.log('Serveur Flask démarré sur le port 5001')
    } else {
      console.log('Le port 5001 est déjà utilisé.')
    }

    // Démarrer Express.js en production pour servir le frontend
    startExpress() // Démarre Express

    // Utiliser waitForServer pour vérifier si le serveur Express est prêt avant de créer la fenêtre Electron
    waitForServer(() => {
      console.log('Le serveur est prêt. Création de la fenêtre Electron')
      createCustomMenu() // Créer et appliquer le menu personnalisé
      mainWindow = createWindow()
      // Vérifier les mises à jour et notifier l'utilisateur
      autoUpdater.checkForUpdates()
    })
  } else {
    // En développement, utiliser Next.js pour servir le frontend
    console.log(
      'Développement : Création de la fenêtre Electron et utilisation de Next.js pour le frontend'
    )
    createCustomMenu() // Créer et appliquer le menu personnalisé
    mainWindow = createWindow() // Créer la fenêtre Electron
  }

  if (isDev && mainWindow) {
    mainWindow.webContents.on('did-finish-load', () => {
      // mainWindow.webContents.reloadIgnoringCache();  // Désactiver le rechargement forcé
    })
  }
})

app.on('before-quit', (event) => {
  event.preventDefault()
  stopFlask()
  console.log('Arrêt du serveur Flask')
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
    mainWindow = createWindow()
  }
})
