// src/components/TransactionSimulator.jsx
import { useState } from 'react';
import useStore from '../store/store';

const TransactionSimulator = () => {
  const [amount, setAmount] = useState('');
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const setTransactionAmount = useStore((state) => state.setTransactionAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTransactionAmount(parseFloat(amount));
    setMode('simulation');
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">Transaction Simulator</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300">
            Amount to Transfer (ETH/MATIC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-200 p-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="0.5"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150"
        >
          Simulate Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionSimulator;