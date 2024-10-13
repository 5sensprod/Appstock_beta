import { useEffect, useState } from 'react'

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)

  useEffect(() => {
    // Écouter les événements depuis Electron via la fenêtre
    window.api.onUpdateAvailable(() => {
      setUpdateAvailable(true)
    })

    window.api.onUpdateDownloaded(() => {
      setUpdateDownloaded(true)
    })

    // Nettoyage des listeners lors du démontage du composant
    return () => {
      window.api.onUpdateAvailable(() => {})
      window.api.onUpdateDownloaded(() => {})
    }
  }, [])

  const installUpdate = () => {
    window.api.installUpdate() // Demande d'installation de la mise à jour
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {updateAvailable && (
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 shadow-lg">
          <p className="font-bold">Mise à jour disponible</p>
          <p>Le téléchargement est en cours...</p>
        </div>
      )}
      {updateDownloaded && (
        <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700 shadow-lg">
          <p className="font-bold">Mise à jour prête</p>
          <p>La mise à jour est prête à être installée.</p>
          <button
            onClick={installUpdate}
            className="mt-3 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
          >
            Redémarrer et installer
          </button>
        </div>
      )}
    </div>
  )
}

export default UpdateNotification
