import { ThemeProvider } from "@/shared/lib/theme"
import { SessionProvider } from "@/app/providers/session-provider"
import { AppRouter } from "@/app/router/AppRouter"

function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AppRouter />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default App
