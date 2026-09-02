import { createContext } from 'react'
import type { Theme } from '@/lib/theme'

export type ThemeContextValue = {
  theme: Theme
  alternarTema: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
