// frontend/electron/serverUtils.js
const axios = require('axios')

// Fonction pour vérifier si le serveur Flask est prêt
const checkServerReady = async () => {
  try {
    await axios.get('http://localhost:5000/get_local_ip')
    return true
  } catch (error) {
    return false
  }
}

// Fonction pour attendre que le serveur Flask soit prêt avant de continuer
const waitForServer = async (callback) => {
  let serverReady = false
  while (!serverReady) {
    serverReady = await checkServerReady()
    if (!serverReady) await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (callback) callback() // Appeler le callback une fois que le serveur est prêt
}

module.exports = {
  checkServerReady,
  waitForServer,
}
