// Yatırım Fonları Listesi
// Türkiye'de yaygın yatırım fonları

export const INVESTMENT_FUNDS = [
  // İş Portföy Fonları - Ekran görüntülerinden alınan gerçek fonlar
  { id: 'gpa', symbol: 'GPA', name: 'GPA - GPY EUROBOND BORÇ.', type: 'bond', category: 'Borçlanma', risk: 'Düşük', price: 5033.48, change: 37.75, changePercent: 0.76 },
  { id: 'tgt', symbol: 'TGT', name: 'TGT - GPY KISA VADELİ BORÇ. ARAÇ. FONU', type: 'bond', category: 'Borçlanma', risk: 'Düşük', price: 5027.40, change: 27.46, changePercent: 0.55 },
  { id: 'aft', symbol: 'AFT', name: 'AFT - AK PORTFÖY YENİ TEKNOLOJİLER YABANC', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 5000.36, change: 0.88, changePercent: 0.02 },
  { id: 'kph', symbol: 'KPH', name: 'KPH - İŞ PORTFÖY KAR PAYI ÖDEYEN HİSSE SE', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 4994.73, change: -4.79, changePercent: -0.10 },
  { id: 'gtl', symbol: 'GTL', name: 'GTL - GPY 1. PARA PİYASASI (TL) FONU', type: 'money_market', category: 'Para Piyasası', risk: 'Çok Düşük', price: 460153.27, change: 57.39, changePercent: 0.01 },
  { id: 'tmg', symbol: 'TMG', name: 'TMG - İŞ PORTFÖY YABANCI HİSSE SENEDİ FON', type: 'international', category: 'Uluslararası', risk: 'Yüksek', price: 5130.87, change: 130.88, changePercent: 2.62 },
  { id: 'tte', symbol: 'TTE', name: 'TTE - İŞ PORTFÖY BİST TEKNOLOJİ AĞIRLIK S', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 5082.82, change: 83.71, changePercent: 1.67 },
  { id: 'yay', symbol: 'YAY', name: 'YAY - YAPI KREDİ PORTFÖY YABANCI TEKNOLOJİ', type: 'international', category: 'Uluslararası', risk: 'Yüksek', price: 5050.64, change: -19.32, changePercent: -0.38 },
  { id: 'ti2', symbol: 'TI2', name: 'TI2 - İŞ PORTFÖY HİSSE SENEDİ (TL) FONU', type: 'equity', category: 'Hisse Senedi', risk: 'Yüksek', price: 4989.19, change: -10.77, changePercent: -0.22 },
  { id: 'tau', symbol: 'TAU', name: 'TAU - İŞ PORTFÖY BİST BANKA ENDEKSİ HİSSE', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 4963.94, change: -35.72, changePercent: -0.71 },
  { id: 'ijc', symbol: 'IJC', name: 'IJC - İŞ PORTFÖY YARI İLETKEN TEKNOLOJİLE', type: 'sector', category: 'Sektörel', risk: 'Yüksek', price: 4950.54, change: -42.51, changePercent: -0.85 },
  { id: 'idh', symbol: 'IDH', name: 'IDH - İŞ PORTFÖY BİST 100 DIŞI ŞİRKETLER', type: 'index', category: 'Endeks', risk: 'Yüksek', price: 4854.33, change: -143.54, changePercent: -2.87 },
  
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
