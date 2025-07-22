// Altın ve Değerli Metal Varlıkları
// Türkiye'de yaygın altın türleri ve değerli metaller

export const GOLD_ASSETS = [
  // Altın Türleri
  { id: 'gold_gram', symbol: 'AU', name: 'Gram Altın', type: 'gold', unit: 'gram', category: 'Altın' },
  { id: 'gold_quarter', symbol: 'AU/4', name: 'Çeyrek Altın', type: 'gold', unit: 'adet', category: 'Altın' },
  { id: 'gold_half', symbol: 'AU/2', name: 'Yarım Altın', type: 'gold', unit: 'adet', category: 'Altın' },
  { id: 'gold_full', symbol: 'AU/1', name: 'Tam Altın', type: 'gold', unit: 'adet', category: 'Altın' },
  { id: 'gold_republic', symbol: 'AUREP', name: 'Cumhuriyet Altını', type: 'gold', unit: 'adet', category: 'Altın' },
  { id: 'gold_ata', symbol: 'AUATA', name: 'Ata Altın', type: 'gold', unit: 'adet', category: 'Altın' },
  { id: 'gold_22k', symbol: 'AU22K', name: '22 Ayar Altın', type: 'gold', unit: 'gram', category: 'Altın' },
  { id: 'gold_18k', symbol: 'AU18K', name: '18 Ayar Altın', type: 'gold', unit: 'gram', category: 'Altın' },
  { id: 'gold_14k', symbol: 'AU14K', name: '14 Ayar Altın', type: 'gold', unit: 'gram', category: 'Altın' },

  // Gümüş
  { id: 'silver_gram', symbol: 'AG', name: 'Gram Gümüş', type: 'silver', unit: 'gram', category: 'Gümüş' },
  { id: 'silver_ounce', symbol: 'AG/OZ', name: 'Ons Gümüş', type: 'silver', unit: 'ons', category: 'Gümüş' },

  // Platin
  { id: 'platinum_gram', symbol: 'PT', name: 'Gram Platin', type: 'platinum', unit: 'gram', category: 'Platin' },
  { id: 'platinum_ounce', symbol: 'PT/OZ', name: 'Ons Platin', type: 'platinum', unit: 'ons', category: 'Platin' },

  // Paladyum
  { id: 'palladium_gram', symbol: 'PD', name: 'Gram Paladyum', type: 'palladium', unit: 'gram', category: 'Paladyum' },
  { id: 'palladium_ounce', symbol: 'PD/OZ', name: 'Ons Paladyum', type: 'palladium', unit: 'ons', category: 'Paladyum' }
];

// Altın varlığı arama fonksiyonu
export const searchGoldAssets = (query) => {
  if (!query || query.length < 2) return GOLD_ASSETS.slice(0, 10);
  
  const searchTerm = query.toLowerCase();
  
  return GOLD_ASSETS.filter(asset => 
    asset.symbol.toLowerCase().includes(searchTerm) ||
    asset.name.toLowerCase().includes(searchTerm) ||
    asset.category.toLowerCase().includes(searchTerm) ||
    asset.type.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

// ID ile altın varlığı bulma
export const findGoldAssetById = (id) => {
  return GOLD_ASSETS.find(asset => asset.id === id || asset.symbol === id);
};

// Kategoriye göre altın varlıkları
export const getGoldAssetsByCategory = (category) => {
  return GOLD_ASSETS.filter(asset => asset.category === category);
};

// Türe göre altın varlıkları
export const getGoldAssetsByType = (type) => {
  return GOLD_ASSETS.filter(asset => asset.type === type);
};

// Tüm kategoriler
export const getAllGoldCategories = () => {
  const categories = [...new Set(GOLD_ASSETS.map(asset => asset.category))];
  return categories.sort();
};
