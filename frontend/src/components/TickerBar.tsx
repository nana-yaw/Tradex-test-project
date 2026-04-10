import { useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketPrices, useMarketChart } from '@/hooks/useMarketPrices';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

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
    setPopupPosition({ x: rect.left, y: rect.top - 8 });
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

  const hoveredItem = prices?.find((p) => p.symbol === hoveredCoin);
  const high24h = chartPoints ? Math.max(...chartPoints.map((p: { price: number }) => p.price)) : null;
  const low24h = chartPoints ? Math.min(...chartPoints.map((p: { price: number }) => p.price)) : null;

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
      {hoveredCoin && chartPoints && chartPoints.length > 0 && hoveredItem && (
        <div
          className="fixed z-[100] bg-card border border-border rounded-xl shadow-xl p-5"
          style={{ left: popupPosition.x, bottom: `calc(100vh - ${popupPosition.y}px)`, width: 340 }}
          onMouseEnter={() => setHoveredCoin(hoveredCoin)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-bold">{hoveredItem.name}</span>
            <span className="text-lg font-bold">
              ${hoveredItem.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{hoveredCoin}/USD</span>
            <span className={`flex items-center gap-1 text-sm font-medium ${hoveredItem.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {hoveredItem.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {hoveredItem.change24h >= 0 ? '+' : ''}{hoveredItem.change24h}% 24h
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartPoints}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={hoveredItem.change24h >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={hoveredItem.change24h >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="price"
                stroke={hoveredItem.change24h >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
                strokeWidth={2}
                fill="url(#chartGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          {high24h != null && low24h != null && (
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>24h Low: ${low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>24h High: ${high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TickerBar;
