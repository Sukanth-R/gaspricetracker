import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts/dist/lightweight-charts.esm.production.js';
import useStore from '../store/store';

const GasPriceChart = ({ chain }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const history = useStore((state) => state.chains[chain].history);
  const isLoading = !history || history.length === 0;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

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
        handleScroll: true,
        handleScale: true,
      },
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#10B981',
      wickDownColor: '#EF4444',
      wickUpColor: '#10B981',
    });

    const handleResize = () => {
      chartRef.current.applyOptions({ 
        width: chartContainerRef.current.clientWidth 
      });
    };

    window.addEventListener('resize', handleResize);

    // ✅ Allow vertical scroll while hovering chart
    const chartEl = chartContainerRef.current;
    const wheelHandler = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        window.scrollBy(0, e.deltaY);
      }
    };
    chartEl.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      chartEl.removeEventListener('wheel', wheelHandler);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || history.length === 0) return;

    const candles = processHistoryToCandles(history);
    seriesRef.current.setData(candles);
    chartRef.current.timeScale().fitContent();
  }, [history]);

  // Convert raw gas data to candlestick format
  const processHistoryToCandles = (history) => {
    const candles = [];
    const interval = 15 * 60 * 1000; // 15 minutes
    let currentCandle = null;
    let candleStartTime = null;

    history.forEach((point) => {
      const timestamp = point.timestamp;
      const totalFee = point.baseFee + point.priorityFee;

      if (!currentCandle || timestamp >= candleStartTime + interval) {
        if (currentCandle) candles.push(currentCandle);

        candleStartTime = timestamp - (timestamp % interval);
        currentCandle = {
          time: Math.floor(candleStartTime / 1000),
          open: totalFee,
          high: totalFee,
          low: totalFee,
          close: totalFee,
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, totalFee);
        currentCandle.low = Math.min(currentCandle.low, totalFee);
        currentCandle.close = totalFee;
      }
    });

    if (currentCandle) candles.push(currentCandle);
    return candles;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 relative min-h-[300px]">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-800 bg-opacity-80 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        className="w-full h-[300px]"
        style={{ opacity: isLoading ? 0.3 : 1 }}
      />
    </div>
  );
};

export default GasPriceChart;
