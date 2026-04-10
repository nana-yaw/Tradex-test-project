import { useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketPrices, useMarketChart } from '@/hooks/useMarketPrices';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const SYMBOL_TO_COIN_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
};

const TickerBar = () => {
  const { data: prices, isLoading } = useMarketPrices();
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const tickerRef = useRef<HTMLDivElement>(null);

  const coinId = hoveredCoin ? SYMBOL_TO_COIN_ID[hoveredCoin] : null;
  const { data: chartData } = useMarketChart(coinId ?? null);

  const handleMouseEnter = (symbol: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom + 8 });
    setHoveredCoin(symbol);
  };

  const handleMouseLeave = () => {
    setHoveredCoin(null);
  };

  if (isLoading || !prices) {
    return (
      <div className="w-full bg-card border-b border-border py-2">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          Loading market data...
        </div>
      </div>
    );
  }

  const chartPoints = chartData?.prices?.map(([timestamp, price]: [number, number]) => ({
    time: timestamp,
    price,
  }));

  // Duplicate items for seamless scroll loop
  const tickerItems = [...prices, ...prices];

  return (
    <>
      <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border overflow-hidden">
        <div
          ref={tickerRef}
          className="flex animate-scroll"
          style={{ width: 'max-content' }}
        >
          {tickerItems.map((item, index) => {
            const isPositive = item.change24h >= 0;
            return (
              <div
                key={`${item.symbol}-${index}`}
                className="flex items-center gap-2 px-6 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
                onMouseEnter={(e) => handleMouseEnter(item.symbol, e)}
                onMouseLeave={handleMouseLeave}
              >
                <span className="text-sm font-semibold text-foreground">
                  {item.symbol}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{item.change24h}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Popup */}
      {hoveredCoin && chartPoints && chartPoints.length > 0 && (
        <div
          className="fixed z-[100] bg-card border border-border rounded-lg shadow-xl p-4"
          style={{ left: popupPosition.x, top: popupPosition.y, width: 280, height: 180 }}
          onMouseEnter={() => setHoveredCoin(hoveredCoin)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="text-sm font-semibold mb-2">
            {hoveredCoin} — 24h Chart
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartPoints}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default TickerBar;
