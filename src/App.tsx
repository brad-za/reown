import { useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi'
import { parseUnits } from 'viem'

const PROTOCCTPCONTRACTS: Record<number, `0x${string}`> = {
  11155111: '0xC46bc942ca64aed4Eb0B1Af21347944b85EDCb04', // Ethereum Sepolia
  421614: '0x040F70B724F1E7f8509848e750bbF10e20b73f60',   // Arbitrum Sepolia
  43113: '0x02986E15f847F4dc509F01B781E20F95da851b44'     // Avalanche Fuji
}

const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Sepolia',
  421614: 'Arbitrum Sepolia',
  43113: 'Avalanche Fuji'
}

function App() {
  const appKit = useAppKit()
  const { address, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()
  const [amount, setAmount] = useState('')
  const [sourceChain, setSourceChain] = useState<number>()
  const [destinationChain, setDestinationChain] = useState<number>()

  const handleTransfer = async () => {
    if (!address || !sourceChain || !destinationChain || !walletClient) {
      console.error('Missing required information')
      return
    }

    try {
      const requiredAmount = parseUnits(amount || '0', 6)
      const contractAddress = PROTOCCTPCONTRACTS[sourceChain]

      const transferHash = await walletClient.writeContract({
        address: contractAddress,
        abi: [{
          name: 'send',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'destinationChainId', type: 'uint256' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: []
        }],
        functionName: 'send',
        args: [BigInt(destinationChain), address, requiredAmount]
      })

      console.log('Transfer hash:', transferHash)
    } catch (error) {
      console.error('Transfer error:', error)
    }
  }

  const handleSwitchNetwork = async () => {
    if (!sourceChain) return
    try {
      await switchChain({ chainId: sourceChain })
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Reown Bridge</h1>

        {address ? (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <button
              onClick={() => appKit.open()}
              className="text-sm border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => appKit.open()}
            className="mb-4 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
          >
            Connect
          </button>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Source Chain</label>
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white"
            >
              <option value="">Select source chain</option>
              <option value="11155111">Sepolia</option>
              <option value="421614">Arbitrum Sepolia</option>
              <option value="43113">Avalanche Fuji</option>
            </select>
          </div>

          {sourceChain && chainId !== sourceChain && (
            <button
              onClick={handleSwitchNetwork}
              className="w-full border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50"
            >
              Switch to {CHAIN_NAMES[sourceChain]}
            </button>
          )}

          <div>
            <label className="block mb-1 text-sm">Destination Chain</label>
            <select
              value={destinationChain}
              onChange={(e) => setDestinationChain(Number(e.target.value))}
              disabled={!sourceChain}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select destination chain</option>
              {sourceChain !== 11155111 && <option value="11155111">Sepolia</option>}
              {sourceChain !== 421614 && <option value="421614">Arbitrum Sepolia</option>}
              {sourceChain !== 43113 && <option value="43113">Avalanche Fuji</option>}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm">Amount</label>
            <div className="flex items-center border border-gray-300 rounded bg-white">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.000001"
                className="flex-1 px-2 py-1.5 focus:outline-none"
              />
              <span className="pr-2 text-sm text-gray-500">USDC</span>
            </div>
          </div>

          <button
            onClick={handleTransfer}
            disabled={!sourceChain || !destinationChain || !amount || !address || chainId !== sourceChain}
            className="w-full border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Bridge
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
