const { contextBridge, ipcRenderer } = require('electron')

console.log('preload.js chargé avec succès')

// Exposer les méthodes à l'interface utilisateur via window.api
contextBridge.exposeInMainWorld('api', {
  getServerIp: () => {
    console.log('getServerIp appelé')
    return ipcRenderer.invoke('get-server-ip')
  },
  onUpdateAvailable: (callback) => {
    console.log('onUpdateAvailable exposé')
    ipcRenderer.on('update_available', callback)
  },
  onUpdateDownloaded: (callback) => {
    console.log('onUpdateDownloaded exposé')
    ipcRenderer.on('update_downloaded', callback)
  },
  installUpdate: () => {
    console.log('installUpdate appelé')
    ipcRenderer.send('install_update')
  }
})
