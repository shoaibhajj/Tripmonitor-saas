import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * App-wide dark/light mode. Toggling flips the `dark` class on
 * <html>, which is what every design token in index.css keys off
 * of (see the :root / .dark blocks) — so this ONE toggle covers
 * the marketing site, the auth screens, and the map dashboard.
 *
 * Adding a new page that needs to react to theme? Just read
 * `darkMode` from useTheme() — no wiring required, the CSS
 * variables already respond automatically.
 */

const STORAGE_KEY = 'tripmonitor-theme'

interface ThemeContextType {
  darkMode: boolean
  toggleDark: () => void
  setDarkMode: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDark: () => {},
  setDarkMode: () => {},
})

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem(STORAGE_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDark = () => setDarkMode(d => !d)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
