const { transformPrices, transformTraditionalPrices } = require('../src/transforms/marketTransform');

describe('transformPrices', () => {
  it('should transform raw CoinGecko response into ticker DTOs', () => {
    const rawResponse = {
      bitcoin: { usd: 67432.12, usd_24h_change: 2.34567 },
      ethereum: { usd: 3521.45, usd_24h_change: -1.23456 },
      solana: { usd: 142.67, usd_24h_change: 5.6789 },
      binancecoin: { usd: 598.32, usd_24h_change: 0.98765 },
      ripple: { usd: 0.5423, usd_24h_change: -3.21098 },
    };

    const result = transformPrices(rawResponse);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67432.12,
      change24h: 2.35,
    });
    expect(result[1]).toEqual({
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3521.45,
      change24h: -1.23,
    });
  });

  it('should return change24h as 0 when CoinGecko returns null', () => {
    const rawResponse = {
      bitcoin: { usd: 67432.12, usd_24h_change: null },
    };

    const result = transformPrices(rawResponse);

    expect(result[0].change24h).toBe(0);
  });

  it('should skip coins not in the mapping', () => {
    const rawResponse = {
      bitcoin: { usd: 67432.12, usd_24h_change: 2.34 },
      dogecoin: { usd: 0.12, usd_24h_change: 10.5 },
    };

    const result = transformPrices(rawResponse);

    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe('BTC');
  });

  it('should handle empty response', () => {
    const result = transformPrices({});

    expect(result).toEqual([]);
  });
});

describe('transformTraditionalPrices', () => {
  it('should transform stock quote raw data into ticker DTOs', () => {
    const rawAssets = [
      { symbol: 'S&P 500', name: 'S&P 500', raw: { '01. symbol': 'SPY', '05. price': '520.45', '10. change percent': '0.85%' } },
    ];

    const result = transformTraditionalPrices(rawAssets);

    expect(result).toEqual([
      { symbol: 'S&P 500', name: 'S&P 500', price: 520.45, change24h: 0.85 },
    ]);
  });

  it('should transform currency exchange rate raw data into ticker DTOs', () => {
    const rawAssets = [
      { symbol: 'EUR/USD', name: 'EUR/USD', raw: { '5. Exchange Rate': '1.0845', '9. Last Refreshed': '2024-01-15' } },
    ];

    const result = transformTraditionalPrices(rawAssets);

    expect(result).toEqual([
      { symbol: 'EUR/USD', name: 'EUR/USD', price: 1.0845, change24h: 0 },
    ]);
  });

  it('should default change24h to 0 when change percent is absent', () => {
    const rawAssets = [
      { symbol: 'S&P 500', name: 'S&P 500', raw: { '01. symbol': 'SPY', '05. price': '520.45' } },
    ];

    const result = transformTraditionalPrices(rawAssets);

    expect(result[0].change24h).toBe(0);
  });

  it('should handle mixed quote and currency rate data', () => {
    const rawAssets = [
      { symbol: 'S&P 500', name: 'S&P 500', raw: { '01. symbol': 'SPY', '05. price': '520.45', '10. change percent': '0.85%' } },
      { symbol: 'Gold', name: 'Gold', raw: { '01. symbol': 'GLD', '05. price': '2340.50', '10. change percent': '1.20%' } },
      { symbol: 'EUR/USD', name: 'EUR/USD', raw: { '5. Exchange Rate': '1.0845', '9. Last Refreshed': '2024-01-15' } },
    ];

    const result = transformTraditionalPrices(rawAssets);

    expect(result).toHaveLength(3);
    expect(result[0].price).toBe(520.45);
    expect(result[1].price).toBe(2340.50);
    expect(result[2].price).toBe(1.0845);
  });
});
