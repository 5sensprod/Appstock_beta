// src/hooks/useServerIp.js
import { useState, useEffect } from 'react'

const useServerIp = () => {
  const [serverIp, setServerIp] = useState('')

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Mode développement : utilisation du proxy pour les appels API.',
      )
    } else {
      if (window.api && typeof window.api.getServerIp === 'function') {
        window.api
          .getServerIp()
          .then((ip) => {
            setServerIp(ip)
            console.log(`IP du serveur Flask récupérée : ${ip}`)
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la récupération de l'IP via Electron :",
              error,
            )
          })
      } else {
        const ip = window.location.hostname
        setServerIp(ip)
        console.log(
          `Utilisation de l'IP du serveur Flask depuis window.location.hostname : ${ip}`,
        )
      }
    }
  }, [])

  return serverIp
}

export default useServerIp
