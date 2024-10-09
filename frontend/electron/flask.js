// electron/flask.js
const path = require('path')
const { spawn } = require('child_process')
const net = require('net')
const treeKill = require('tree-kill')
const axios = require('axios')

let flaskProcess = null
let flaskIpAddress = 'localhost' // Par défaut

// Fonction pour vérifier si le port 5000 est déjà utilisé
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true)
      } else {
        resolve(false)
      }
    })

    server.once('listening', () => {
      server.close()
      resolve(false)
    })

    server.listen(port, '127.0.0.1')
  })
}

// Fonction pour lancer le serveur Flask
function startFlask() {
  const flaskExecutablePath = path.join(__dirname, '../../backend/dist/app.exe')

  flaskProcess = spawn(flaskExecutablePath, [], {
    stdio: 'ignore',
  })

  flaskProcess.on('error', (error) => {
    console.error(`Erreur lors du démarrage de Flask : ${error}`)
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

// Exporter les fonctions et variables nécessaires
module.exports = {
  isPortInUse,
  startFlask,
  stopFlask,
  fetchLocalIp,
  getFlaskIpAddress: () => flaskIpAddress,
}
