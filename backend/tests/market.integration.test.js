const request = require('supertest');
const app = require('../src/app');
const coingecko = require('../src/services/providers/coingecko');
const alphavantage = require('../src/services/providers/alphavantage');
const { clear } = require('../src/services/cache');

jest.mock('../src/services/providers/coingecko');
jest.mock('../src/services/providers/alphavantage');

describe('Market API Integration', () => {
  beforeEach(() => {
    clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/market/prices', () => {
    it('should return transformed prices with 200 status', async () => {
      coingecko.fetchPrices.mockResolvedValue({
        bitcoin: { usd: 67432.12, usd_24h_change: 2.345 },
        ethereum: { usd: 3521.45, usd_24h_change: -1.237 },
      });
      alphavantage.fetchTraditionalPrices.mockResolvedValue([
        { symbol: 'S&P 500', name: 'S&P 500', raw: { '01. symbol': 'SPY', '05. price': '520.45', '10. change percent': '0.85%' } },
      ]);

      const res = await request(app).get('/api/market/prices');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { symbol: 'BTC', name: 'Bitcoin', price: 67432.12, change24h: 2.35 },
        { symbol: 'ETH', name: 'Ethereum', price: 3521.45, change24h: -1.24 },
        { symbol: 'S&P 500', name: 'S&P 500', price: 520.45, change24h: 0.85 },
      ]);
    });

    it('should return 503 when provider fails and no cache exists', async () => {
      coingecko.fetchPrices.mockResolvedValue(null);
      alphavantage.fetchTraditionalPrices.mockResolvedValue(null);

      const res = await request(app).get('/api/market/prices');

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/market/chart/:coinId', () => {
    it('should return chart data for a valid coin', async () => {
      const mockChart = {
        prices: [
          [1700000000000, 67000],
          [1700003600000, 67250],
        ],
      };

      coingecko.fetchChart.mockResolvedValue(mockChart);

      const res = await request(app).get('/api/market/chart/bitcoin');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockChart);
    });

    it('should return 503 when chart data is unavailable', async () => {
      coingecko.fetchChart.mockResolvedValue(null);

      const res = await request(app).get('/api/market/chart/bitcoin');

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('error');
    });
  });
});
