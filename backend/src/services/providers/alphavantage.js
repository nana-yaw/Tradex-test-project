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

    return {
      price: parseFloat(quote['05. price']),
      change24h: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
    };
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

    return {
      price: parseFloat(rate['5. Exchange Rate']),
      change24h: 0,
    };
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
    const data = await asset.fetch();
    results.push(data);
    if (asset !== assets[assets.length - 1]) await delay(1500);
  }

  return assets
    .map((asset, i) => {
      if (!results[i]) return null;

      return {
        symbol: asset.symbol,
        name: asset.name,
        price: results[i].price,
        change24h: Math.round(results[i].change24h * 100) / 100,
      };
    })
    .filter(Boolean);
}

module.exports = { fetchTraditionalPrices };
