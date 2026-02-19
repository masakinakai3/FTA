/*
 * Copyright (c) 2026 masakinakai3
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
