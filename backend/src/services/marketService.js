const { getOrFetch } = require('./cache');
const { fetchPrices, fetchChart } = require('./providers/coingecko');
const { transformPrices } = require('../transforms/marketTransform');

const TTL = 30000;

async function getPrices() {
  const raw = await getOrFetch('prices', fetchPrices, TTL);

  if (!raw) return [];

  return transformPrices(raw);
}

async function getChart(coinId) {
  return getOrFetch(`chart:${coinId}`, () => fetchChart(coinId), TTL);
}

module.exports = { getPrices, getChart };
