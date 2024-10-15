const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

// Déterminer le chemin correct pour les fichiers statiques
const staticPath =
  process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../frontend/out') // En développement
    : path.join(
        process.resourcesPath,
        'frontend',
        'out'
      ) // En production, après packaging

// Servir les fichiers statiques exportés par Next.js
app.use(express.static(staticPath))

// Gérer toutes les routes pour retourner `index.html` (ceci permet à l'application d'utiliser le routage côté client)
app.get('*', (req, res) => {
  res.sendFile(
    path.join(staticPath, 'index.html')
  )
})

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(
    `Le serveur Express est en cours d'exécution sur http://localhost:${port} et est accessible sur le réseau local.`
  )
})
