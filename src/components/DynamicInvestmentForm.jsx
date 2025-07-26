import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Info } from 'lucide-react';
import { investmentTypes } from '../data/investmentTypes';

const DynamicInvestmentForm = ({ investment, onSubmit, onCancel }) => {
  console.log('🔍 DYNAMICINVESTMENTFORM RENDER - Gelen investment prop:', investment);
  
  // Investment objesinin yapısını analiz et
  if (investment) {
    console.log('🔍 INVESTMENT OBJECT ANALYSIS:');
    console.log('🔍 Object.keys(investment):', Object.keys(investment));
    console.log('🔍 Object.entries(investment):', Object.entries(investment));
    console.log('🔍 investment.id:', investment.id);
    console.log('🔍 investment.name:', investment.name);
    console.log('🔍 investment.type:', investment.type);
    console.log('🔍 investment.amount:', investment.amount);
    console.log('🔍 investment.currentValue:', investment.currentValue);
    console.log('🔍 investment.notes:', investment.notes);
    console.log('🔍 investment.purchaseDate:', investment.purchaseDate);
    
    // Yatırım türüne özel alanları kontrol et
    if (investment.type === 'fund') {
      console.log('🔍 FUND SPECIFIC FIELDS:');
      console.log('🔍 investment.units:', investment.units);
      console.log('🔍 investment.purchasePrice:', investment.purchasePrice);
      console.log('🔍 investment.currentPrice:', investment.currentPrice);
      console.log('🔍 investment.fundCode:', investment.fundCode);
      console.log('🔍 investment.fundName:', investment.fundName);
    }
    
    console.log('🔍 FULL INVESTMENT OBJECT STRUCTURE:', JSON.stringify(investment, null, 2));
  }

  const [investmentType, setInvestmentType] = useState(investment?.type || '');
  
  // KESIN ÇÖZÜM: Investment objesinin gerçek yapısına göre form data initialization
  const [formData, setFormData] = useState(() => {
    console.log('🔍 FORM INITIALIZATION START - Investment prop:', investment);
    
    if (!investment) {
      console.log('⚠️ No investment provided, returning empty form data');
      return {};
    }
    
    // TEMEL ALANLAR - HER ZAMAN MEVCUT
    const initialData = {
      name: investment.name || '',
      type: investment.type || '',
      notes: investment.notes || '',
      purchaseDate: investment.purchaseDate || '',
      amount: investment.amount ? investment.amount.toString() : '',
      currentValue: investment.currentValue ? investment.currentValue.toString() : ''
    };
    
    // YATIRIM TÜRÜNE GÖRE TEMEL ALANLARI DOĞRU FORM ALANLARININA MAP ET
    if (investment.type === 'fund') {
      // Yatırım fonu için: investment objesinden tüm alanları yükle
      initialData.units = investment.units ? investment.units.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.fundCode = investment.fundCode || '';
      initialData.fundName = investment.fundName || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      // Eğer fundCode boşsa name'den çıkarmaya çalış
      if (!initialData.fundCode) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.fundCode = nameParts[0] || '';
          initialData.fundName = nameParts[0] || '';
        }
      }
      
      console.log('✅ FUND MAPPING - units:', initialData.units);
      console.log('✅ FUND MAPPING - fundCode:', initialData.fundCode);
      console.log('✅ FUND MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ FUND MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'stock') {
      // Hisse senedi için: investment objesinden tüm alanları yükle
      initialData.lots = investment.lots ? investment.lots.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.stockSymbol = investment.stockSymbol || '';
      initialData.stockName = investment.stockName || '';
      initialData.purchasePricePerLot = investment.purchasePricePerLot ? investment.purchasePricePerLot.toString() : '';
      initialData.currentPricePerLot = investment.currentPricePerLot ? investment.currentPricePerLot.toString() : '';
      
      // Eğer stockSymbol boşsa name'den çıkarmaya çalış
      if (!initialData.stockSymbol) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.stockSymbol = nameParts[0] || '';
          initialData.stockName = nameParts[0] || '';
        }
      }
      
      console.log('✅ STOCK MAPPING - lots:', initialData.lots);
      console.log('✅ STOCK MAPPING - stockSymbol:', initialData.stockSymbol);
      console.log('✅ STOCK MAPPING - purchasePricePerLot:', initialData.purchasePricePerLot);
      console.log('✅ STOCK MAPPING - currentPricePerLot:', initialData.currentPricePerLot);
      
    } else if (investment.type === 'crypto') {
      // Kripto için: investment objesinden tüm alanları yükle
      initialData.amount = investment.amount ? investment.amount.toString() : '';
      initialData.cryptoSymbol = investment.cryptoSymbol || '';
      initialData.cryptoName = investment.cryptoName || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      // Eğer cryptoSymbol boşsa name'den çıkarmaya çalış
      if (!initialData.cryptoSymbol) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.cryptoSymbol = nameParts[0] || '';
          initialData.cryptoName = nameParts[0] || '';
        }
      }
      
      console.log('✅ CRYPTO MAPPING - amount:', initialData.amount);
      console.log('✅ CRYPTO MAPPING - cryptoSymbol:', initialData.cryptoSymbol);
      console.log('✅ CRYPTO MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ CRYPTO MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'gold') {
      // Altın için: investment objesinden tüm alanları yükle
      initialData.weight = investment.weight ? investment.weight.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.goldType = investment.goldType || investment.name || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      console.log('✅ GOLD MAPPING - weight:', initialData.weight);
      console.log('✅ GOLD MAPPING - goldType:', initialData.goldType);
      console.log('✅ GOLD MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ GOLD MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'deposit') {
      // Mevduat için: investment objesinden tüm alanları yükle
      initialData.amount = investment.amount ? investment.amount.toString() : '';
      initialData.bankName = investment.bankName || investment.name || '';
      initialData.interestRate = investment.interestRate ? investment.interestRate.toString() : '';
      initialData.maturityDate = investment.maturityDate || '';
      
      console.log('✅ DEPOSIT MAPPING - amount:', initialData.amount);
      console.log('✅ DEPOSIT MAPPING - bankName:', initialData.bankName);
      console.log('✅ DEPOSIT MAPPING - interestRate:', initialData.interestRate);
      console.log('✅ DEPOSIT MAPPING - maturityDate:', initialData.maturityDate);
    }
    
    console.log('✅ KESIN ÇÖZÜM - Form data initialized:', initialData);
    console.log('✅ Investment name loaded:', initialData.name);
    console.log('✅ Investment type loaded:', initialData.type);
    
    return initialData;
  });

  // Investment prop'u değiştiğinde form data'yı yeniden yükle
  useEffect(() => {
    console.log('🔄 USEEFFECT START - Investment prop changed:', investment);
    
    if (!investment) {
      console.log('🔄 USEEFFECT - No investment, clearing form');
      setFormData({});
      setInvestmentType('');
      return;
    }
    
    // TEMEL ALANLAR - HER ZAMAN MEVCUT
    const initialData = {
      name: investment.name || '',
      type: investment.type || '',
      notes: investment.notes || '',
      purchaseDate: investment.purchaseDate || '',
      amount: investment.amount ? investment.amount.toString() : '',
      currentValue: investment.currentValue ? investment.currentValue.toString() : ''
    };
    
    // YATIRIM TÜRÜNE GÖRE TEMEL ALANLARI DOĞRU FORM ALANLARININA MAP ET
    if (investment.type === 'fund') {
      // Yatırım fonu için: investment objesinden tüm alanları yükle
      initialData.units = investment.units ? investment.units.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.fundCode = investment.fundCode || '';
      initialData.fundName = investment.fundName || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      // Eğer fundCode boşsa name'den çıkarmaya çalış
      if (!initialData.fundCode) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.fundCode = nameParts[0] || '';
          initialData.fundName = nameParts[0] || '';
        }
      }
      
      console.log('✅ USEEFFECT FUND MAPPING - units:', initialData.units);
      console.log('✅ USEEFFECT FUND MAPPING - fundCode:', initialData.fundCode);
      console.log('✅ USEEFFECT FUND MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ USEEFFECT FUND MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'stock') {
      // Hisse senedi için: investment objesinden tüm alanları yükle
      initialData.lots = investment.lots ? investment.lots.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.stockSymbol = investment.stockSymbol || '';
      initialData.stockName = investment.stockName || '';
      initialData.purchasePricePerLot = investment.purchasePricePerLot ? investment.purchasePricePerLot.toString() : '';
      initialData.currentPricePerLot = investment.currentPricePerLot ? investment.currentPricePerLot.toString() : '';
      
      // Eğer stockSymbol boşsa name'den çıkarmaya çalış
      if (!initialData.stockSymbol) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.stockSymbol = nameParts[0] || '';
          initialData.stockName = nameParts[0] || '';
        }
      }
      
      console.log('✅ USEEFFECT STOCK MAPPING - lots:', initialData.lots);
      console.log('✅ USEEFFECT STOCK MAPPING - stockSymbol:', initialData.stockSymbol);
      console.log('✅ USEEFFECT STOCK MAPPING - purchasePricePerLot:', initialData.purchasePricePerLot);
      console.log('✅ USEEFFECT STOCK MAPPING - currentPricePerLot:', initialData.currentPricePerLot);
      
    } else if (investment.type === 'crypto') {
      // Kripto için: investment objesinden tüm alanları yükle
      initialData.amount = investment.amount ? investment.amount.toString() : '';
      initialData.cryptoSymbol = investment.cryptoSymbol || '';
      initialData.cryptoName = investment.cryptoName || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      // Eğer cryptoSymbol boşsa name'den çıkarmaya çalış
      if (!initialData.cryptoSymbol) {
        const nameParts = investment.name?.split(' - ');
        if (nameParts && nameParts.length > 0) {
          initialData.cryptoSymbol = nameParts[0] || '';
          initialData.cryptoName = nameParts[0] || '';
        }
      }
      
      console.log('✅ USEEFFECT CRYPTO MAPPING - amount:', initialData.amount);
      console.log('✅ USEEFFECT CRYPTO MAPPING - cryptoSymbol:', initialData.cryptoSymbol);
      console.log('✅ USEEFFECT CRYPTO MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ USEEFFECT CRYPTO MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'gold') {
      // Altın için: investment objesinden tüm alanları yükle
      initialData.weight = investment.weight ? investment.weight.toString() : (investment.amount ? investment.amount.toString() : '');
      initialData.goldType = investment.goldType || investment.name || '';
      initialData.purchasePrice = investment.purchasePrice ? investment.purchasePrice.toString() : '';
      initialData.currentPrice = investment.currentPrice ? investment.currentPrice.toString() : '';
      
      console.log('✅ USEEFFECT GOLD MAPPING - weight:', initialData.weight);
      console.log('✅ USEEFFECT GOLD MAPPING - goldType:', initialData.goldType);
      console.log('✅ USEEFFECT GOLD MAPPING - purchasePrice:', initialData.purchasePrice);
      console.log('✅ USEEFFECT GOLD MAPPING - currentPrice:', initialData.currentPrice);
      
    } else if (investment.type === 'deposit') {
      // Mevduat için: investment objesinden tüm alanları yükle
      initialData.amount = investment.amount ? investment.amount.toString() : '';
      initialData.bankName = investment.bankName || investment.name || '';
      initialData.interestRate = investment.interestRate ? investment.interestRate.toString() : '';
      initialData.maturityDate = investment.maturityDate || '';
      
      console.log('✅ USEEFFECT DEPOSIT MAPPING - amount:', initialData.amount);
      console.log('✅ USEEFFECT DEPOSIT MAPPING - bankName:', initialData.bankName);
      console.log('✅ USEEFFECT DEPOSIT MAPPING - interestRate:', initialData.interestRate);
      console.log('✅ USEEFFECT DEPOSIT MAPPING - maturityDate:', initialData.maturityDate);
    }
    
    console.log('✅ KESIN USEEFFECT - Form data reloaded:', initialData);
    console.log('✅ USEEFFECT - Investment name loaded:', initialData.name);
    console.log('✅ USEEFFECT - Investment type loaded:', initialData.type);
    
    setFormData(initialData);
    setInvestmentType(investment.type);
  }, [investment]);

  // Calculate investment preview
  const calculations = useMemo(() => {
    if (!investmentType || !investmentTypes[investmentType]) return null;
    
    const typeConfig = investmentTypes[investmentType];
    // Market data'yı calculation'a geç (şimdilik null, gerçek entegrasyon sonra yapılacak)
    return typeConfig.calculate(formData, investment?.purchaseDate, null, null);
  }, [investmentType, formData, investment?.purchaseDate]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!investmentType) {
      alert('Lütfen yatırım türünü seçin');
      return;
    }

    const typeConfig = investmentTypes[investmentType];
    const requiredFields = typeConfig.fields.filter(field => field.required);
    
    for (const field of requiredFields) {
      if (!formData[field.key]) {
        alert(`Lütfen ${field.label} alanını doldurun`);
        return;
      }
    }

    // Calculate correct investment amount and current value based on type
    let calculatedAmount = parseFloat(formData.amount) || 0;
    let calculatedCurrentValue = parseFloat(formData.currentValue) || 0;
  
    // Her yatırım türü için doğru tutarı VE güncel değeri hesapla
    if (investmentTypes[investmentType] && investmentTypes[investmentType].calculate) {
      try {
        const calc = investmentTypes[investmentType].calculate(formData, null, calculatedAmount);
        calculatedAmount = calc.totalInvested || calculatedAmount;
        calculatedCurrentValue = calc.currentValue || calculatedCurrentValue;
        
        console.log('💰 CALCULATION RESULTS:');
        console.log('💰 totalInvested:', calc.totalInvested);
        console.log('💰 currentValue:', calc.currentValue);
        console.log('💰 units:', calc.units);
        console.log('💰 extraInfo:', calc.extraInfo);
      } catch (error) {
        console.error(`Error calculating amount for ${investmentType}:`, error);
      }
    }

    // Create investment name based on type and data - MANUEL GİRİŞ İÇİN BASİTLEŞTİRİLDİ
    let investmentName = formData.name;
    if (!investmentName) {
      if (investmentType === 'deposit') {
        const bankName = formData.bankName || 'Banka';
        investmentName = `${bankName} Mevduat - ₺${calculatedAmount.toLocaleString('tr-TR')}`;
      } else if (investmentType === 'stock') {
        const stockName = formData.stockName || 'Hisse Senedi';
        investmentName = `${stockName} - ${formData.lots || 0} lot`;
      } else if (investmentType === 'fund') {
        const fundName = formData.fundName || 'Yatırım Fonu';
        investmentName = `${fundName} - ₺${calculatedAmount.toLocaleString('tr-TR')}`;
      } else if (investmentType === 'crypto') {
        const cryptoName = formData.cryptoName || 'Kripto Para';
        const cryptoSymbol = formData.cryptoSymbol || 'COIN';
        investmentName = `${cryptoName} - ${formData.amount || 0} ${cryptoSymbol}`;
      } else if (investmentType === 'gold') {
        const goldType = formData.goldType || 'Altın';
        investmentName = `${goldType} - ${formData.weight || 0} gram`;
      } else {
        investmentName = typeConfig.name;
      }
    }

    const investmentData = {
      type: investmentType,
      name: investmentName,
      amount: calculatedAmount,
      currentValue: calculatedCurrentValue,
      notes: formData.notes || '',
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      // Yatırım türüne özel alanları da ekle
      ...formData
    };

    console.log('📤 SUBMITTING INVESTMENT DATA:', investmentData);
    onSubmit(investmentData);
  };

  const currentTypeConfig = investmentTypes[investmentType];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {investment ? 'Yatırımı Düzenle' : 'Yeni Yatırım Ekle'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yatırım Türü *
          </label>
          <select
            value={investmentType}
            onChange={(e) => {
              setInvestmentType(e.target.value);
              setFormData({}); // Reset form data when type changes
            }}
            className="select-field"
            required
          >
            <option value="">Seçiniz</option>
            {Object.entries(investmentTypes).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Fields */}
        {currentTypeConfig && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              {currentTypeConfig.name} Detayları
            </h3>
            
            {currentTypeConfig.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && '*'}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="select-field"
                    required={field.required}
                  >
                    <option value="">Seçiniz</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                    required={field.required}
                    rows="3"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                    required={field.required}
                    step={field.step}
                    min={field.min}
                  />
                )}
              </div>
            ))}

            {/* Calculations Preview */}
            {calculations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Hesaplama Önizlemesi</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Yatırılan Tutar:</span>
                    <div className="text-blue-900 font-semibold">
                      ₺{calculations.totalInvested.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Güncel Değer:</span>
                    <div className="text-blue-900 font-semibold">
                      ₺{calculations.currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Kazanç/Kayıp:</span>
                    <div className={`font-semibold ${calculations.currentValue >= calculations.totalInvested ? 'text-green-600' : 'text-red-600'}`}>
                      {calculations.currentValue >= calculations.totalInvested ? '+' : ''}
                      ₺{(calculations.currentValue - calculations.totalInvested).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-blue-700 font-medium">Birim: </span>
                  <span className="text-blue-900">{calculations.units}</span>
                  {calculations.extraInfo && (
                    <div className="mt-2 flex items-center text-blue-700">
                      <Info className="h-4 w-4 mr-1" />
                      <span className="text-sm">{calculations.extraInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-6 border-t">
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            {investment ? 'Güncelle' : 'Ekle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicInvestmentForm;
export { investmentTypes };
