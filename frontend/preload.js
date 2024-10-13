const { contextBridge, ipcRenderer } = require('electron')

console.log('preload.js chargé avec succès')

// Exposer les méthodes à l'interface utilisateur de l'application via window.api
contextBridge.exposeInMainWorld('api', {
  getServerIp: () => ipcRenderer.invoke('get-server-ip'),

  // Ajouter des gestionnaires d'événements pour les mises à jour
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  installUpdate: () => ipcRenderer.send('install_update')
})
