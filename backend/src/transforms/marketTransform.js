const COIN_MAP = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
  ethereum: { symbol: 'ETH', name: 'Ethereum' },
  solana: { symbol: 'SOL', name: 'Solana' },
  binancecoin: { symbol: 'BNB', name: 'BNB' },
  ripple: { symbol: 'XRP', name: 'XRP' },
};

function transformPrices(rawResponse) {
  return Object.entries(COIN_MAP)
    .filter(([coinId]) => rawResponse[coinId])
    .map(([coinId, meta]) => ({
      symbol: meta.symbol,
      name: meta.name,
      price: rawResponse[coinId].usd,
      change24h: rawResponse[coinId].usd_24h_change
        ? Math.round(rawResponse[coinId].usd_24h_change * 100) / 100
        : 0,
    }));
}

function transformTraditionalPrices(rawAssets) {
  return rawAssets.map((asset) => {
    if (!asset?.raw) return { symbol: asset.symbol, name: asset.name, price: 0, change24h: 0 };
    const isQuote = !!asset.raw['05. price'];

    return {
      symbol: asset.symbol,
      name: asset.name,
      price: isQuote
        ? parseFloat(asset.raw['05. price'])
        : parseFloat(asset.raw['5. Exchange Rate']),
      change24h: isQuote
        ? Math.round((parseFloat(asset.raw['10. change percent']) || 0) * 100) / 100
        : 0,
    };
  });
}

module.exports = { transformPrices, transformTraditionalPrices, COIN_MAP };
