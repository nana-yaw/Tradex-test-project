const { fetchTraditionalPrices } = require('../src/services/providers/alphavantage');

describe('Alpha Vantage Provider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return transformed traditional asset prices', async () => {
    const mockGlobalQuote = (symbol, price, changePercent) => ({
      'Global Quote': {
        '01. symbol': symbol,
        '05. price': price,
        '10. change percent': changePercent,
      },
    });

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGlobalQuote('SPY', '520.45', '0.85%'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'Realtime Currency Exchange Rate': {
            '5. Exchange Rate': '2340.50',
            '9. Last Refreshed': '2024-01-15',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'Realtime Currency Exchange Rate': {
            '5. Exchange Rate': '1.0845',
            '9. Last Refreshed': '2024-01-15',
          },
        }),
      });

    const result = await fetchTraditionalPrices();

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      symbol: 'S&P 500',
      name: 'S&P 500',
      price: 520.45,
      change24h: 0.85,
    });
    expect(result[1]).toEqual({
      symbol: 'Gold',
      name: 'Gold',
      price: 2340.50,
      change24h: 0,
    });
    expect(result[2]).toEqual({
      symbol: 'EUR/USD',
      name: 'EUR/USD',
      price: 1.0845,
      change24h: 0,
    });
  });

  it('should return empty array when all requests fail', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const result = await fetchTraditionalPrices();

    expect(result).toEqual([]);
  });

  it('should return partial results when some requests fail', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'Global Quote': {
            '01. symbol': 'SPY',
            '05. price': '520.45',
            '10. change percent': '0.85%',
          },
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await fetchTraditionalPrices();

    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe('S&P 500');
  });
});
