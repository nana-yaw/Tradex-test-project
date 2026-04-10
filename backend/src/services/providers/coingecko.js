const BASE_URL = 'https://api.coingecko.com/api/v3';

const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple';

async function fetchPrices() {
  try {
    const url = `${BASE_URL}/simple/price?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

async function fetchChart(coinId) {
  try {
    const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

module.exports = { fetchPrices, fetchChart };
