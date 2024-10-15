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
        console.log(
          `Le port ${port} est déjà utilisé.`
        )
        resolve(true)
      } else {
        console.error(
          `Erreur lors de la vérification du port ${port}: ${err.message}`
        )
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
  const flaskExecutablePath =
    process.env.NODE_ENV === 'development'
      ? path.join(
          __dirname,
          '../../backend/dist/app.exe'
        ) // Chemin en développement
      : path.join(
          process.resourcesPath,
          'backend',
          'app.exe'
        ) // Chemin en production (après empaquetage)

  console.log(
    `Démarrage de Flask à partir de ${flaskExecutablePath}...`
  )

  flaskProcess = spawn(flaskExecutablePath, [], {
    cwd: path.dirname(flaskExecutablePath), // Répertoire de travail de l'exécutable
    detached: true, // Pour exécuter Flask en arrière-plan
    stdio: 'ignore' // Ignore les sorties du processus pour éviter de surcharger la console
  })

  flaskProcess.unref() // Détacher le processus pour qu'il fonctionne en arrière-plan

  flaskProcess.on('error', (error) => {
    console.error(
      `Erreur lors du démarrage de Flask : ${error.message}`
    )
  })

  flaskProcess.on('close', (code) => {
    console.log(
      `Le processus Flask s'est terminé avec le code ${code}`
    )
  })
}

// Fonction pour arrêter le serveur Flask
function stopFlask() {
  if (flaskProcess) {
    console.log('Arrêt du serveur Flask...')
    treeKill(
      flaskProcess.pid,
      'SIGKILL',
      (err) => {
        if (err) {
          console.error(
            `Erreur lors de l'arrêt du serveur Flask : ${err.message}`
          )
        } else {
          console.log(
            'Serveur Flask arrêté avec succès.'
          )
        }
        flaskProcess = null
      }
    )
  } else {
    console.log(
      "Aucun processus Flask en cours d'exécution."
    )
  }
}

// Fonction pour récupérer dynamiquement l'adresse IP locale du serveur Flask
async function fetchLocalIp() {
  try {
    const response = await axios.get(
      'http://127.0.0.1:5000/get_local_ip'
    )
    flaskIpAddress = response.data.local_ip
    console.log(
      `IP locale du serveur Flask récupérée : ${flaskIpAddress}`
    )
  } catch (error) {
    console.error(
      "Impossible de récupérer l'IP locale du serveur Flask :",
      error.message
    )
  }
}

// Exporter les fonctions et variables nécessaires
module.exports = {
  isPortInUse,
  startFlask,
  stopFlask,
  fetchLocalIp,
  getFlaskIpAddress: () => flaskIpAddress
}
