// src/components/WalletSimulation.jsx
import useStore from '../store/store';

const WalletSimulation = () => {
  const chains = useStore((state) => state.chains);
  const usdPrice = useStore((state) => state.usdPrice);
  const transactionAmount = useStore((state) => state.transactionAmount);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);

  if (mode !== 'simulation') return null;

  const calculateCost = (chain) => {
    const baseFee = chains[chain].baseFee;
    const priorityFee = chains[chain].priorityFee;
    const gasLimit = 21000; // Standard ETH transfer
    const totalGas = baseFee + priorityFee;
    const gasCostETH = (totalGas * gasLimit) / 1e9; // Convert from gwei to ETH
    const txValueETH = transactionAmount;
    const totalCostETH = gasCostETH + txValueETH;
    const totalCostUSD = totalCostETH * usdPrice;
    
    return {
      gasCostETH,
      txValueETH,
      totalCostETH,
      totalCostUSD,
    };
  };

  const chainData = Object.keys(chains).map((chain) => ({
    name: chain,
    ...calculateCost(chain),
  }));

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-200">Simulation Results</h3>
        <button
          onClick={() => setMode('live')}
          className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 py-1 px-3 rounded transition duration-150"
        >
          Back to Live Mode
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Chain</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Gas Cost (ETH)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tx Value (ETH)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Cost (ETH)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total Cost (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {chainData.map((chain) => (
              <tr key={chain.name}>
                <td className="px-4 py-2 text-slate-200 capitalize">{chain.name}</td>
                <td className="px-4 py-2 text-slate-200">{chain.gasCostETH.toFixed(6)}</td>
                <td className="px-4 py-2 text-slate-200">{chain.txValueETH.toFixed(6)}</td>
                <td className="px-4 py-2 text-slate-200">{chain.totalCostETH.toFixed(6)}</td>
                <td className="px-4 py-2 text-slate-200">${chain.totalCostUSD.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletSimulation;