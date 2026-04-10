const { getPrices, getChart } = require('../src/services/marketService');
const cache = require('../src/services/cache');
const coingecko = require('../src/services/providers/coingecko');

jest.mock('../src/services/cache');
jest.mock('../src/services/providers/coingecko');

describe('Market Service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPrices', () => {
    it('should return transformed ticker DTOs', async () => {
      const rawPrices = {
        bitcoin: { usd: 67432.12, usd_24h_change: 2.345 },
        ethereum: { usd: 3521.45, usd_24h_change: -1.237 },
      };

      cache.getOrFetch.mockImplementation(async (_key, fetchFn) => fetchFn());
      coingecko.fetchPrices.mockResolvedValue(rawPrices);

      const result = await getPrices();

      expect(result).toEqual([
        { symbol: 'BTC', name: 'Bitcoin', price: 67432.12, change24h: 2.35 },
        { symbol: 'ETH', name: 'Ethereum', price: 3521.45, change24h: -1.24 },
      ]);
    });

    it('should pass correct cache key and TTL', async () => {
      cache.getOrFetch.mockResolvedValue({});

      await getPrices();

      expect(cache.getOrFetch).toHaveBeenCalledWith(
        'prices',
        expect.any(Function),
        30000
      );
    });

    it('should return empty array when provider returns null', async () => {
      cache.getOrFetch.mockResolvedValue(null);

      const result = await getPrices();

      expect(result).toEqual([]);
    });
  });

  describe('getChart', () => {
    it('should return chart data for a coin', async () => {
      const mockChart = {
        prices: [
          [1700000000000, 67000],
          [1700003600000, 67250],
        ],
      };

      cache.getOrFetch.mockImplementation(async (_key, fetchFn) => fetchFn());
      coingecko.fetchChart.mockResolvedValue(mockChart);

      const result = await getChart('bitcoin');

      expect(result).toEqual(mockChart);
    });

    it('should use coin-specific cache key and TTL', async () => {
      cache.getOrFetch.mockResolvedValue({});

      await getChart('bitcoin');

      expect(cache.getOrFetch).toHaveBeenCalledWith(
        'chart:bitcoin',
        expect.any(Function),
        30000
      );
    });

    it('should return null when provider returns null', async () => {
      cache.getOrFetch.mockResolvedValue(null);

      const result = await getChart('bitcoin');

      expect(result).toBeNull();
    });
  });
});
