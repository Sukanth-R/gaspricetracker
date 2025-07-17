// src/components/GasPriceChart.jsx
import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts/dist/lightweight-charts.esm.production.js';
import useStore from '../store/store';

const GasPriceChart = ({ chain }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const history = useStore((state) => state.chains[chain].history);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    // 1. Create the chart
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1E293B' },
        textColor: '#E2E8F0',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        handleScroll: false, // Add this line
      },
    });

    // 2. Add candlestick series
    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#10B981',
      wickDownColor: '#EF4444',
      wickUpColor: '#10B981',
    });

    // 3. Handle window resize
    const handleResize = () => {
      chartRef.current.applyOptions({ 
        width: chartContainerRef.current.clientWidth 
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  // Update chart data when history changes
  useEffect(() => {
    if (!seriesRef.current || history.length === 0) return;

    // Process history into candlestick data
    const candles = processHistoryToCandles(history);
    seriesRef.current.setData(candles);
    chartRef.current.timeScale().fitContent();
  }, [history]);

  // Helper function to aggregate history into candles
  const processHistoryToCandles = (history) => {
    const candles = [];
    const interval = 15 * 60 * 1000; // 15 minutes in ms
    let currentCandle = null;
    let candleStartTime = null;

    history.forEach((point) => {
      const timestamp = point.timestamp;
      const totalFee = point.baseFee + point.priorityFee;
      
      if (!currentCandle || timestamp >= candleStartTime + interval) {
        // Push previous candle if exists
        if (currentCandle) candles.push(currentCandle);
        
        // Start new candle
        candleStartTime = timestamp - (timestamp % interval);
        currentCandle = {
          time: Math.floor(candleStartTime / 1000), // Convert to seconds
          open: totalFee,
          high: totalFee,
          low: totalFee,
          close: totalFee,
        };
      } else {
        // Update current candle
        currentCandle.high = Math.max(currentCandle.high, totalFee);
        currentCandle.low = Math.min(currentCandle.low, totalFee);
        currentCandle.close = totalFee;
      }
    });

    // Push the last candle
    if (currentCandle) candles.push(currentCandle);
    
    return candles;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        {chain.charAt(0).toUpperCase() + chain.slice(1)} Gas Price
      </h3>
      <div 
        ref={chartContainerRef} 
        className="w-full h-[300px]"
        style={{ minHeight: '300px' }} // Ensure minimum height
      />
    </div>
  );
};

export default GasPriceChart;