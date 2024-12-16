// pages/_app.js
import '../styles/global.css'
import { ThemeProvider } from '../context/ThemeContext'
// import { UserProvider } from '../context/UserContext'
// import AuthChecker from '../components/AuthChecker'
import ThemeWrapper from '../components/ThemeWrapper'
import Navbar from '../components/Navbar'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      {/* <UserProvider> */}
      <ThemeWrapper>
        {/* <AuthChecker> */}
        <Navbar />
        <Component {...pageProps} />
        {/* </AuthChecker> */}
      </ThemeWrapper>
      {/* </UserProvider> */}
    </ThemeProvider>
  )
}

export default MyApp
