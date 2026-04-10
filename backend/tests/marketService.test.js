const { getPrices, getChart } = require('../src/services/marketService');
const cache = require('../src/services/cache');
const coingecko = require('../src/services/providers/coingecko');
const alphavantage = require('../src/services/providers/alphavantage');

jest.mock('../src/services/cache');
jest.mock('../src/services/providers/coingecko');
jest.mock('../src/services/providers/alphavantage');

describe('Market Service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPrices', () => {
    it('should return combined crypto and traditional ticker DTOs', async () => {
      const rawPrices = {
        bitcoin: { usd: 67432.12, usd_24h_change: 2.345 },
        ethereum: { usd: 3521.45, usd_24h_change: -1.237 },
      };

      const traditionalPrices = [
        { symbol: 'S&P 500', name: 'S&P 500', price: 520.45, change24h: 0.85 },
      ];

      cache.getOrFetch.mockImplementation(async (key, fetchFn) => fetchFn());
      coingecko.fetchPrices.mockResolvedValue(rawPrices);
      alphavantage.fetchTraditionalPrices.mockResolvedValue(traditionalPrices);

      const result = await getPrices();

      expect(result).toEqual([
        { symbol: 'BTC', name: 'Bitcoin', price: 67432.12, change24h: 2.35 },
        { symbol: 'ETH', name: 'Ethereum', price: 3521.45, change24h: -1.24 },
        { symbol: 'S&P 500', name: 'S&P 500', price: 520.45, change24h: 0.85 },
      ]);
    });

    it('should use separate cache keys and TTLs for crypto and traditional', async () => {
      cache.getOrFetch.mockResolvedValue(null);

      await getPrices();

      expect(cache.getOrFetch).toHaveBeenCalledWith(
        'prices:crypto',
        expect.any(Function),
        30000
      );
      expect(cache.getOrFetch).toHaveBeenCalledWith(
        'prices:traditional',
        expect.any(Function),
        300000
      );
    });

    it('should return only crypto when traditional fails', async () => {
      const rawPrices = {
        bitcoin: { usd: 67432.12, usd_24h_change: 2.345 },
      };

      cache.getOrFetch
        .mockResolvedValueOnce(rawPrices)
        .mockResolvedValueOnce(null);

      const result = await getPrices();

      expect(result).toEqual([
        { symbol: 'BTC', name: 'Bitcoin', price: 67432.12, change24h: 2.35 },
      ]);
    });

    it('should return only traditional when crypto fails', async () => {
      const traditionalPrices = [
        { symbol: 'Gold', name: 'Gold', price: 2340.50, change24h: 0 },
      ];

      cache.getOrFetch
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(traditionalPrices);

      const result = await getPrices();

      expect(result).toEqual([
        { symbol: 'Gold', name: 'Gold', price: 2340.50, change24h: 0 },
      ]);
    });

    it('should return empty array when both providers fail', async () => {
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
