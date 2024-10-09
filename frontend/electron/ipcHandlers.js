// electron/ipcHandlers.js
const { ipcMain } = require('electron')
const { fetchLocalIp, getFlaskIpAddress } = require('./flask')

// Gestionnaire IPC pour obtenir l'IP du serveur
ipcMain.handle('get-server-ip', async () => {
  await fetchLocalIp()
  return getFlaskIpAddress()
})

module.exports = {
  // Exporter ipcMain si nécessaire
}
