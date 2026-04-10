const { transformPrices } = require('../src/transforms/marketTransform');

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
