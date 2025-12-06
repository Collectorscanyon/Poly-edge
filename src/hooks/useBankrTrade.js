import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function useBankrTrade() {
  const { ready, authenticated, login, user } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const baseWallet = (() => {
    if (!user) return null
    const allWallets = [...(user.wallets || []), ...(user.linkedAccounts || [])]
    return allWallets.find((w) => w.chainId === 'base:8453') || allWallets[0] || null
  })()

  const isBankrReady = ready && authenticated && !!baseWallet

  const executeWithBankr = useCallback(
    async (market, sizeUsd = 250) => {
      setError(null)

      if (!ready) {
        throw new Error('Privy not ready yet')
      }

      if (!authenticated) {
        await login()
        return
      }

      if (!baseWallet) {
        throw new Error('No Base wallet found in Privy')
      }

      const intent = `@bankrbot buy $${sizeUsd} YES shares on "${market.question}" Max slippage 0.5%.`

      setLoading(true)
      try {
        const res = await fetch('https://api.bankr.bot/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: intent,
            wallet: baseWallet.address,
            chain: 'base'
          })
        })

        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          throw new Error(`Bankr API error ${res.status}: ${txt}`)
        }

        return await res.json()
      } catch (err) {
        console.error('Bankr execution failed:', err)
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [ready, authenticated, baseWallet, login]
  )

  return { executeWithBankr, isBankrReady, loading, error }
}
