const fs = require('fs')
const path = require('path')
const shutil = require('fs-extra')

// Définition des chemins source et destination pour Next.js
const sourceDir = path.join(__dirname, '../out') // Répertoire de build exporté de Next.js
const destDir = path.join(__dirname, '../../backend/react_build') // Destination dans le backend

// Vérification de l'existence du répertoire source
if (!fs.existsSync(sourceDir)) {
  console.error("❌ Erreur : Le dossier de build Next.js n'a pas été trouvé.")
  process.exit(1)
}

// Supprimer l'ancien dossier react_build s'il existe
if (fs.existsSync(destDir)) {
  console.log("📁 Suppression de l'ancien dossier react_build...")
  shutil.removeSync(destDir)
}

// Copier le dossier build de Next.js vers backend/react_build
console.log('📦 Copie du dossier build de Next.js vers backend/react_build...')
shutil.copySync(sourceDir, destDir)
console.log('✅ Dossier de build copié avec succès.')
