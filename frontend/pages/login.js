import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '../context/UserContext'

const Login = () => {
  const [username, setUsername] =
    useState('admin') // Ajout de l'état pour le nom d'utilisateur
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const { handleLogin } = useContext(UserContext) // Utilisation de la fonction handleLogin du contexte
  const router = useRouter()

  // Fonction pour ajouter un chiffre au champ PIN
  const appendPin = (number) => {
    if (pin.length < 4) {
      setPin((prevPin) => prevPin + number)
    }
  }

  // Fonction pour effacer le PIN
  const clearPin = () => {
    setPin('')
  }

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await handleLogin(
        username,
        pin
      ) // Utilisation de l'état `username`
      if (data.success) {
        router.push('/home') // Redirection vers /home après succès
      } else {
        setError(
          'Échec de la connexion : Nom ou code PIN incorrect'
        )
      }
    } catch (err) {
      setError(
        'Erreur lors de la connexion : Veuillez réessayer'
      )
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg p-6 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-bold">
          Connexion au POS
        </h2>

        {error && (
          <div className="mb-4 text-center text-red-500">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username} // Utilisation de l'état `username`
              onChange={(e) =>
                setUsername(e.target.value)
              } // Permettre à l'utilisateur de changer le nom d'utilisateur
              className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text mt-1 w-full rounded-md border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Code PIN
            </label>
            <input
              type="password"
              value={pin}
              className="bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text mt-1 w-full rounded-md border p-2"
              placeholder="****"
              readOnly
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '0'
            ].map((number) => (
              <button
                key={number}
                type="button"
                className="rounded-md p-4"
                onClick={() => appendPin(number)}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              className="col-span-2 rounded-md p-4"
              onClick={clearPin}
            >
              Effacer
            </button>
            <button
              type="submit"
              className="col-span-1 rounded-md bg-blue-500 p-4 text-white"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
