// backend/start_flask.js
const { spawn } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs')

function getPythonExecutable() {
  const venvDir = path.join(__dirname, '.venv')
  if (os.platform() === 'win32') {
    return path.join(venvDir, 'Scripts', 'python.exe')
  } else {
    return path.join(venvDir, 'bin', 'python')
  }
}

const pythonExecutable = getPythonExecutable()
const appPath = path.join(__dirname, 'app.py')

// Vérifier si l'interpréteur Python existe
if (!fs.existsSync(pythonExecutable)) {
  console.error(
    `Erreur : L'interpréteur Python n'a pas été trouvé à l'emplacement ${pythonExecutable}`
  )
  process.exit(1)
}

// Vérifier si app.py existe
if (!fs.existsSync(appPath)) {
  console.error(
    `Erreur : Le fichier app.py n'a pas été trouvé à l'emplacement ${appPath}`
  )
  process.exit(1)
}

// Définir les variables d'environnement
const env = Object.create(process.env)
env.FLASK_ENV = 'development'

// Lancer le serveur Flask
const flaskProcess = spawn(pythonExecutable, [appPath], {
  stdio: 'inherit',
  env,
})

flaskProcess.on('error', (err) => {
  console.error('Erreur lors du lancement du serveur Flask :', err)
})

flaskProcess.on('close', (code) => {
  console.log(`Le serveur Flask s'est arrêté avec le code ${code}`)
})

flaskProcess.on('exit', (code) => {
  console.log(`Le serveur Flask s'est terminé avec le code ${code}`)
})
