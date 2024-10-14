import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    // Redirige automatiquement vers /login dès l'accès à la page /
    router.push('/login')
  }, [router])

  return null // Ne rien afficher car la redirection est immédiate
}
