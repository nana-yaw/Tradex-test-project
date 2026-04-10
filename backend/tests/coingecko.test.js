const { fetchPrices, fetchChart } = require('../src/services/providers/coingecko');

describe('CoinGecko Provider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchPrices', () => {
    it('should return raw price data on success', async () => {
      const mockResponse = {
        bitcoin: { usd: 67432.12, usd_24h_change: 2.34 },
        ethereum: { usd: 3521.45, usd_24h_change: -1.23 },
      };

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchPrices();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.coingecko.com')
      );
    });

    it('should return null when API returns an error status', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
      });

      const result = await fetchPrices();

      expect(result).toBeNull();
    });

    it('should return null when fetch throws a network error', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await fetchPrices();

      expect(result).toBeNull();
    });
  });

  describe('fetchChart', () => {
    it('should return 24h price history for a coin', async () => {
      const mockChart = {
        prices: [
          [1700000000000, 67000],
          [1700003600000, 67250],
          [1700007200000, 67400],
        ],
      };

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockChart,
      });

      const result = await fetchChart('bitcoin');

      expect(result).toEqual(mockChart);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('bitcoin')
      );
    });

    it('should return null when chart request fails', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchChart('bitcoin');

      expect(result).toBeNull();
    });
  });
});
