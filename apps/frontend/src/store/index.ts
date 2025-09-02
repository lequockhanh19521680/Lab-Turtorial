import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './slices/projectsSlice'
import uiReducer from './slices/uiSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    ui: uiReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch