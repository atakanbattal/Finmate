import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, ChevronDown, X, DollarSign, Coins } from 'lucide-react';
import { searchStocks, findStockBySymbol, BIST_STOCKS } from '../data/bistStocks';
import { searchCryptos, findCryptoById, CRYPTO_COINS } from '../data/cryptoCoins';
import { searchGoldAssets, findGoldAssetById, GOLD_ASSETS } from '../data/goldAssets';
import { searchFunds, findFundById, INVESTMENT_FUNDS } from '../data/investmentFunds';
import marketDataService from '../services/marketData';

const AssetPicker = ({ 
  assetType, 
  value, 
  onChange, 
  placeholder = "Varlık seçin..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPrice, setAssetPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Varlık türüne göre arama fonksiyonları
  const getSearchFunction = () => {
    switch (assetType) {
      case 'stock': return searchStocks;
      case 'crypto': return searchCryptos;
      case 'gold': return searchGoldAssets;
      case 'fund': return searchFunds;
      default: return () => [];
    }
  };

  // Varlık türüne göre bulma fonksiyonları
  const getFindFunction = () => {
    switch (assetType) {
      case 'stock': return findStockBySymbol;
      case 'crypto': return findCryptoById;
      case 'gold': return findGoldAssetById;
      case 'fund': return findFundById;
      default: return () => null;
    }
  };

  // Varlık türüne göre tüm varlıklar
  const getAllAssets = () => {
    switch (assetType) {
      case 'stock': return BIST_STOCKS;
      case 'crypto': return CRYPTO_COINS;
      case 'gold': return GOLD_ASSETS;
      case 'fund': return INVESTMENT_FUNDS;
      default: return [];
    }
  };

  // Seçili varlığı başlat
  useEffect(() => {
    const findFunc = getFindFunction();
    if (value && typeof value === 'string') {
      const asset = findFunc(value);
      if (asset) {
        setSelectedAsset(asset);
        fetchAssetPrice(asset);
      }
    } else if (value && (value.symbol || value.id)) {
      setSelectedAsset(value);
      fetchAssetPrice(value);
    }
  }, [value, assetType]);

  // Arama sonuçlarını güncelle
  useEffect(() => {
    const searchFunc = getSearchFunction();
    if (searchQuery.length >= 2) {
      const results = searchFunc(searchQuery);
      setSearchResults(results);
    } else if (searchQuery.length === 0) {
      // Popüler varlıkları göster
      const allAssets = getAllAssets();
      setSearchResults(allAssets.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, assetType]);

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Varlık fiyatını al
  const fetchAssetPrice = async (asset) => {
    console.log('Fetching live price for:', assetType, value);
      
    try {
      let price = null;
      
      switch (assetType) {
        case 'stock':
          price = await marketDataService.getSingleStockPrice(asset.symbol);
          console.log('Stock price data:', price);
          break;
        case 'crypto':
          const cryptoPrices = await marketDataService.getCryptoPrices([asset.id]);
          price = cryptoPrices[asset.id];
          console.log('Crypto price data for', asset.id, ':', price);
          break;
        case 'gold':
          const goldPrices = await marketDataService.getGoldPrices();
          price = goldPrices[asset.type];
          console.log('Gold price data:', price);
          break;
        case 'fund':
          // Fonlar için henüz API yok, mock data
          price = {
            price: Math.random() * 10 + 5,
            change: (Math.random() - 0.5) * 0.5,
            changePercent: (Math.random() - 0.5) * 2
          };
          break;
      }
      
      if (price && price.price) {
        console.log('Setting live price:', price.price);
        setAssetPrice(price);
      } else {
        console.log('No price data found:', price);
      }
    } catch (error) {
      console.error('Live price fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Varlık seç
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setIsOpen(false);
    setSearchQuery('');
    
    // Parent component'e bildir
    onChange({
      id: asset.id || asset.symbol,
      symbol: asset.symbol,
      name: asset.name,
      type: assetType,
      category: asset.category,
      ...asset
    });

    // Fiyatı al
    fetchAssetPrice(asset);
  };

  // Seçimi temizle
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedAsset(null);
    setAssetPrice(null);
    onChange(null);
  };

  // Dropdown aç/kapat
  const toggleDropdown = () => {
    console.log('🔄 Dropdown toggle - isOpen:', isOpen, 'assetType:', assetType);
    
    try {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
        // Dropdown açıldığında ANINDA canlı fiyatları çek (sadece crypto için)
        if (assetType === 'crypto') {
          fetchAllLivePrices();
        }
      }
    } catch (error) {
      console.error('❌ Dropdown toggle hatası:', error);
      // Hata durumunda da dropdown'u aç
      setIsOpen(!isOpen);
    }
  };

  // Tüm görünen varlıklar için canlı fiyat çek
  const fetchAllLivePrices = async () => {
    if (assetType !== 'crypto') return; // Şimdilik sadece crypto
    
    try {
      console.log('🚀 DROPDOWN AÇILDI - CANLI FİYATLAR ÇEKİLİYOR...');
      
      // Varlıkları doğru şekilde al
      const allAssets = getAllAssets();
      const visibleAssets = allAssets.slice(0, 10); // İlk 10 coin
      const coinIds = visibleAssets.map(asset => asset.id).filter(Boolean);
      
      if (coinIds.length === 0) {
        console.log('⚠️ Hiç coin ID bulunamadı');
        return;
      }
      
      console.log('💰 Fiyat alınacak coinler:', coinIds);
      
      // Import'u try-catch içine al
      const { default: marketDataService } = await import('../services/marketData');
      const livePrices = await marketDataService.getCryptoPrices(coinIds);
      
      console.log('✅ CANLI FİYATLAR GELDİ:', livePrices);
      
      // Prices state'ini güncelle
      setPrices(prevPrices => ({
        ...prevPrices,
        ...livePrices
      }));
      
    } catch (error) {
      console.error('❌ Canlı fiyat çekme hatası:', error);
      // Hata durumunda da devam et, çökme
      setPrices(prevPrices => prevPrices);
    }
  };

  // Fiyat rengi
  const getPriceColor = (change) => {
    if (!change) return 'text-gray-600';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Fiyat ikonu
  const getPriceIcon = (change) => {
    if (!change) return null;
    return change >= 0 ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  // Varlık türü ikonu
  const getAssetTypeIcon = () => {
    switch (assetType) {
      case 'stock': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'crypto': return <Coins className="h-4 w-4 text-orange-600" />;
      case 'gold': return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'fund': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  // Varlık türü adı
  const getAssetTypeName = () => {
    switch (assetType) {
      case 'stock': return 'hisse senedi';
      case 'crypto': return 'kripto para';
      case 'gold': return 'değerli metal';
      case 'fund': return 'yatırım fonu';
      default: return 'varlık';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ana Seçici */}
      <div
        onClick={toggleDropdown}
        className={`
          relative w-full p-3 border border-gray-300 rounded-lg cursor-pointer
          transition-colors duration-200 bg-white
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-400'}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedAsset ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getAssetTypeIcon()}
                  <span className="font-semibold text-gray-900">
                    {selectedAsset.symbol || selectedAsset.id}
                  </span>
                  <span className="text-sm text-gray-600 truncate">
                    {selectedAsset.name}
                  </span>
                  {selectedAsset && (
                    <button
                      onClick={handleClear}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                
                {/* Fiyat Bilgisi */}
                {assetPrice && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">
                        {assetType === 'fund' ? '₺' : 
                         assetType === 'crypto' ? '$' : 
                         assetType === 'gold' ? '₺' : '₺'}
                        {assetPrice.price?.toFixed(2)}
                      </span>
                      {getPriceIcon(assetPrice.change)}
                    </div>
                    <div className={`flex items-center space-x-1 ${getPriceColor(assetPrice.change)}`}>
                      <span>{assetPrice.change >= 0 ? '+' : ''}{assetPrice.change?.toFixed(2)}</span>
                      <span>({assetPrice.changePercent >= 0 ? '+' : ''}{assetPrice.changePercent?.toFixed(2)}%)</span>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="text-sm text-blue-600">Fiyat güncelleniyor...</div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {getAssetTypeIcon()}
                <span className="text-gray-500">
                  {placeholder || `${getAssetTypeName()} seçin...`}
                </span>
              </div>
            )}
          </div>
          
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Arama Kutusu */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${getAssetTypeName()} ara (sembol veya isim)...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sonuçlar */}
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((asset) => (
                  <AssetOption
                    key={asset.id || asset.symbol}
                    asset={asset}
                    assetType={assetType}
                    onSelect={handleSelectAsset}
                    isSelected={selectedAsset?.symbol === asset.symbol || selectedAsset?.id === asset.id}
                    livePrices={prices}
                  />
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>"{searchQuery}" için sonuç bulunamadı</p>
                <p className="text-sm mt-1">Farklı bir arama terimi deneyin</p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Popüler {getAssetTypeName()}ler</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AssetOption = ({ asset, assetType, onSelect, isSelected, livePrices }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Canlı fiyatları öncelikli olarak kullan
  useEffect(() => {
    // Önce livePrices'dan kontrol et
    if (livePrices && asset.id && livePrices[asset.id]) {
      console.log('🎯 CANLI FİYAT KULLANILIYOR:', asset.id, livePrices[asset.id]);
      setPrice(livePrices[asset.id]);
      return;
    }
    
    // Fallback: Kendi API çağrısı yap - SADECE GEREKLİ DURUMLARDA
    const fetchPrice = async () => {
      if (loading) return;
      
      // Hisse senedi ve kripto için fazla API çağrısı yapma
      if ((assetType === 'stock' || assetType === 'crypto') && !livePrices) {
        console.log('⚠️ API çağrısı atlanıyor - livePrices bekleniyor');
        return;
      }
      
      setLoading(true);
      try {
        let assetPrice = null;
        
        switch (assetType) {
          case 'stock':
            try {
              const { default: marketDataService } = await import('../services/marketData');
              assetPrice = await marketDataService.getSingleStockPrice(asset.symbol);
              console.log('📈 Stock price for', asset.symbol, ':', assetPrice);
            } catch (importError) {
              console.error('❌ Stock price import hatası:', importError);
            }
            break;
          case 'crypto':
            try {
              const { default: marketDataService } = await import('../services/marketData');
              const cryptoPrices = await marketDataService.getCryptoPrices([asset.id]);
              assetPrice = cryptoPrices[asset.id];
              console.log('💰 Crypto price for', asset.id, ':', assetPrice);
            } catch (importError) {
              console.error('❌ Crypto price import hatası:', importError);
            }
            break;
          case 'gold':
            try {
              const { default: marketDataService } = await import('../services/marketData');
              const goldPrices = await marketDataService.getGoldPrices();
              assetPrice = goldPrices[asset.type];
              console.log('🥇 Gold price for', asset.type, ':', assetPrice);
            } catch (importError) {
              console.error('❌ Gold price import hatası:', importError);
            }
            break;
          case 'fund':
            // Mock data for funds - no import needed
            assetPrice = {
              price: Math.random() * 10 + 5,
              change: (Math.random() - 0.5) * 0.5,
              changePercent: (Math.random() - 0.5) * 2
            };
            break;
        }
        
        if (assetPrice) {
          setPrice(assetPrice);
        }
      } catch (error) {
        console.error('❌ Fiyat alınamadı:', error);
        // Hata durumunda da component çökmesin
      } finally {
        setLoading(false);
      }
    };

    // Async function'u çağır ama hata durumunda çökme
    fetchPrice().catch(error => {
      console.error('❌ fetchPrice async hatası:', error);
      setLoading(false);
    });
  }, [asset.id, asset.symbol, assetType, livePrices]);

  // Hover'da fiyat al (backup)
  const handleMouseEnter = async () => {
    if (!price && !loading) {
      setLoading(true);
      try {
        let assetPrice = null;
        
        switch (assetType) {
          case 'stock':
            assetPrice = await marketDataService.getSingleStockPrice(asset.symbol);
            break;
          case 'crypto':
            const cryptoPrices = await marketDataService.getCryptoPrices([asset.id]);
            assetPrice = cryptoPrices[asset.id];
            break;
          case 'gold':
            const goldPrices = await marketDataService.getGoldPrices();
            assetPrice = goldPrices[asset.type];
            break;
          case 'fund':
            // Mock data for funds
            assetPrice = {
              price: Math.random() * 10 + 5,
              change: (Math.random() - 0.5) * 0.5,
              changePercent: (Math.random() - 0.5) * 2
            };
            break;
        }
        
        setPrice(assetPrice);
      } catch (error) {
        console.error('Fiyat alınamadı:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriceColor = (change) => {
    if (!change) return 'text-gray-600';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPriceIcon = (change) => {
    if (!change) return null;
    return change >= 0 ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  return (
    <div
      onClick={() => onSelect(asset)}
      onMouseEnter={handleMouseEnter}
      className={`
        px-4 py-3 cursor-pointer transition-colors border-l-4
        ${isSelected 
          ? 'bg-blue-50 border-l-blue-500' 
          : 'hover:bg-gray-50 border-l-transparent'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-900">
              {asset.symbol || asset.id}
            </span>
            <span className="text-sm text-gray-600 truncate">{asset.name}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {asset.category || asset.type}
            </span>
            {asset.risk && (
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                {asset.risk}
              </span>
            )}
          </div>
        </div>

        {/* Fiyat Bilgisi */}
        <div className="text-right ml-4">
          {loading ? (
            <div className="text-xs text-blue-600">Yükleniyor...</div>
          ) : price && price.price ? (
            <div className="space-y-1">
              <div className="font-medium text-gray-900">
                {assetType === 'fund' ? '₺' : 
                 assetType === 'crypto' ? '$' : 
                 assetType === 'gold' ? '₺' : '₺'}
                {price.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center space-x-1 text-xs ${getPriceColor(price.change)}`}>
                {getPriceIcon(price.change)}
                <span>{price.change >= 0 ? '+' : ''}{price.change?.toFixed(2)}</span>
                <span>({price.changePercent >= 0 ? '+' : ''}{price.changePercent?.toFixed(2)}%)</span>
              </div>
            </div>
          ) : asset.price ? (
            <div className="space-y-1">
              <div className="font-medium text-red-500 text-xs">MOCK DATA</div>
              <div className="font-medium text-gray-900">
                {assetType === 'fund' ? '₺' : 
                 assetType === 'crypto' ? '$' : 
                 assetType === 'gold' ? '₺' : '₺'}
                {asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Fetching price...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetPicker;
