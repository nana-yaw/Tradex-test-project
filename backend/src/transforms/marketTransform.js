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

module.exports = { transformPrices, COIN_MAP };
