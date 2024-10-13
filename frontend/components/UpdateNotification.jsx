import { useEffect, useState } from 'react'

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0) // État pour la progression
  const [showNotification, setShowNotification] = useState(true) // État pour masquer ou montrer la notification

  useEffect(() => {
    if (typeof window !== 'undefined' && window.api) {
      console.log('window.api est défini, accès à Electron API')

      // Écouter les événements depuis Electron via la fenêtre
      window.api.onUpdateAvailable(() => {
        console.log('Mise à jour disponible détectée')
        setUpdateAvailable(true)
        setShowNotification(true) // Montrer la notification
      })

      window.api.onUpdateDownloaded(() => {
        console.log('Mise à jour téléchargée détectée')
        setUpdateAvailable(false) // Masquer la notification de téléchargement en cours
        setUpdateDownloaded(true) // Afficher la notification de mise à jour prête
      })

      // Écouter la progression du téléchargement
      window.api.onDownloadProgress((progressObj) => {
        console.log(`Téléchargement à ${progressObj.percent}%`)
        setDownloadProgress(Math.round(progressObj.percent)) // Mettre à jour la jauge de progression
      })
    } else {
      console.warn("window.api n'est pas défini, vérifiez preload.js")
    }

    return () => {
      if (typeof window !== 'undefined' && window.api) {
        console.log('Nettoyage des événements')
        window.api.onUpdateAvailable(() => {})
        window.api.onUpdateDownloaded(() => {})
      }
    }
  }, [])

  const installUpdate = () => {
    if (typeof window !== 'undefined' && window.api) {
      console.log('Installation de la mise à jour demandée')
      window.api.installUpdate()
    }
  }

  const postponeUpdate = () => {
    console.log('Mise à jour reportée, sera appliquée au prochain démarrage ou à la fermeture')
    setShowNotification(false) // Masquer la notification
  }

  const closeNotification = () => {
    setShowNotification(false) // Masquer la notification manuellement
  }

  return (
    showNotification && (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        {updateAvailable && (
          <div className="relative mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 shadow-lg">
            <button
              onClick={closeNotification}
              className="absolute right-0 top-0 p-1 text-gray-500 hover:text-gray-700"
            >
              × {/* Bouton pour fermer la notification */}
            </button>
            <p className="font-bold">Mise à jour disponible</p>
            <p>Le téléchargement de la mise à jour est en cours...</p>
            <div className="relative pt-1">
              <div className="mb-4 flex h-2 overflow-hidden rounded bg-blue-200 text-xs">
                <div
                  style={{ width: `${downloadProgress}%` }}
                  className="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none"
                ></div>
              </div>
              <p>Téléchargé : {downloadProgress}%</p>
            </div>
          </div>
        )}

        {updateDownloaded && (
          <div className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700 shadow-lg">
            <button
              onClick={closeNotification}
              className="absolute right-0 top-0 p-1 text-gray-500 hover:text-gray-700"
            >
              × {/* Bouton pour fermer la notification */}
            </button>
            <p className="font-bold">Mise à jour prête</p>
            <p>La mise à jour est prête à être installée.</p>
            <div className="flex justify-between">
              <button
                onClick={installUpdate}
                className="mr-2 mt-3 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                Redémarrer et installer
              </button>
              <button
                onClick={postponeUpdate}
                className="mt-3 rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
              >
                Installer plus tard
              </button>
            </div>
          </div>
        )}
      </div>
    )
  )
}

export default UpdateNotification
