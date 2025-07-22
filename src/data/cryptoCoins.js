// Kripto Para Listesi
// Popüler kripto paralar ve detayları

export const CRYPTO_COINS = [
  // Top 10 Kripto Paralar
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'Layer 1' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'Layer 1' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'Exchange' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'Payment' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'Layer 1' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'Layer 1' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', category: 'Meme' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', category: 'Layer 1' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', category: 'Layer 1' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'Oracle' },

  // DeFi Tokens
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', category: 'DeFi' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', category: 'DeFi' },
  { id: 'compound-governance-token', symbol: 'COMP', name: 'Compound', category: 'DeFi' },
  { id: 'maker', symbol: 'MKR', name: 'Maker', category: 'DeFi' },
  { id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO', category: 'DeFi' },

  // Layer 2 & Scaling
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', category: 'Layer 2' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', category: 'Layer 2' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', category: 'Layer 2' },

  // Stablecoins
  { id: 'tether', symbol: 'USDT', name: 'Tether', category: 'Stablecoin' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', category: 'Stablecoin' },
  { id: 'binance-usd', symbol: 'BUSD', name: 'Binance USD', category: 'Stablecoin' },
  { id: 'dai', symbol: 'DAI', name: 'Dai', category: 'Stablecoin' },

  // Gaming & NFT
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity', category: 'Gaming' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox', category: 'Gaming' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland', category: 'Gaming' },
  { id: 'enjincoin', symbol: 'ENJ', name: 'Enjin Coin', category: 'Gaming' },

  // Meme Coins
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', category: 'Meme' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', category: 'Meme' },
  { id: 'floki', symbol: 'FLOKI', name: 'FLOKI', category: 'Meme' },

  // Turkish Coins
  { id: 'bitci-token', symbol: 'BITCI', name: 'Bitci Token', category: 'Turkish' },
  { id: 'paribu-net', symbol: 'PRB', name: 'Paribu Net', category: 'Turkish' }
];

// Kripto para arama fonksiyonu
export const searchCryptos = (query) => {
  if (!query || query.length < 2) return CRYPTO_COINS.slice(0, 10);
  
  const searchTerm = query.toLowerCase();
  
  return CRYPTO_COINS.filter(coin => 
    coin.symbol.toLowerCase().includes(searchTerm) ||
    coin.name.toLowerCase().includes(searchTerm) ||
    coin.category.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

// Sembol ile kripto para bulma
export const findCryptoById = (id) => {
  return CRYPTO_COINS.find(coin => coin.id === id || coin.symbol === id);
};

// Kategoriye göre kripto paralar
export const getCryptosByCategory = (category) => {
  return CRYPTO_COINS.filter(coin => coin.category === category);
};

// Tüm kategoriler
export const getAllCryptoCategories = () => {
  const categories = [...new Set(CRYPTO_COINS.map(coin => coin.category))];
  return categories.sort();
};
