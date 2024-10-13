require('dotenv').config() // Charger dotenv

const { app, BrowserWindow, ipcMain } = require('electron')
const { isPortInUse, startFlask, stopFlask, fetchLocalIp } = require('./electron/flask')
const { createWindow } = require('./electron/window')
const { createCustomMenu } = require('./electron/menu')
const { waitForServer } = require('./electron/serverUtils')
const { autoUpdater } = require('electron-updater')
require('./electron/ipcHandlers')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'
const log = require('electron-log') // Ajouter electron-log

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

app.whenReady().then(async () => {
  if (!isDev) {
    console.log('Production : démarrage du serveur Flask')

    // En production, démarrer Flask
    await fetchLocalIp()
    const inUse = await isPortInUse(5000)
    if (!inUse) {
      startFlask()
      console.log('Serveur Flask démarré sur le port 5000')
    } else {
      console.log(
        "Le port 5000 est déjà utilisé. Assurez-vous que le serveur Flask n'est pas déjà en cours d'exécution."
      )
    }

    // Utiliser waitForServer pour vérifier si le serveur est prêt avant de créer la fenêtre Electron
    waitForServer(() => {
      console.log('Le serveur est prêt. Création de la fenêtre Electron')
      createCustomMenu() // Créer et appliquer le menu personnalisé
      mainWindow = createWindow()

      // Vérifier les mises à jour et notifier l'utilisateur
      autoUpdater.checkForUpdates()
    })
  } else {
    // En développement, créer la fenêtre immédiatement
    console.log('Développement : Création de la fenêtre Electron')
    createCustomMenu() // Créer et appliquer le menu personnalisé
    mainWindow = createWindow()
  }

  // Forcer le rafraîchissement de la page lors des modifications en développement
  if (isDev && mainWindow) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.reloadIgnoringCache()
    })
  }
})

// Gestion de l'événement de fermeture
app.on('before-quit', (event) => {
  event.preventDefault()
  stopFlask()
  console.log('Arrêt du serveur Flask')

  setTimeout(() => {
    app.exit()
  }, 2000)
})

// Gestion de la fermeture de toutes les fenêtres
app.on('window-all-closed', () => {
  stopFlask()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Gestion de l'activation de l'application (sur macOS notamment)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  }
})

// Gérer les événements de mise à jour pour informer l'utilisateur
// Gérer les événements de mise à jour pour informer l'utilisateur
autoUpdater.on('update-available', () => {
  log.info('Mise à jour disponible')

  const sendUpdateAvailable = () => {
    if (mainWindow && mainWindow.webContents) {
      log.info(
        'mainWindow et mainWindow.webContents sont disponibles, envoi de l\'événement "update_available"'
      )
      mainWindow.webContents.send('update_available')
    } else {
      log.error('mainWindow ou mainWindow.webContents est indéfini. Réessai en cours...')
      setTimeout(sendUpdateAvailable, 1000) // Réessayer après 1 seconde
    }
  }
  sendUpdateAvailable()
})

autoUpdater.on('update-downloaded', () => {
  log.info('Mise à jour téléchargée')

  const sendUpdateDownloaded = () => {
    if (mainWindow && mainWindow.webContents) {
      log.info(
        'mainWindow et mainWindow.webContents sont disponibles, envoi de l\'événement "update_downloaded"'
      )
      mainWindow.webContents.send('update_downloaded')
    } else {
      log.error('mainWindow ou mainWindow.webContents est indéfini. Réessai en cours...')
      setTimeout(sendUpdateDownloaded, 1000) // Réessayer après 1 seconde
    }
  }
  sendUpdateDownloaded()
})

// Gérer la commande pour installer la mise à jour
ipcMain.on('install_update', () => {
  log.info('Installation de la mise à jour...')
  autoUpdater.quitAndInstall()
})

// Logs supplémentaires pour surveiller le processus de mise à jour
autoUpdater.on('checking-for-update', () => {
  log.info('Vérification des mises à jour en cours...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Une mise à jour est disponible. Version disponible sur GitHub : ' + info.version)
})

autoUpdater.on('update-not-available', (info) => {
  log.info(
    'Aucune mise à jour disponible. La version actuelle (' + app.getVersion() + ') est la dernière.'
  )
})

autoUpdater.on('error', (err) => {
  log.error('Erreur dans le processus de mise à jour automatique :', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow && mainWindow.webContents) {
    // Envoyer l'événement de progression au frontend
    mainWindow.webContents.send('download-progress', progressObj)
  } else {
    log.error('mainWindow ou mainWindow.webContents est indéfini.')
  }
})

autoUpdater.on('update-downloaded', () => {
  log.info('Mise à jour téléchargée')
})
