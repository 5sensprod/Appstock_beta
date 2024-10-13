import { useState } from 'react'

const Login = () => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')

  // Fonction pour ajouter un chiffre au champ PIN
  const appendPin = (number) => {
    if (pin.length < 4) {
      setPin(pin + number)
    }
  }

  // Fonction pour effacer le PIN
  const clearPin = () => {
    setPin('')
  }

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Appel à l'API Flask pour authentification
    const response = await fetch(
      'http://localhost:5000/api/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, pin })
      }
    )

    const data = await response.json()

    if (data.success) {
      // Redirection ou gestion de succès
      alert('Connexion réussie')
    } else {
      // Gestion des erreurs
      alert('Échec de la connexion')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-bold">
          Connexion au POS
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              placeholder="admin"
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code PIN
            </label>
            <input
              type="password"
              value={pin}
              readOnly
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
              placeholder="****"
            />
          </div>

          {/* Pavé numérique */}
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
                className="rounded-md bg-gray-200 p-4"
                onClick={() => appendPin(number)}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              className="rounded-md bg-gray-200 p-4"
              onClick={clearPin}
            >
              Effacer
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 p-4 text-white"
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
