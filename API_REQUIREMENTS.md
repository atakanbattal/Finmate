# FinMate - API Gereksinimleri ve Entegrasyon Rehberi

Bu dokümanda FinMate uygulamasının akıllı varlık seçicileri ve canlı fiyat güncellemeleri için gerekli olan API'ler ve entegrasyon noktaları detaylandırılmıştır.

## 🎯 Genel Bakış

FinMate uygulaması aşağıdaki varlık türleri için canlı fiyat verisi gerektirir:
- **BIST Hisse Senetleri** (Borsa İstanbul)
- **Kripto Paralar** (Bitcoin, Ethereum, vb.)
- **Altın ve Değerli Metaller** (Gram altın, çeyrek altın, gümüş, vb.)
- **Yatırım Fonları** (Türkiye'deki yatırım fonları)
- **Döviz Kurları** (USD/TRY, EUR/TRY, vb.)

## 📊 Gerekli API'ler ve Sağlayıcılar

### 1. BIST Hisse Senetleri

#### Önerilen API Sağlayıcıları:
1. **Borsa İstanbul Resmi API**
   - URL: `https://www.borsaistanbul.com/`
   - Ücretsiz: Sınırlı
   - API Key: Gerekli
   - Rate Limit: Günlük/saatlik limitler var

2. **Investing.com API**
   - URL: `https://api.investing.com/`
   - Ücretli servis
   - API Key: Gerekli
   - Kapsamlı BIST verileri

3. **Foreks API**
   - URL: `https://api.foreks.com/`
   - Türkiye odaklı
   - API Key: Gerekli
   - BIST için optimize edilmiş

#### Gerekli Endpoint'ler:
```
GET /stocks/bist/{symbol}/price
GET /stocks/bist/{symbol}/historical
GET /stocks/bist/list (tüm hisseler)
```

#### Örnek Response:
```json
{
  "symbol": "THYAO",
  "name": "Türk Hava Yolları",
  "price": 245.50,
  "change": 5.25,
  "changePercent": 2.18,
  "volume": 1250000,
  "lastUpdate": "2024-01-15T15:30:00Z"
}
```

### 2. Kripto Paralar

#### Önerilen API Sağlayıcıları:
1. **CoinGecko API** ⭐ (Şu an kullanılıyor)
   - URL: `https://api.coingecko.com/api/v3/`
   - Ücretsiz: Aylık 10,000 istek
   - API Key: Pro plan için gerekli
   - Rate Limit: Dakikada 10-50 istek

2. **CoinMarketCap API**
   - URL: `https://pro-api.coinmarketcap.com/`
   - Ücretsiz: Aylık 10,000 istek
   - API Key: Gerekli
   - Daha kapsamlı veriler

#### Mevcut Entegrasyon:
```javascript
// src/services/marketData.js içinde
async getCryptoPrices(coinIds) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
  );
  return response.json();
}
```

### 3. Altın ve Değerli Metaller

#### Önerilen API Sağlayıcıları:
1. **TCMB EVDS API** ⭐ (Türkiye Cumhuriyet Merkez Bankası)
   - URL: `https://evds2.tcmb.gov.tr/`
   - Ücretsiz
   - API Key: Gerekli (ücretsiz kayıt)
   - Resmi altın fiyatları

2. **Metals-API.com**
   - URL: `https://metals-api.com/`
   - Ücretsiz: Aylık 1,000 istek
   - API Key: Gerekli
   - Uluslararası metal fiyatları

#### Gerekli Endpoint'ler:
```
GET /evds/series=TP.DK.USD.A.YTL (USD/TRY)
GET /evds/series=TP.DK.GRA.A.YTL (Gram Altın)
GET /evds/series=TP.DK.CEY.A.YTL (Çeyrek Altın)
```

#### Örnek TCMB API Kullanımı:
```javascript
const API_KEY = 'YOUR_TCMB_API_KEY';
const response = await fetch(
  `https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.GRA.A.YTL&startDate=15-01-2024&endDate=15-01-2024&type=json&key=${API_KEY}`
);
```

### 4. Yatırım Fonları

#### Önerilen API Sağlayıcıları:
1. **TEFAS API** ⭐ (Türkiye Elektronik Fon Alım Satım Platformu)
   - URL: `https://www.tefas.gov.tr/api/`
   - Ücretsiz
   - API Key: Gerekli değil (public API)
   - Tüm Türkiye fonları

2. **Takasbank API**
   - URL: `https://www.takasbank.com.tr/`
   - Resmi fon verileri
   - API Key: Gerekli
   - Kurumsal erişim

#### TEFAS API Endpoint'leri:
```
GET /DB/BindHistoryInfo?fundCode={code}&startDate={date}&endDate={date}
GET /DB/BindHistoryAllocation?fundCode={code}
GET /DB/BindFundInfo (tüm fonlar)
```

#### Örnek TEFAS API Kullanımı:
```javascript
const response = await fetch(
  `https://www.tefas.gov.tr/api/DB/BindHistoryInfo?fundCode=TEB&startDate=15-01-2024&endDate=15-01-2024`
);
```

### 5. Döviz Kurları

#### Mevcut Entegrasyon:
**TCMB EVDS API** ⭐ (Şu an kullanılıyor)
```javascript
// src/services/marketData.js içinde
async getExchangeRates() {
  const API_KEY = process.env.REACT_APP_TCMB_API_KEY;
  const response = await fetch(
    `https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A.YTL-TP.DK.EUR.A.YTL&type=json&key=${API_KEY}`
  );
  return response.json();
}
```

## 🔧 Entegrasyon Noktaları

### 1. Mevcut Dosyalar

#### `src/services/marketData.js`
Ana market data servisi. Tüm API çağrıları burada yapılır.

**Güncellenecek Metodlar:**
```javascript
class MarketDataService {
  // BIST hisseleri için
  async getBistStockPrice(symbol) { /* Implement */ }
  async getAllBistStocks() { /* Implement */ }
  
  // Altın için (TCMB)
  async getGoldPrices() { /* Update with real API */ }
  
  // Fonlar için (TEFAS)
  async getFundPrice(fundCode) { /* Implement */ }
  async getAllFunds() { /* Implement */ }
}
```

#### `src/components/AssetPicker.jsx`
Yeni oluşturulan genel varlık seçici bileşeni.

**Özellikler:**
- Tüm varlık türleri için tek bileşen
- Canlı fiyat gösterimi
- Akıllı arama ve filtreleme
- Hover'da fiyat güncelleme

#### `src/data/` Klasörü
Varlık verilerinin saklandığı dosyalar:
- `bistStocks.js` - BIST hisse senetleri listesi
- `cryptoCoins.js` - Kripto para listesi
- `goldAssets.js` - Altın ve değerli metal türleri
- `investmentFunds.js` - Yatırım fonları listesi

### 2. Gerekli Environment Variables

`.env` dosyasına eklenecek API anahtarları:

```env
# TCMB (Merkez Bankası) - Altın ve Döviz
REACT_APP_TCMB_API_KEY=your_tcmb_api_key

# BIST Hisseleri (seçilen sağlayıcıya göre)
REACT_APP_BIST_API_KEY=your_bist_api_key
REACT_APP_BIST_API_URL=https://api.example.com

# CoinGecko (Kripto - şu an ücretsiz)
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key

# TEFAS (Fonlar - API key gerekmez)
# Public API kullanılıyor

# Metals API (alternatif altın kaynağı)
REACT_APP_METALS_API_KEY=your_metals_api_key
```

## 🚀 Uygulama Adımları

### Adım 1: API Anahtarlarını Alın

1. **TCMB EVDS**: https://evds2.tcmb.gov.tr/ adresinden ücretsiz kayıt
2. **BIST Sağlayıcısı**: Investing.com, Foreks, vb. seçin ve API key alın
3. **CoinGecko Pro**: https://www.coingecko.com/en/api (opsiyonel, daha yüksek limit için)

### Adım 2: Environment Variables'ı Ayarlayın

`.env` dosyasını oluşturun ve API anahtarlarınızı ekleyin.

### Adım 3: API Entegrasyonlarını Test Edin

```bash
# Development server'ı başlatın
npm run dev

# Browser console'da API çağrılarını kontrol edin
# Network tab'ında API response'larını inceleyin
```

### Adım 4: Rate Limiting ve Caching

API limitlerini aşmamak için:
- Cache mekanizması kullanın (şu an 5 dakika cache var)
- Batch request'ler yapın
- Error handling ekleyin

## 📈 Performans Optimizasyonları

### Mevcut Cache Sistemi
```javascript
// 5 dakika cache süresi
const CACHE_DURATION = 5 * 60 * 1000;

// Singleton pattern ile tek instance
export default new MarketDataService();
```

### Önerilen İyileştirmeler
1. **Lazy Loading**: Sadece görünen varlıklar için fiyat al
2. **WebSocket**: Real-time güncellemeler için
3. **Background Sync**: Periyodik otomatik güncelleme
4. **Error Retry**: API hatalarında otomatik tekrar deneme

## 🔒 Güvenlik Notları

1. **API Keys**: Environment variables'da saklayın, kod içinde hardcode etmeyin
2. **CORS**: API sağlayıcılarının CORS politikalarını kontrol edin
3. **Rate Limiting**: API limitlerini aşmayın
4. **Error Handling**: API hatalarını kullanıcı dostu mesajlarla yönetin

## 📞 Destek ve Dokümantasyon

### API Dokümantasyonları:
- **TCMB EVDS**: https://evds2.tcmb.gov.tr/help/videos/EVDS_Web_Servis_Kullanim_Kilavuzu.pdf
- **CoinGecko**: https://www.coingecko.com/en/api/documentation
- **TEFAS**: https://www.tefas.gov.tr/TefasWebApi/

### Test Endpoint'leri:
```bash
# TCMB Test
curl "https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A.YTL&startDate=15-01-2024&endDate=15-01-2024&type=json&key=YOUR_KEY"

# CoinGecko Test
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

# TEFAS Test
curl "https://www.tefas.gov.tr/api/DB/BindFundInfo"
```

---

**Not**: Bu dokümanda belirtilen API'ler ve entegrasyon noktaları FinMate uygulamasının tam fonksiyonel çalışması için gereklidir. API anahtarlarını aldıktan sonra `src/services/marketData.js` dosyasındaki mock veriler gerçek API çağrıları ile değiştirilmelidir.
