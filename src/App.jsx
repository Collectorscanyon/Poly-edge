import { PrivyProvider } from '@privy-io/react-auth'
import PolyEdgeScanner from './PolyEdgeScanner.jsx'

export default function App() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID

  if (!appId) {
    return (
      <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md bg-slate-900 rounded-2xl border border-purple-500/30 p-8">
          <h1 className="text-3xl font-bold mb-4">PolyEdge Scanner</h1>
          <p className="text-lg text-gray-300 mb-4">
            Missing Privy App ID
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Add <code className="bg-slate-700 px-2 py-1 rounded font-mono">VITE_PRIVY_APP_ID=your_id</code> to your environment variables.
          </p>
          <p className="text-xs text-gray-500">
            Get one free at <a href="https://privy.io" className="underline">privy.io</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['twitter', 'wallet'],
        embeddedWallets: { createOnLogin: true },
        appearance: { 
          theme: 'dark',
          logo: 'https://your-logo-url.com/logo.png' // Optional
        }
      }}
    >
      <PolyEdgeScanner />
    </PrivyProvider>
  )
}
