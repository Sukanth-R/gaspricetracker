// src/App.jsx
import GasPriceChart from './components/GasPriceChart';
import TransactionSimulator from './components/TransactionSimulator';
import WalletSimulation from './components/WalletSimulation';
import useWebSocketProviders from './hooks/useWebSocketProviders';
import useUniswapPrice from './hooks/useUniswapPrice';

function App() {
  useWebSocketProviders();
  useUniswapPrice();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">GAS PRICE TRACKER</h1>
          <p className="text-slate-400">Real-time gas prices with wallet simulation</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
          <div className="lg:col-span-2">
            <h1 className="font-bold text-2xl mb-6">Ethereum Gas Price</h1>
            <GasPriceChart chain="ethereum" />
            
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-2 mb-4">
          <h1 className="font-bold text-2xl mt-4 mb-2">Polygan Gas Price</h1>
          <GasPriceChart chain="polygon" />
          <h1 className="font-bold text-2xl mt-4 mb-2">Arbitrum Gas Price</h1>
          <GasPriceChart chain="arbitrum" />
          <div>
            <TransactionSimulator />
          </div>
        </div>

        <WalletSimulation />
      </div>
    </div>
  );
}

export default App;