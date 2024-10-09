const { contextBridge, ipcRenderer } = require('electron')

console.log('preload.js chargé avec succès') // Journal pour vérifier le chargement

// Exposer les méthodes à l'interface utilisateur de l'application via window.api
contextBridge.exposeInMainWorld('api', {
  getServerIp: () => ipcRenderer.invoke('get-server-ip'),
})
