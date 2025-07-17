// src/hooks/useUniswapPrice.js
import { useEffect } from 'react';
import { ethers } from 'ethers';
import useStore from '../store/store';

const UNISWAP_V3_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';
const ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

const useUniswapPrice = () => {
  const setUsdPrice = useStore((state) => state.setUsdPrice);
  const provider = new ethers.providers.WebSocketProvider('wss://mainnet.infura.io/ws/v3/97581b99c9494e28ad8fe00ed196271b');

  useEffect(() => {
    const contract = new ethers.Contract(UNISWAP_V3_POOL, ABI, provider);
    
    const calculatePriceFromSqrtX96 = (sqrtPriceX96) => {
      // sqrtPriceX96 is a Q64.96 value
      const bnSqrtPrice = ethers.BigNumber.from(sqrtPriceX96);
      const price = bnSqrtPrice.mul(bnSqrtPrice)
        .mul(ethers.BigNumber.from(10).pow(18)) // scale for ETH decimals
        .div(ethers.BigNumber.from(2).pow(192));
      // USDC/ETH pool: price is USDC per 1 ETH, so divide by 1e6 for USDC decimals
      return parseFloat(ethers.utils.formatUnits(price, 6));
    };

    const handleSwap = (sender, recipient, amount0, amount1, sqrtPriceX96) => {
      const price = calculatePriceFromSqrtX96(sqrtPriceX96);
      setUsdPrice(price);
    };

    contract.on('Swap', handleSwap);
    // Initial price fetch
    const fetchInitialPrice = async () => {
      try {
        const slot0 = await contract.slot0();
        console.log('Raw sqrtPriceX96:', slot0.sqrtPriceX96.toString());
        const price = calculatePriceFromSqrtX96(slot0.sqrtPriceX96);
        console.log('Calculated USD price:', price);
        setUsdPrice(price);
      } catch (error) {
        console.error('Error fetching initial price:', error);
      }
    };
    fetchInitialPrice();
    return () => {
      contract.off('Swap', handleSwap);
      provider.destroy();
    };
  }, [setUsdPrice]);
};
export default useUniswapPrice;