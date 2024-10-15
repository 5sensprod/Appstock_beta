// pages/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import useAuth from '../hooks/useAuth'
import NumericKeypad from '../components/NumericKeypad'

const Login = () => {
  const [username, setUsername] =
    useState('admin')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const { handleLogin } = useAuth()
  const router = useRouter()

  const appendPin = (number) => {
    if (pin.length < 4) {
      setPin((prevPin) => prevPin + number)
    }
  }

  const clearPin = () => {
    setPin('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await handleLogin(
        username,
        pin
      )
      if (data.success) {
        router.push('/home')
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
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="mt-1 w-full rounded-md border bg-light-background p-2 text-light-text dark:bg-dark-background dark:text-dark-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Code PIN
            </label>
            <input
              type="password"
              value={pin}
              className="mt-1 w-full rounded-md border bg-light-background p-2 text-light-text dark:bg-dark-background dark:text-dark-text"
              placeholder="****"
              readOnly
            />
          </div>

          <NumericKeypad
            appendPin={appendPin}
            clearPin={clearPin}
          />

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 p-4 text-white"
          >
            Valider
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
