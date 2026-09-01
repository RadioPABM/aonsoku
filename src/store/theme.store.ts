import merge from 'lodash/merge'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'
import { IThemeContext, Theme } from '@/types/themeContext'
import { getValidThemeFromEnv } from '@/utils/theme'

const appThemeFromEnv = getValidThemeFromEnv()

export const useThemeStore = createWithEqualityFn<IThemeContext>()(
  subscribeWithSelector(
    persist(
      devtools(
        immer((set) => ({
          theme: appThemeFromEnv || Theme.RadioPabm,
          setTheme: (theme: Theme) => {
            set((state) => {
              state.theme = theme
            })
          },
        })),
        {
          name: 'theme_store',
        },
      ),
      {
        name: 'theme_store',
        version: 2,
        // Installs that never picked a theme were pinned to the old default,
        // so they move to the brand one; anything else stays as chosen.
        migrate: (persistedState, version) => {
          if (version >= 2) return persistedState

          const state = persistedState as Partial<IThemeContext> | undefined

          if (state?.theme === Theme.Dark) {
            return { ...state, theme: Theme.RadioPabm }
          }

          return persistedState
        },
        merge: (persistedState, currentState) => {
          if (appThemeFromEnv) {
            if (persistedState && typeof persistedState === 'object') {
              persistedState = {
                ...persistedState,
                theme: appThemeFromEnv,
              }
            }
          }

          return merge(currentState, persistedState)
        },
      },
    ),
  ),
)

export const useTheme = () => useThemeStore((state) => state)
