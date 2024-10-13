// frontend/electron/menu.js
const { Menu } = require('electron')

function createCustomMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [{ label: 'Quitter', role: 'quit' }]
    },
    {
      label: 'Édition',
      submenu: [
        { label: 'Annuler', role: 'undo' },
        { label: 'Rétablir', role: 'redo' },
        { type: 'separator' },
        { label: 'Couper', role: 'cut' },
        { label: 'Copier', role: 'copy' },
        { label: 'Coller', role: 'paste' },
        { label: 'Tout sélectionner', role: 'selectAll' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Recharger', role: 'reload' },
        { label: 'Forcer le rechargement', role: 'forceReload' },
        { label: 'Outils de développement', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom avant', role: 'zoomIn' },
        { label: 'Zoom arrière', role: 'zoomOut' },
        { label: 'Réinitialiser le zoom', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Mode plein écran', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { label: 'Minimiser', role: 'minimize' },
        { label: 'Fermer', role: 'close' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            /* Lancer la documentation */
          }
        },
        { label: 'À propos', role: 'about' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = {
  createCustomMenu
}
