// Financial Data Service for live market data
class FinancialDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if cached data is still valid
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data or null
  getCachedData(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key).data;
    }
    return null;
  }

  // Set cache data
  setCacheData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch cryptocurrencies from CoinGecko API
  async getCryptocurrencies() {
    const cacheKey = 'cryptocurrencies';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      );
      
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      
      const data = await response.json();
      const processedData = data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        type: 'crypto'
      }));

      this.setCacheData(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
      return this.getDefaultCryptoData();
    }
  }

  // Fetch currency exchange rates
  async getCurrencies() {
    const cacheKey = 'currencies';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
      
      if (!response.ok) throw new Error('Failed to fetch currency data');
      
      const data = await response.json();
      const processedData = Object.entries(data.rates).map(([code, rate]) => ({
        id: code.toLowerCase(),
        symbol: code,
        name: this.getCurrencyName(code),
        current_price: 1 / rate, // Convert to TRY base
        type: 'currency'
      }));

      this.setCacheData(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return this.getDefaultCurrencyData();
    }
  }

  // Fetch BIST stocks (using mock data for now, as BIST API requires authentication)
  async getBISTStocks() {
    const cacheKey = 'bist_stocks';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Mock BIST data - in production, you'd use a real BIST API
    const bistData = [
      { id: 'akbnk', symbol: 'AKBNK', name: 'Akbank T.A.Ş.', current_price: 45.50, price_change_percentage_24h: 2.1, type: 'stock' },
      { id: 'garan', symbol: 'GARAN', name: 'Garanti BBVA', current_price: 85.20, price_change_percentage_24h: -1.5, type: 'stock' },
      { id: 'isctr', symbol: 'ISCTR', name: 'İş Bankası (C)', current_price: 12.80, price_change_percentage_24h: 0.8, type: 'stock' },
      { id: 'thyao', symbol: 'THYAO', name: 'Türk Hava Yolları', current_price: 280.50, price_change_percentage_24h: 3.2, type: 'stock' },
      { id: 'bimas', symbol: 'BIMAS', name: 'BİM Birleşik Mağazalar', current_price: 520.00, price_change_percentage_24h: -0.5, type: 'stock' },
      { id: 'sahol', symbol: 'SAHOL', name: 'Sabancı Holding', current_price: 42.30, price_change_percentage_24h: 1.8, type: 'stock' },
      { id: 'kchol', symbol: 'KCHOL', name: 'Koç Holding', current_price: 155.80, price_change_percentage_24h: 2.5, type: 'stock' },
      { id: 'tuprs', symbol: 'TUPRS', name: 'Tüpraş', current_price: 680.00, price_change_percentage_24h: -2.1, type: 'stock' },
      { id: 'arclk', symbol: 'ARCLK', name: 'Arçelik A.Ş.', current_price: 95.40, price_change_percentage_24h: 1.2, type: 'stock' },
      { id: 'eregl', symbol: 'EREGL', name: 'Ereğli Demir Çelik', current_price: 38.60, price_change_percentage_24h: 0.9, type: 'stock' }
    ];

    this.setCacheData(cacheKey, bistData);
    return bistData;
  }

  // Get all financial instruments
  async getAllFinancialData() {
    try {
      const [cryptos, currencies, stocks] = await Promise.all([
        this.getCryptocurrencies(),
        this.getCurrencies(),
        this.getBISTStocks()
      ]);

      return {
        crypto: cryptos,
        currency: currencies,
        stock: stocks,
        all: [...cryptos, ...currencies, ...stocks]
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return {
        crypto: this.getDefaultCryptoData(),
        currency: this.getDefaultCurrencyData(),
        stock: [],
        all: [...this.getDefaultCryptoData(), ...this.getDefaultCurrencyData()]
      };
    }
  }

  // Default crypto data fallback
  getDefaultCryptoData() {
    return [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 2650000, type: 'crypto' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 180000, type: 'crypto' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 15000, type: 'crypto' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 25, type: 'crypto' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 6500, type: 'crypto' }
    ];
  }

  // Default currency data fallback
  getDefaultCurrencyData() {
    return [
      { id: 'usd', symbol: 'USD', name: 'US Dollar', current_price: 34.15, type: 'currency' },
      { id: 'eur', symbol: 'EUR', name: 'Euro', current_price: 37.20, type: 'currency' },
      { id: 'gbp', symbol: 'GBP', name: 'British Pound', current_price: 43.50, type: 'currency' },
      { id: 'jpy', symbol: 'JPY', name: 'Japanese Yen', current_price: 0.23, type: 'currency' },
      { id: 'chf', symbol: 'CHF', name: 'Swiss Franc', current_price: 38.90, type: 'currency' }
    ];
  }

  // Get currency name from code
  getCurrencyName(code) {
    const currencyNames = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'CHF': 'Swiss Franc',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'CNY': 'Chinese Yuan',
      'RUB': 'Russian Ruble',
      'SAR': 'Saudi Riyal'
    };
    return currencyNames[code] || code;
  }

  // Search financial instruments
  searchInstruments(query, data) {
    if (!query) return data;
    
    const searchTerm = query.toLowerCase();
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.symbol.toLowerCase().includes(searchTerm)
    );
  }
}

export default new FinancialDataService();
