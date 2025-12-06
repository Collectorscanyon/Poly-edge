import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export const useBankrTrade = () => {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);

  const copyEdgeViaBankr = async (market, size = 250) => {
    if (!ready || !authenticated) {
      login();
      return;
    }

    const wallet = wallets.find(w => w.chainId === 'base:8453');
    if (!wallet) return alert('Connect Base wallet');

    setLoading(true);
    try {
      const intent = `@bankrbot buy $${size} ${market.outcome} shares on "${market.question}". Max slippage 0.5%.`;
      const res = await fetch('https://api.bankr.bot/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_BANKR_API_KEY}` },
        body: JSON.stringify({ prompt: intent, wallet: wallet.address, chain: 'base' })
      });
      const data = await res.json();
      if (data.hash) alert(`Copied! Tx: ${data.hash}`);
      else alert('Trade failed — check Bankr');
    } catch (e) {
      alert('Bankr error — check console');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { copyEdgeViaBankr, loading, ready: ready && authenticated };
};
