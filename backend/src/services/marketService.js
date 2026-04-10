const { getOrFetch } = require('./cache');
const { fetchPrices, fetchChart } = require('./providers/coingecko');
const { fetchTraditionalPrices } = require('./providers/alphavantage');
const { transformPrices, transformTraditionalPrices } = require('../transforms/marketTransform');

const TTL = 30000;
const TRADITIONAL_TTL = 300000; // 5 min — Alpha Vantage free tier: 25 req/day

async function getPrices() {
  const [raw, traditional] = await Promise.all([
    getOrFetch('prices:crypto', fetchPrices, TTL),
    getOrFetch('prices:traditional', fetchTraditionalPrices, TRADITIONAL_TTL),
  ]);

  const crypto = raw ? transformPrices(raw) : [];
  const traditionalAssets = traditional ? transformTraditionalPrices(traditional) : [];

  return [...crypto, ...traditionalAssets];
}

async function getChart(coinId) {
  return getOrFetch(`chart:${coinId}`, () => fetchChart(coinId), TTL);
}

module.exports = { getPrices, getChart };
