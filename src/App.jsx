import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import PolyEdgeScanner from './PolyEdgeScanner.jsx';

function Landing() {
  const { login } = usePrivy();

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          PolyEdge Scanner
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          The deadliest Polymarket edge scanner ever built.<br />
          Real markets • AI oracle • 1-click copy trading via @bankrbot
        </p>
        <button
          onClick={login}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all"
        >
          Login with X to Continue
        </button>
        <p className="text-sm text-gray-500 mt-8">
          50 alpha spots @ $299/mo — DM “POLYEDGE” on X
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!appId) {
    return <div className="text-red-500">Missing VITE_PRIVY_APP_ID</div>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['twitter', 'wallet'],
        embeddedWallets: { createOnLogin: true },
        appearance: { theme: 'dark' },
        dangerouslyAllowBrowser: true,
        twitter: {
          scope: 'tweet.read users.read offline.access'  // FIXED: no "useres.read" typo
        }
      }}
    >
      <AuthWrapper />
    </PrivyProvider>
  );
}

function AuthWrapper() {
  const { authenticated } = usePrivy();
  return authenticated ? <PolyEdgeScanner /> : <Landing />;
}
