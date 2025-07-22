// Market Data API Services
// Otomatik yatırım değeri güncellemeleri için API servisleri

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 dakika cache
    this.lastUpdate = new Map();
  }

  // Cache kontrol fonksiyonu
  getCachedData(key) {
    const cached = this.cache.get(key);
    const lastUpdate = this.lastUpdate.get(key);
    
    if (cached && lastUpdate && (Date.now() - lastUpdate < this.cacheTimeout)) {
      return cached;
    }
    
    return null;
  }

  // Cache kaydetme fonksiyonu
  setCachedData(key, data) {
    this.cache.set(key, data);
    this.lastUpdate.set(key, Date.now());
  }

  // TCMB API - Döviz kurları
  async getExchangeRates() {
    const cacheKey = 'exchange_rates';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch('https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A-TP.DK.CHF.A-TP.DK.JPY.A&startDate=01-01-2024&endDate=31-12-2024&type=json&key=EVDS');
      const data = await response.json();
      
      // Son günün verilerini al
      const latest = data.items[data.items.length - 1];
      
      const rates = {
        USD: parseFloat(latest['TP_DK_USD_A']) || 0,
        EUR: parseFloat(latest['TP_DK_EUR_A']) || 0,
        GBP: parseFloat(latest['TP_DK_GBP_A']) || 0,
        CHF: parseFloat(latest['TP_DK_CHF_A']) || 0,
        JPY: parseFloat(latest['TP_DK_JPY_A']) || 0,
        lastUpdate: new Date().toISOString()
      };

      this.setCachedData(cacheKey, rates);
      return rates;
    } catch (error) {
      console.error('Döviz kurları alınamadı:', error);
      
      // Fallback - varsayılan kurlar
      return {
        USD: 34.50,
        EUR: 37.20,
        GBP: 43.80,
        CHF: 38.90,
        JPY: 0.23,
        lastUpdate: new Date().toISOString(),
        error: 'API hatası - varsayılan kurlar kullanılıyor'
      };
    }
  }

  // Finnhub API - Altın fiyatları
  async getGoldPrices() {
    const cacheKey = 'gold_prices';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = process.env.REACT_APP_FINNHUB_API_KEY;
      if (!apiKey) {
        console.warn('Finnhub API key not found, using mock data');
        return this.getMockGoldData();
      }

      const goldPrices = {};
      
      // Finnhub emtia sembolleri (COMEX altın vadeli işlemler)
      const goldSymbols = {
        'gram_gold': 'COMEX:GC', // Gold futures
        'spot_gold': 'OANDA:XAU_USD' // Spot gold
      };
      
      // Her altın türü için fiyat al
      for (const [goldType, symbol] of Object.entries(goldSymbols)) {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status}`);
          }
          
          const quoteData = await response.json();
          
          // Spot altın fiyatını ons'tan gram'a çevir (1 ons = 31.1035 gram)
          const pricePerGram = quoteData.c ? quoteData.c / 31.1035 : 0;
          const changePerGram = quoteData.d ? quoteData.d / 31.1035 : 0;
          
          if (goldType === 'spot_gold') {
            // Spot altından tüm altın türlerini hesapla
            goldPrices['gram_gold'] = {
              price: pricePerGram * 34.5, // TL'ye çevrim (yaklaşık USD/TRY kuru)
              change: changePerGram * 34.5,
              changePercent: quoteData.dp || 0
            };
            
            goldPrices['quarter_gold'] = {
              price: pricePerGram * 34.5 * 1.75, // Çeyrek altın (yaklaşık 1.75 gram)
              change: changePerGram * 34.5 * 1.75,
              changePercent: quoteData.dp || 0
            };
            
            goldPrices['half_gold'] = {
              price: pricePerGram * 34.5 * 3.5, // Yarım altın
              change: changePerGram * 34.5 * 3.5,
              changePercent: quoteData.dp || 0
            };
            
            goldPrices['full_gold'] = {
              price: pricePerGram * 34.5 * 7.0, // Tam altın
              change: changePerGram * 34.5 * 7.0,
              changePercent: quoteData.dp || 0
            };
          }
          
          // Rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`Error fetching ${goldType} price:`, error);
        }
      }
      
      // Eğer hiç veri alınamadıysa mock data kullan
      if (Object.keys(goldPrices).length === 0) {
        return this.getMockGoldData();
      }
      
      goldPrices.lastUpdate = new Date().toISOString();
      goldPrices.source = 'Finnhub API - Real-time gold data';
      
      this.setCachedData(cacheKey, goldPrices);
      return goldPrices;
      
    } catch (error) {
      console.error('Altın fiyatları alınamadı:', error);
      return this.getMockGoldData();
    }
  }

  // Mock gold data fallback
  getMockGoldData() {
    return {
      'gram_gold': { price: 2850.50, change: 15.30, changePercent: 0.54 },
      'quarter_gold': { price: 4680.75, change: 25.20, changePercent: 0.54 },
      'half_gold': { price: 9250.40, change: 48.60, changePercent: 0.53 },
      'full_gold': { price: 18420.80, change: 95.40, changePercent: 0.52 },
      lastUpdate: new Date().toISOString(),
      source: 'Mock Data - Fallback'
    };
  }

  // Finnhub API - Kripto para fiyatları
  async getCryptoPrices(coinIds = ['bitcoin', 'ethereum', 'binancecoin']) {
    const cacheKey = `crypto_${coinIds.join('_')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = import.meta.env.VITE_FINNHUB_API_KEY || 'd1vmvu9r01qqgeemevpgd1vmvu9r01qqgeemevq0';
      if (!apiKey) {
        console.warn('Finnhub API key not found, using mock data');
        return this.getMockCryptoData(coinIds);
      }

      const formattedData = {};
      
      // Finnhub kripto sembolleri mapping
      const symbolMapping = {
        'bitcoin': 'BINANCE:BTCUSDT',
        'ethereum': 'BINANCE:ETHUSDT', 
        'binancecoin': 'BINANCE:BNBUSDT',
        'cardano': 'BINANCE:ADAUSDT',
        'solana': 'BINANCE:SOLUSDT',
        'polkadot': 'BINANCE:DOTUSDT',
        'dogecoin': 'BINANCE:DOGEUSDT',
        'avalanche-2': 'BINANCE:AVAXUSDT',
        'chainlink': 'BINANCE:LINKUSDT',
        'polygon': 'BINANCE:MATICUSDT'
      };
      
      // Her coin için Finnhub API'den fiyat al
      for (const coinId of coinIds) {
        const finnhubSymbol = symbolMapping[coinId];
        if (!finnhubSymbol) {
          console.warn(`Finnhub symbol not found for ${coinId}`);
          continue;
        }
        
        try {
          console.log(`Fetching crypto price for ${coinId} (${finnhubSymbol})...`);
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${apiKey}`
          );
          
          console.log(`API Response status for ${coinId}:`, response.status);
          
          if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status}`);
          }
          
          const quoteData = await response.json();
          console.log(`Raw API data for ${coinId}:`, quoteData);
          
          // Finnhub response: {c: current, d: change, dp: change_percent, h: high, l: low, o: open, pc: previous_close}
          formattedData[coinId] = {
            price: quoteData.c || 0,
            change: quoteData.d || 0,
            changePercent: quoteData.dp || 0,
            high: quoteData.h || 0,
            low: quoteData.l || 0,
            open: quoteData.o || 0,
            previousClose: quoteData.pc || 0
          };
          
          // Rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error fetching ${coinId} price:`, error);
          // Bu coin için mock data kullan
          formattedData[coinId] = this.getMockCryptoData([coinId])[coinId];
        }
      }
      
      formattedData.lastUpdate = new Date().toISOString();
      formattedData.source = 'Finnhub API - Real-time crypto data';
      
      this.setCachedData(cacheKey, formattedData);
      return formattedData;
      
    } catch (error) {
      console.error('Kripto fiyatları alınamadı:', error);
      return this.getMockCryptoData(coinIds);
    }
  }

  // Mock crypto data fallback - UPDATED WITH REAL PRICES
  getMockCryptoData(coinIds) {
    console.warn('USING MOCK CRYPTO DATA - API FAILED!');
    const mockPrices = {
      'bitcoin': { price: 119150.00, change: 826.19, changePercent: 0.70 },
      'ethereum': { price: 3250.75, change: -45.20, changePercent: -1.37 },
      'binancecoin': { price: 715.40, change: 8.90, changePercent: 1.26 },
      'cardano': { price: 0.485, change: 0.012, changePercent: 2.53 },
      'solana': { price: 98.45, change: -2.15, changePercent: -2.14 },
      'polkadot': { price: 7.25, change: 0.18, changePercent: 2.55 },
      'dogecoin': { price: 0.082, change: 0.003, changePercent: 3.80 },
      'avalanche-2': { price: 36.80, change: -1.20, changePercent: -3.16 },
      'chainlink': { price: 14.85, change: 0.45, changePercent: 3.13 },
      'polygon': { price: 0.89, change: 0.02, changePercent: 2.30 }
    };
    
    const result = {};
    for (const coinId of coinIds) {
      result[coinId] = mockPrices[coinId] || {
        price: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 10
      };
    }
    
    result.lastUpdate = new Date().toISOString();
    result.source = 'Mock Data - API Failed (Updated with real prices)';
    
    return result;
  }

  // BIST API - Hisse senedi fiyatları
  async getStockPrices(symbols = ['THYAO', 'AKBNK', 'GARAN', 'ISCTR']) {
    const cacheKey = `stocks_${symbols.join('_')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const prices = {};
      
      // Her sembol için ayrı ayrı fiyat al
      for (const symbol of symbols) {
        try {
          const apiKey = import.meta.env.VITE_FINNHUB_API_KEY || 'd1vmvu9r01qqgeemevpgd1vmvu9r01qqgeemevq0';
          if (!apiKey) {
            console.log(`No API key, using mock data for ${symbol}`);
            prices[symbol] = this.getMockStockPrice(symbol);
            continue;
          }

          console.log(`Fetching BIST price for ${symbol}`);
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}.IS&token=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status}`);
          }
          
          const quoteData = await response.json();
          console.log(`BIST API response for ${symbol}:`, quoteData);
          
          // Eğer error varsa veya access yok ise mock data kullan
          if (quoteData.error || !quoteData.c) {
            console.warn(`BIST access denied for ${symbol}, using mock data`);
            prices[symbol] = this.getMockStockPrice(symbol);
          } else {
            prices[symbol] = {
              price: quoteData.c || 0,
              change: quoteData.d || 0,
              changePercent: quoteData.dp || 0,
              high: quoteData.h || 0,
              low: quoteData.l || 0,
              open: quoteData.o || 0,
              previousClose: quoteData.pc || 0
            };
          }
          
          // Rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`${symbol} fiyatı alınamadı:`, error);
          prices[symbol] = this.getMockStockPrice(symbol);
        }
      }
      
      prices.lastUpdate = new Date().toISOString();
      prices.source = 'Mixed: Finnhub API + Mock Data';
      
      this.setCachedData(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('BIST fiyatları alınamadı:', error);
      
      // Fallback: tüm semboller için mock data
      const fallbackPrices = {};
      for (const symbol of symbols) {
        fallbackPrices[symbol] = this.getMockStockPrice(symbol);
      }
      fallbackPrices.lastUpdate = new Date().toISOString();
      fallbackPrices.source = 'Mock Data - API Error';
      
      return fallbackPrices;
    }
  }

  // Tek hisse senedi fiyatı al
  async getSingleStockPrice(symbol) {
    const cacheKey = `stock_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = process.env.REACT_APP_FINNHUB_API_KEY;
      if (!apiKey) {
        console.warn('Finnhub API key not found, using mock data');
        return this.getMockStockPrice(symbol);
      }

      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}.IS&token=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      
      const quoteData = await response.json();
      
      const stockPrice = {
        price: quoteData.c || 0,
        change: quoteData.d || 0,
        changePercent: quoteData.dp || 0,
        high: quoteData.h || 0,
        low: quoteData.l || 0,
        open: quoteData.o || 0,
        previousClose: quoteData.pc || 0,
        lastUpdate: new Date().toISOString(),
        source: 'Finnhub API - Real-time'
      };
      
      this.setCachedData(cacheKey, stockPrice);
      return stockPrice;
      
    } catch (error) {
      console.error(`${symbol} fiyatı alınamadı:`, error);
      return this.getMockStockPrice(symbol);
    }
  }
  
  // Mock stock price fallback
  getMockStockPrice(symbol) {
    const mockPrices = {
      'THYAO': { price: 385.50, change: 12.30, changePercent: 3.30 },
      'AKBNK': { price: 58.75, change: -1.25, changePercent: -2.08 },
      'GARAN': { price: 102.40, change: 2.80, changePercent: 2.81 },
      'ISCTR': { price: 18.65, change: 0.45, changePercent: 2.47 }
    };
    
    return mockPrices[symbol] || {
      price: Math.random() * 100 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      lastUpdate: new Date().toISOString(),
      source: 'Mock Data - Fallback'
    };
  }

  // Emtia fiyatları (gümüş, platin, vb.)
  async getCommodityPrices() {
    const cacheKey = 'commodity_prices';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Metals API veya benzeri bir servis kullanılabilir
      // Şimdilik mock data
      const prices = {
        silver: 32.50, // TL/gram
        platinum: 1250.00, // TL/gram
        oil: 85.30, // TL/varil
        lastUpdate: new Date().toISOString(),
        note: 'Mock data - gerçek API entegrasyonu yapılacak'
      };

      this.setCachedData(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('Emtia fiyatları alınamadı:', error);
      
      return {
        silver: 32.50,
        platinum: 1250.00,
        oil: 85.30,
        lastUpdate: new Date().toISOString(),
        error: 'API hatası - varsayılan fiyatlar kullanılıyor'
      };
    }
  }

  // Tüm market verilerini al
  async getAllMarketData() {
    try {
      const [exchangeRates, goldPrices, cryptoPrices, stockPrices, commodityPrices] = await Promise.all([
        this.getExchangeRates(),
        this.getGoldPrices(),
        this.getCryptoPrices(),
        this.getStockPrices(),
        this.getCommodityPrices()
      ]);

      return {
        exchangeRates,
        goldPrices,
        cryptoPrices,
        stockPrices,
        commodityPrices,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market verileri alınamadı:', error);
      throw error;
    }
  }

  // Cache temizleme
  clearCache() {
    this.cache.clear();
    this.lastUpdate.clear();
  }
}

// Singleton instance
const marketDataService = new MarketDataService();

export default marketDataService;

// Yardımcı fonksiyonlar
export const updateInvestmentWithMarketData = async (investment, marketData) => {
  try {
    switch (investment.type) {
      case 'forex':
        if (marketData.exchangeRates && investment.data.currency) {
          const rate = marketData.exchangeRates[investment.data.currency];
          if (rate) {
            return {
              ...investment,
              data: {
                ...investment.data,
                currentRate: rate
              },
              lastAutoUpdate: new Date().toISOString()
            };
          }
        }
        break;

      case 'gold':
        if (marketData.goldPrices && marketData.goldPrices.gold) {
          return {
            ...investment,
            data: {
              ...investment.data,
              currentPrice: marketData.goldPrices.gold
            },
            lastAutoUpdate: new Date().toISOString()
          };
        }
        break;

      case 'crypto':
        if (marketData.cryptoPrices && investment.data.coinName) {
          // Coin adını CoinGecko ID'sine çevir
          const coinId = getCoinGeckoId(investment.data.coinName);
          const priceData = marketData.cryptoPrices[coinId];
          if (priceData) {
            return {
              ...investment,
              data: {
                ...investment.data,
                currentPrice: priceData.price
              },
              lastAutoUpdate: new Date().toISOString()
            };
          }
        }
        break;

      case 'stock':
        if (marketData.stockPrices && investment.data.companyName) {
          // Şirket adını hisse senedi sembolüne çevir
          const symbol = getStockSymbol(investment.data.companyName);
          const priceData = marketData.stockPrices[symbol];
          if (priceData) {
            return {
              ...investment,
              data: {
                ...investment.data,
                currentPrice: priceData.price
              },
              lastAutoUpdate: new Date().toISOString()
            };
          }
        }
        break;

      case 'commodity':
        if (marketData.commodityPrices && investment.data.commodityType) {
          const price = marketData.commodityPrices[investment.data.commodityType];
          if (price) {
            return {
              ...investment,
              data: {
                ...investment.data,
                currentPrice: price
              },
              lastAutoUpdate: new Date().toISOString()
            };
          }
        }
        break;

      default:
        return investment;
    }

    return investment;
  } catch (error) {
    console.error('Yatırım güncellenirken hata:', error);
    return investment;
  }
};

// Coin adını CoinGecko ID'sine çevir
const getCoinGeckoId = (coinName) => {
  const coinMap = {
    'bitcoin': 'bitcoin',
    'btc': 'bitcoin',
    'ethereum': 'ethereum',
    'eth': 'ethereum',
    'binance coin': 'binancecoin',
    'bnb': 'binancecoin',
    'cardano': 'cardano',
    'ada': 'cardano',
    'solana': 'solana',
    'sol': 'solana'
  };
  
  return coinMap[coinName.toLowerCase()] || 'bitcoin';
};

// Şirket adını hisse senedi sembolüne çevir
const getStockSymbol = (companyName) => {
  const symbolMap = {
    'türk hava yolları': 'THYAO.IS',
    'akbank': 'AKBNK.IS',
    'garanti bbva': 'GARAN.IS',
    'iş bankası': 'ISCTR.IS',
    'yapı kredi': 'YKBNK.IS',
    'bim': 'BIMAS.IS',
    'migros': 'MGROS.IS',
    'arçelik': 'ARCLK.IS'
  };
  
  return symbolMap[companyName.toLowerCase()] || 'THYAO.IS';
};
