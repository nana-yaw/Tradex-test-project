const API_KEY = process.env.ALPHA_VANTAGE_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

async function fetchQuote(symbol) {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) return null;

    return quote;
  } catch {
    return null;
  }
}

async function fetchCurrencyRate(fromCurrency, toCurrency) {
  try {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const rate = data['Realtime Currency Exchange Rate'];
    if (!rate || !rate['5. Exchange Rate']) return null;

    return rate;
  } catch {
    return null;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTraditionalPrices() {
  const assets = [
    { symbol: 'S&P 500', name: 'S&P 500', fetch: () => fetchQuote('SPY') },
    { symbol: 'Gold', name: 'Gold', fetch: () => fetchQuote('GLD') },
    { symbol: 'EUR/USD', name: 'EUR/USD', fetch: () => fetchCurrencyRate('EUR', 'USD') },
  ];

  const results = [];

  for (const asset of assets) {
    const data = await asset.fetch().catch(() => null);
    results.push(data);
    if (asset !== assets[assets.length - 1]) await delay(1500);
  }

  return assets
    .map((asset, i) => {
      if (!results[i]) return null;

      return {
        symbol: asset.symbol,
        name: asset.name,
        raw: results[i],
      };
    })
    .filter(Boolean);
}

module.exports = { fetchTraditionalPrices };
