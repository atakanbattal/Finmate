// BIST Hisse Senetleri Listesi
// Borsa İstanbul'da işlem gören başlıca hisse senetleri

export const BIST_STOCKS = [
  // BIST 30 Hisseleri
  { symbol: 'THYAO', name: 'Türk Hava Yolları', sector: 'Ulaştırma', market: 'Ana Pazar' },
  { symbol: 'AKBNK', name: 'Akbank', sector: 'Bankacılık', market: 'Ana Pazar' },
  { symbol: 'GARAN', name: 'Garanti BBVA', sector: 'Bankacılık', market: 'Ana Pazar' },
  { symbol: 'ISCTR', name: 'İş Bankası (C)', sector: 'Bankacılık', market: 'Ana Pazar' },
  { symbol: 'YKBNK', name: 'Yapı Kredi', sector: 'Bankacılık', market: 'Ana Pazar' },
  { symbol: 'HALKB', name: 'Halkbank', sector: 'Bankacılık', market: 'Ana Pazar' },
  { symbol: 'VAKBN', name: 'VakıfBank', sector: 'Bankacılık', market: 'Ana Pazar' },
  
  // Teknoloji
  { symbol: 'ASELS', name: 'Aselsan', sector: 'Teknoloji', market: 'Ana Pazar' },
  { symbol: 'KCHOL', name: 'Koç Holding', sector: 'Holding', market: 'Ana Pazar' },
  { symbol: 'SAHOL', name: 'Sabancı Holding', sector: 'Holding', market: 'Ana Pazar' },
  
  // Perakende
  { symbol: 'BIMAS', name: 'BİM', sector: 'Perakende', market: 'Ana Pazar' },
  { symbol: 'MGROS', name: 'Migros', sector: 'Perakende', market: 'Ana Pazar' },
  { symbol: 'SOKM', name: 'Şok Marketler', sector: 'Perakende', market: 'Ana Pazar' },
  
  // Beyaz Eşya & Teknoloji
  { symbol: 'ARCLK', name: 'Arçelik', sector: 'Beyaz Eşya', market: 'Ana Pazar' },
  { symbol: 'VESTL', name: 'Vestel', sector: 'Elektronik', market: 'Ana Pazar' },
  
  // Otomotiv
  { symbol: 'TOASO', name: 'Tofaş', sector: 'Otomotiv', market: 'Ana Pazar' },
  { symbol: 'FROTO', name: 'Ford Otosan', sector: 'Otomotiv', market: 'Ana Pazar' },
  
  // Enerji
  { symbol: 'TUPRS', name: 'Tüpraş', sector: 'Enerji', market: 'Ana Pazar' },
  { symbol: 'PETKM', name: 'Petkim', sector: 'Petrokimya', market: 'Ana Pazar' },
  { symbol: 'AKSEN', name: 'Aksa Enerji', sector: 'Enerji', market: 'Ana Pazar' },
  
  // Çimento
  { symbol: 'AKCEM', name: 'Akçansa', sector: 'Çimento', market: 'Ana Pazar' },
  { symbol: 'BUCIM', name: 'Bursa Çimento', sector: 'Çimento', market: 'Ana Pazar' },
  
  // Telekomünikasyon
  { symbol: 'TTKOM', name: 'Türk Telekom', sector: 'Telekomünikasyon', market: 'Ana Pazar' },
  { symbol: 'TCELL', name: 'Turkcell', sector: 'Telekomünikasyon', market: 'Ana Pazar' },
  
  // Havayolları
  { symbol: 'PGSUS', name: 'Pegasus', sector: 'Havayolları', market: 'Ana Pazar' },
  
  // Gıda
  { symbol: 'ULKER', name: 'Ülker Bisküvi', sector: 'Gıda', market: 'Ana Pazar' },
  { symbol: 'TATGD', name: 'Tat Gıda', sector: 'Gıda', market: 'Ana Pazar' },
  
  // Sigorta
  { symbol: 'AKGRT', name: 'Aksigorta', sector: 'Sigorta', market: 'Ana Pazar' },
  { symbol: 'ANSGR', name: 'Anadolu Sigorta', sector: 'Sigorta', market: 'Ana Pazar' },
  
  // İnşaat
  { symbol: 'ENKAI', name: 'Enka İnşaat', sector: 'İnşaat', market: 'Ana Pazar' },
  { symbol: 'TEKTU', name: 'Tekfen Holding', sector: 'İnşaat', market: 'Ana Pazar' },
  
  // Tekstil
  { symbol: 'KORDS', name: 'Kordsa', sector: 'Tekstil', market: 'Ana Pazar' },
  { symbol: 'BRSAN', name: 'Borusan Mannesmann', sector: 'Metal', market: 'Ana Pazar' },
  
  // Cam
  { symbol: 'SISE', name: 'Şişe Cam', sector: 'Cam', market: 'Ana Pazar' },
  { symbol: 'TRKCM', name: 'Trakya Cam', sector: 'Cam', market: 'Ana Pazar' },
  
  // Madencilik
  { symbol: 'KOZAL', name: 'Koza Altın', sector: 'Madencilik', market: 'Ana Pazar' },
  { symbol: 'KOZAA', name: 'Koza Anadolu', sector: 'Madencilik', market: 'Ana Pazar' },
  
  // Turizm
  { symbol: 'MAALT', name: 'Marmaris Altınyunus', sector: 'Turizm', market: 'Ana Pazar' },
  { symbol: 'AYCES', name: 'Altın Yunus Çeşme', sector: 'Turizm', market: 'Ana Pazar' },
  
  // Diğer Önemli Hisseler
  { symbol: 'DOHOL', name: 'Doğan Holding', sector: 'Holding', market: 'Ana Pazar' },
  { symbol: 'EREGL', name: 'Ereğli Demir Çelik', sector: 'Metal', market: 'Ana Pazar' },
  { symbol: 'OTKAR', name: 'Otokar', sector: 'Otomotiv', market: 'Ana Pazar' },
  { symbol: 'LOGO', name: 'Logo Yazılım', sector: 'Teknoloji', market: 'Ana Pazar' },
  { symbol: 'NETAS', name: 'Netaş', sector: 'Teknoloji', market: 'Ana Pazar' },
  { symbol: 'ALARK', name: 'Alarko Holding', sector: 'Holding', market: 'Ana Pazar' },
  { symbol: 'GUBRF', name: 'Gübre Fabrikaları', sector: 'Kimya', market: 'Ana Pazar' },
  { symbol: 'SODA', name: 'Soda Sanayii', sector: 'Kimya', market: 'Ana Pazar' },
  { symbol: 'CCOLA', name: 'Coca Cola İçecek', sector: 'İçecek', market: 'Ana Pazar' },
  { symbol: 'AEFES', name: 'Anadolu Efes', sector: 'İçecek', market: 'Ana Pazar' },
  
  // Yatırım Ortaklıkları
  { symbol: 'GOZDE', name: 'Gözde Girişim', sector: 'Yatırım Ortaklığı', market: 'Ana Pazar' },
  { symbol: 'ISMEN', name: 'İş Yatırım Menkul', sector: 'Yatırım Ortaklığı', market: 'Ana Pazar' },
  
  // Lojistik
  { symbol: 'CLEBI', name: 'Çelebi Hava Servisi', sector: 'Lojistik', market: 'Ana Pazar' },
  { symbol: 'DOCO', name: 'Do & Co', sector: 'Lojistik', market: 'Ana Pazar' }
];

// Hisse senedi arama fonksiyonu
export const searchStocks = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return BIST_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) ||
    stock.name.toLowerCase().includes(searchTerm) ||
    stock.sector.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // En fazla 10 sonuç
};

// Sembol ile hisse senedi bulma
export const findStockBySymbol = (symbol) => {
  return BIST_STOCKS.find(stock => stock.symbol === symbol);
};

// Sektöre göre hisse senetleri
export const getStocksBySector = (sector) => {
  return BIST_STOCKS.filter(stock => stock.sector === sector);
};

// Tüm sektörler
export const getAllSectors = () => {
  const sectors = [...new Set(BIST_STOCKS.map(stock => stock.sector))];
  return sectors.sort();
};
