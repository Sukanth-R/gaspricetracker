// src/hooks/useWebSocketProviders.js
import { useEffect } from 'react';
import { ethers } from 'ethers';
import useStore from '../store/store';

const RPC_URLS = {
  ethereum: 'wss://mainnet.infura.io/ws/v3/97581b99c9494e28ad8fe00ed196271b',
  polygon: 'wss://polygon-mainnet.infura.io/ws/v3/97581b99c9494e28ad8fe00ed196271b',
  arbitrum: 'wss://arbitrum-mainnet.infura.io/ws/v3/97581b99c9494e28ad8fe00ed196271b',
};

const useWebSocketProviders = () => {
  const setChainData = useStore((state) => state.setChainData);

  useEffect(() => {
    const providers = {};
    const cleanupFunctions = {};

    Object.keys(RPC_URLS).forEach((chain) => {
      providers[chain] = new ethers.providers.WebSocketProvider(RPC_URLS[chain]);
      
      const handleBlock = async (blockNumber) => {
        try {
          const block = await providers[chain].getBlock(blockNumber);
          const baseFee = ethers.utils.formatUnits(block.baseFeePerGas || '0', 'gwei');
          const priorityFee = ethers.utils.formatUnits(block.maxPriorityFeePerGas || '0', 'gwei');
          
          setChainData(chain, {
            baseFee: parseFloat(baseFee),
            priorityFee: parseFloat(priorityFee),
          });
        } catch (error) {
          console.error(`Error fetching block for ${chain}:`, error);
        }
      };

      providers[chain].on('block', handleBlock);
      
      cleanupFunctions[chain] = () => {
        providers[chain].off('block', handleBlock);
        providers[chain].destroy();
      };
    });

    return () => {
      Object.keys(cleanupFunctions).forEach((chain) => {
        cleanupFunctions[chain]();
      });
    };
  }, [setChainData]);
};

export default useWebSocketProviders;