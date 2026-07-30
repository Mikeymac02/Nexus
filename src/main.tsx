/* eslint-disable @typescript-eslint/ban-ts-comment */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore: CSS module import for side effects
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
