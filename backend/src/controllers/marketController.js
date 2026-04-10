const { getPrices, getChart } = require('../services/marketService');

const getMarketPrices = async (req, res) => {
  try {
    const prices = await getPrices();

    if (!prices.length) {
      return res.status(503).json({ error: 'Market data unavailable' });
    }

    res.json(prices);
  } catch (error) {
    res.status(503).json({ error: 'Market data unavailable' });
  }
};

const getMarketChart = async (req, res) => {
  try {
    const { coinId } = req.params;
    const chart = await getChart(coinId);

    if (!chart) {
      return res.status(503).json({ error: 'Chart data unavailable' });
    }

    res.json(chart);
  } catch (error) {
    res.status(503).json({ error: 'Chart data unavailable' });
  }
};

module.exports = { getMarketPrices, getMarketChart };
