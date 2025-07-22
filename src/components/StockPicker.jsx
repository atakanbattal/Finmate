import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, ChevronDown, X } from 'lucide-react';
import { searchStocks, findStockBySymbol, BIST_STOCKS } from '../data/bistStocks';
import marketDataService from '../services/marketData';

const StockPicker = ({ value, onChange, placeholder = "Hisse senedi seçin..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockPrice, setStockPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Seçili hisse senedini başlat
  useEffect(() => {
    if (value && typeof value === 'string') {
      const stock = findStockBySymbol(value);
      if (stock) {
        setSelectedStock(stock);
        fetchStockPrice(stock.symbol);
      }
    } else if (value && value.symbol) {
      setSelectedStock(value);
      fetchStockPrice(value.symbol);
    }
  }, [value]);

  // Arama sonuçlarını güncelle
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchStocks(searchQuery);
      setSearchResults(results);
    } else if (searchQuery.length === 0) {
      // Popüler hisseler göster
      setSearchResults(BIST_STOCKS.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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

  // Hisse senedi fiyatını al
  const fetchStockPrice = async (symbol) => {
    setLoading(true);
    try {
      const price = await marketDataService.getSingleStockPrice(symbol);
      setStockPrice(price);
    } catch (error) {
      console.error('Fiyat alınamadı:', error);
      setStockPrice(null);
    } finally {
      setLoading(false);
    }
  };

  // Hisse senedi seç
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setIsOpen(false);
    setSearchQuery('');
    
    // Parent component'e bildir
    onChange({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      market: stock.market
    });

    // Fiyatı al
    fetchStockPrice(stock.symbol);
  };

  // Seçimi temizle
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedStock(null);
    setStockPrice(null);
    onChange(null);
  };

  // Dropdown aç/kapat
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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
            {selectedStock ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{selectedStock.symbol}</span>
                  <span className="text-sm text-gray-600">{selectedStock.name}</span>
                  {selectedStock && (
                    <button
                      onClick={handleClear}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                
                {/* Fiyat Bilgisi */}
                {stockPrice && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">₺{stockPrice.price}</span>
                      {getPriceIcon(stockPrice.change)}
                    </div>
                    <div className={`flex items-center space-x-1 ${getPriceColor(stockPrice.change)}`}>
                      <span>{stockPrice.change >= 0 ? '+' : ''}{stockPrice.change}</span>
                      <span>({stockPrice.changePercent >= 0 ? '+' : ''}{stockPrice.changePercent}%)</span>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="text-sm text-blue-600">Fiyat güncelleniyor...</div>
                )}
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
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
                placeholder="Hisse senedi ara (sembol veya isim)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sonuçlar */}
          <div className="max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((stock) => (
                  <StockOption
                    key={stock.symbol}
                    stock={stock}
                    onSelect={handleSelectStock}
                    isSelected={selectedStock?.symbol === stock.symbol}
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
                <p className="text-sm">Popüler hisse senetleri</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hisse Senedi Seçeneği Bileşeni
const StockOption = ({ stock, onSelect, isSelected }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hover'da fiyat al
  const handleMouseEnter = async () => {
    if (!price && !loading) {
      setLoading(true);
      try {
        const stockPrice = await marketDataService.getSingleStockPrice(stock.symbol);
        setPrice(stockPrice);
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
      onClick={() => onSelect(stock)}
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
            <span className="font-semibold text-gray-900">{stock.symbol}</span>
            <span className="text-sm text-gray-600 truncate">{stock.name}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {stock.sector}
            </span>
            <span className="text-xs text-gray-500">{stock.market}</span>
          </div>
        </div>

        {/* Fiyat Bilgisi */}
        <div className="text-right ml-4">
          {loading ? (
            <div className="text-xs text-blue-600">Yükleniyor...</div>
          ) : price ? (
            <div className="space-y-1">
              <div className="font-medium text-gray-900">₺{price.price}</div>
              <div className={`flex items-center space-x-1 text-xs ${getPriceColor(price.change)}`}>
                {getPriceIcon(price.change)}
                <span>{price.change >= 0 ? '+' : ''}{price.change}</span>
                <span>({price.changePercent >= 0 ? '+' : ''}{price.changePercent}%)</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Hover for price</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockPicker;
