const { contextBridge, ipcRenderer } = require('electron')

console.log('preload.js chargé avec succès')

// Exposer les méthodes à l'interface utilisateur via window.api
contextBridge.exposeInMainWorld('api', {
  getServerIp: () => ipcRenderer.invoke('get-server-ip'),

  // Gestionnaires d'événements pour les mises à jour
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (event, progressObj) => {
      callback(progressObj) // Transférer l'objet de progression au frontend
    }),
  installUpdate: () => ipcRenderer.send('install_update')
})
