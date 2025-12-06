import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.jsx'
import './index.css'

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'demo-app-id'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider appId={privyAppId} config={{ defaultChain: 'base' }}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
)
