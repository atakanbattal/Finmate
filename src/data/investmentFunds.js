// Yatırım Fonları Listesi
// Türkiye'de yaygın yatırım fonları

export const INVESTMENT_FUNDS = [
  // İş Portföy Fonları - Ekran görüntülerinden alınan gerçek fonlar
  { id: 'ijc', symbol: 'IJC', name: 'İJC - İş Portföy Yarı İle...', type: 'balanced', category: 'Karma', risk: 'Orta', price: 1155.35, change: 160.70, changePercent: 16.16 },
  { id: 'ipv', symbol: 'IPV', name: 'İPV - İş Portföy Eurob...', type: 'bond', category: 'Borçlanma', risk: 'Düşük', price: 1104.42, change: 154.57, changePercent: 16.27 },
  { id: 'tau', symbol: 'TAU', name: 'TAU - İş Portföy BIST B...', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 1138.05, change: 138.30, changePercent: 13.83 },
  { id: 'idh', symbol: 'IDH', name: 'İDH - İş Portföy BIST 10...', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 1111.79, change: 116.39, changePercent: 11.69 },
  { id: 'kph', symbol: 'KPH', name: 'KPH - İş Portföy Kar P...', type: 'balanced', category: 'Karma', risk: 'Orta', price: 1068.15, change: 109.86, changePercent: 11.46 },
  { id: 'ibb', symbol: 'IBB', name: 'İBB - İş Portföy Robofon...', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 1089.59, change: 91.72, changePercent: 9.19 },
  { id: 'ti2', symbol: 'TI2', name: 'TI2 - İş Portföy Hisse Se...', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 1072.79, change: 82.74, changePercent: 8.36 },
  { id: 'aft', symbol: 'AFT', name: 'AFT - AK Portföy Yeni...', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 2009.02, change: 463.06, changePercent: 29.95 },
  { id: 'yay', symbol: 'YAY', name: 'YAY - Yapı Kredi Portf...', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 2027.99, change: 388.72, changePercent: 23.71 },
  { id: 'tmg', symbol: 'TMG', name: 'TMG - İş Portföy Yaba...', type: 'international', category: 'Uluslararası', risk: 'Yüksek', price: 1257.40, change: 257.81, changePercent: 25.79 },
  { id: 'tte', symbol: 'TTE', name: 'TTE - İş Portföy BIST T...', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 1257.44, change: 257.58, changePercent: 25.76 },
  { id: 'ti1', symbol: 'TI1', name: 'TI1 - İş Portföy Para Pi...', type: 'money_market', category: 'Para Piyasası', risk: 'Çok Düşük', price: 1100.39, change: 228.13, changePercent: 26.15 },
  { id: 'tiv', symbol: 'TIV', name: 'TIV - İş Portföy Kısa V...', type: 'bond', category: 'Borçlanma', risk: 'Düşük', price: 1073.96, change: 197.65, changePercent: 22.55 },
  
  // Diğer Popüler Fonlar
  { id: 'akb_his', symbol: 'AKB-HIS', name: 'Akbank Hisse Senedi Fonu', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek' },
  { id: 'garan_his', symbol: 'GAR-HIS', name: 'Garanti BBVA Hisse Senedi Fonu', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek' },
  { id: 'is_his', symbol: 'IS-HIS', name: 'İş Bankası Hisse Senedi Fonu', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek' },
  { id: 'yapi_his', symbol: 'YKB-HIS', name: 'Yapı Kredi Hisse Senedi Fonu', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek' },
  
  // Karma Fonlar
  { id: 'akb_karma', symbol: 'AKB-KAR', name: 'Akbank Karma Fon', type: 'balanced', category: 'Karma', risk: 'Orta' },
  { id: 'garan_karma', symbol: 'GAR-KAR', name: 'Garanti BBVA Karma Fon', type: 'balanced', category: 'Karma', risk: 'Orta' },
  { id: 'is_karma', symbol: 'IS-KAR', name: 'İş Bankası Karma Fon', type: 'balanced', category: 'Karma', risk: 'Orta' },
  
  // Borçlanma Araçları Fonları
  { id: 'akb_bor', symbol: 'AKB-BOR', name: 'Akbank Borçlanma Araçları Fonu', type: 'bond', category: 'Borçlanma', risk: 'Düşük' },
  { id: 'garan_bor', symbol: 'GAR-BOR', name: 'Garanti BBVA Borçlanma Araçları Fonu', type: 'bond', category: 'Borçlanma', risk: 'Düşük' },
  { id: 'is_bor', symbol: 'IS-BOR', name: 'İş Bankası Borçlanma Araçları Fonu', type: 'bond', category: 'Borçlanma', risk: 'Düşük' },
  
  // Para Piyasası Fonları
  { id: 'akb_para', symbol: 'AKB-PAR', name: 'Akbank Para Piyasası Fonu', type: 'money_market', category: 'Para Piyasası', risk: 'Çok Düşük' },
  { id: 'garan_para', symbol: 'GAR-PAR', name: 'Garanti BBVA Para Piyasası Fonu', type: 'money_market', category: 'Para Piyasası', risk: 'Çok Düşük' },
  { id: 'is_para', symbol: 'IS-PAR', name: 'İş Bankası Para Piyasası Fonu', type: 'money_market', category: 'Para Piyasası', risk: 'Çok Düşük' },
  
  // Altın Fonları
  { id: 'akb_altin', symbol: 'AKB-ALT', name: 'Akbank Altın Fonu', type: 'gold', category: 'Altın', risk: 'Orta' },
  { id: 'garan_altin', symbol: 'GAR-ALT', name: 'Garanti BBVA Altın Fonu', type: 'gold', category: 'Altın', risk: 'Orta' },
  { id: 'is_altin', symbol: 'IS-ALT', name: 'İş Bankası Altın Fonu', type: 'gold', category: 'Altın', risk: 'Orta' },
  
  // Döviz Fonları
  { id: 'akb_doviz', symbol: 'AKB-DOV', name: 'Akbank Döviz Fonu', type: 'forex', category: 'Döviz', risk: 'Orta' },
  { id: 'garan_doviz', symbol: 'GAR-DOV', name: 'Garanti BBVA Döviz Fonu', type: 'forex', category: 'Döviz', risk: 'Orta' },
  
  // Endeks Fonları
  { id: 'akb_endeks', symbol: 'AKB-END', name: 'Akbank BIST 30 Endeks Fonu', type: 'index', category: 'Endeks', risk: 'Yüksek' },
  { id: 'garan_endeks', symbol: 'GAR-END', name: 'Garanti BBVA BIST 100 Endeks Fonu', type: 'index', category: 'Endeks', risk: 'Yüksek' },
  
  // Sektörel Fonlar
  { id: 'akb_teknoloji', symbol: 'AKB-TEK', name: 'Akbank Teknoloji Fonu', type: 'sector', category: 'Sektörel', risk: 'Yüksek' },
  { id: 'garan_enerji', symbol: 'GAR-ENE', name: 'Garanti BBVA Enerji Fonu', type: 'sector', category: 'Sektörel', risk: 'Yüksek' },
  
  // Uluslararası Fonlar
  { id: 'akb_global', symbol: 'AKB-GLO', name: 'Akbank Global Hisse Senedi Fonu', type: 'international', category: 'Uluslararası', risk: 'Yüksek' },
  { id: 'garan_global', symbol: 'GAR-GLO', name: 'Garanti BBVA Global Fon', type: 'international', category: 'Uluslararası', risk: 'Yüksek' }
];

// Fon arama fonksiyonu
export const searchFunds = (query) => {
  if (!query || query.length < 2) return INVESTMENT_FUNDS.slice(0, 10);
  
  const searchTerm = query.toLowerCase();
  
  return INVESTMENT_FUNDS.filter(fund => 
    fund.symbol.toLowerCase().includes(searchTerm) ||
    fund.name.toLowerCase().includes(searchTerm) ||
    fund.category.toLowerCase().includes(searchTerm) ||
    fund.type.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

// ID ile fon bulma
export const findFundById = (id) => {
  return INVESTMENT_FUNDS.find(fund => fund.id === id || fund.symbol === id);
};

// Kategoriye göre fonlar
export const getFundsByCategory = (category) => {
  return INVESTMENT_FUNDS.filter(fund => fund.category === category);
};

// Risk seviyesine göre fonlar
export const getFundsByRisk = (risk) => {
  return INVESTMENT_FUNDS.filter(fund => fund.risk === risk);
};

// Tüm kategoriler
export const getAllFundCategories = () => {
  const categories = [...new Set(INVESTMENT_FUNDS.map(fund => fund.category))];
  return categories.sort();
};

// Tüm risk seviyeleri
export const getAllRiskLevels = () => {
  const risks = [...new Set(INVESTMENT_FUNDS.map(fund => fund.risk))];
  return ['Çok Düşük', 'Düşük', 'Orta', 'Yüksek'].filter(risk => risks.includes(risk));
};
