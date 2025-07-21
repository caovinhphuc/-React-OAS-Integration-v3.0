import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import apiSlice from './slices/apiSlice'
import uiSlice from './slices/uiSlice'
import schemaSlice from './slices/schemaSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    api: apiSlice,
    ui: uiSlice,
    schema: schemaSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch