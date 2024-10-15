import '../styles/global.css' // Importer les styles globaux
import Navbar from '../components/Navbar'
import { ThemeProvider } from '../context/ThemeContext'
import { UserProvider } from '../context/UserContext'
import AuthChecker from '../components/AuthChecker'
import ThemeWrapper from '../components/ThemeWrapper'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThemeWrapper>
          <AuthChecker>
            <Navbar />{' '}
            {/* Navbar est affichée une seule fois */}
            <Component {...pageProps} />{' '}
            {/* Affiche la page courante */}
          </AuthChecker>
        </ThemeWrapper>
      </UserProvider>
    </ThemeProvider>
  )
}

export default MyApp
