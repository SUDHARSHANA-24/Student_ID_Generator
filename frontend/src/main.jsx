import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set absolute base URL for Axios in isolated frontend deployments
axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_APP_BASE_URL || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
