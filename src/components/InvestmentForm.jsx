import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import financialDataService from '../services/financialDataService';

const InvestmentForm = ({ onAddTransaction, onCancel, transactionType }) => {
  const [formData, setFormData] = useState({
    instrumentType: 'crypto', // crypto, currency, stock
    selectedInstrument: null,
    quantity: '',
    description: ''
  });
  
  const [financialData, setFinancialData] = useState({
    crypto: [],
    currency: [],
    stock: [],
    all: []
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load financial data on component mount
  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const data = await financialDataService.getAllFinancialData();
      setFinancialData(data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get filtered instruments based on type and search
  const getFilteredInstruments = () => {
    const instruments = financialData[formData.instrumentType] || [];
    return financialDataService.searchInstruments(searchQuery, instruments);
  };

  // Handle instrument selection
  const handleInstrumentSelect = (instrument) => {
    setFormData(prev => ({
      ...prev,
      selectedInstrument: instrument,
      description: `${instrument.name} (${instrument.symbol})`
    }));
    setSearchQuery(instrument.name);
    setShowDropdown(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.selectedInstrument || !formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Lütfen yatırım aracını seçin ve geçerli bir miktar girin.');
      return;
    }

    const totalAmount = formData.selectedInstrument.current_price * parseFloat(formData.quantity);
    
    const transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: totalAmount,
      description: formData.description,
      category: 'Yatırım',
      instrumentType: formData.instrumentType,
      instrumentId: formData.selectedInstrument.id,
      instrumentSymbol: formData.selectedInstrument.symbol,
      instrumentName: formData.selectedInstrument.name,
      quantity: parseFloat(formData.quantity),
      unitPrice: formData.selectedInstrument.current_price,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    onAddTransaction(transaction);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const filteredInstruments = getFilteredInstruments();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h4 className="font-medium text-gray-900">
          {transactionType === 'income' ? 'Yatırım Satışı' : 'Yatırım Alımı'}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transactionType === 'income' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          Yatırım
        </span>
      </div>

      {/* Investment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yatırım Türü
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, instrumentType: 'crypto', selectedInstrument: null }))}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.instrumentType === 'crypto'
                ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Kripto Para
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, instrumentType: 'currency', selectedInstrument: null }))}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.instrumentType === 'currency'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Döviz
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, instrumentType: 'stock', selectedInstrument: null }))}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.instrumentType === 'stock'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hisse Senedi
          </button>
        </div>
      </div>

      {/* Instrument Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yatırım Aracı Seçin
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={`${formData.instrumentType === 'crypto' ? 'Bitcoin, Ethereum...' : 
                         formData.instrumentType === 'currency' ? 'USD, EUR...' : 
                         'AKBNK, GARAN...'} ara`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && !loading && filteredInstruments.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredInstruments.slice(0, 10).map((instrument) => (
              <button
                key={instrument.id}
                type="button"
                onClick={() => handleInstrumentSelect(instrument)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {instrument.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {instrument.symbol}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatPrice(instrument.current_price)}
                  </div>
                  {instrument.price_change_percentage_24h !== undefined && (
                    <div className={`text-sm flex items-center ${
                      instrument.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {instrument.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(instrument.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Instrument Info */}
      {formData.selectedInstrument && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {formData.selectedInstrument.name}
              </div>
              <div className="text-sm text-gray-500">
                {formData.selectedInstrument.symbol}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {formatPrice(formData.selectedInstrument.current_price)}
              </div>
              {formData.selectedInstrument.price_change_percentage_24h !== undefined && (
                <div className={`text-sm ${
                  formData.selectedInstrument.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.selectedInstrument.price_change_percentage_24h >= 0 ? '+' : ''}
                  {formData.selectedInstrument.price_change_percentage_24h.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Miktar/Adet
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          placeholder="0.00"
          min="0"
          step="0.000001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {formData.selectedInstrument && formData.quantity && (
          <div className="mt-1 text-sm text-gray-600">
            Toplam: {formatPrice(formData.selectedInstrument.current_price * parseFloat(formData.quantity || 0))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSubmit}
          disabled={!formData.selectedInstrument || !formData.quantity}
          className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
            transactionType === 'income'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400'
          }`}
        >
          {transactionType === 'income' ? 'Sat' : 'Al'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">Veriler yükleniyor...</div>
        </div>
      )}
    </div>
  );
};

export default InvestmentForm;
