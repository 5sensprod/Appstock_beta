import { useContext } from 'react'
import { UserContext } from '../context/UserContext' // Importer le contexte utilisateur

const WelcomeMessage = () => {
  const { username } = useContext(UserContext) // Accéder à l'état global de l'utilisateur

  return (
    <div className="text-lg font-semibold">
      {username ? `Bienvenue, ${username}` : ''}
    </div>
  )
}

export default WelcomeMessage
