// src/store/store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  mode: 'live', // 'live' or 'simulation'
  chains: {
    ethereum: { baseFee: 0, priorityFee: 0, history: [] },
    polygon: { baseFee: 0, priorityFee: 0, history: [] },
    arbitrum: { baseFee: 0, priorityFee: 0, history: [] },
  },
  usdPrice: 0,
  transactionAmount: 0,
  setMode: (mode) => set({ mode }),
  setChainData: (chain, data) => set((state) => ({
    chains: {
      ...state.chains,
      [chain]: {
        ...state.chains[chain],
        ...data,
        history: [...state.chains[chain].history, {
          timestamp: Date.now(),
          baseFee: data.baseFee,
          priorityFee: data.priorityFee,
        }].slice(-60) // Keep last 60 data points (~15 minutes at 15s intervals)
      }
    }
  })),
  setUsdPrice: (price) => set({ usdPrice: price }),
  setTransactionAmount: (amount) => set({ transactionAmount: amount }),
}));

export default useStore;