import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Info, TrendingUp } from 'lucide-react';
import AssetPicker from './AssetPicker';

// Investment types with their specific fields and calculations
export const investmentTypes = {
  'stock': {
    name: 'Hisse Senedi',
    fields: [
      { key: 'stockPicker', label: 'Hisse Senedi', type: 'stockpicker', required: true },
      { key: 'lotCount', label: 'Lot Adedi', type: 'number', required: true },
      { key: 'pricePerLot', label: 'Alış Fiyatı (₺/lot)', type: 'number', step: '0.01', required: true },
      { key: 'currentPricePerLot', label: 'Güncel Fiyat (₺/lot)', type: 'number', step: '0.01', placeholder: 'Manuel güncel fiyat girin' }
    ],
    calculate: (data, purchaseDate, investmentAmount, marketData) => {
      const lotCount = parseFloat(data.lotCount) || 0;
      const pricePerLot = parseFloat(data.pricePerLot) || 0;
      const manualCurrentPrice = parseFloat(data.currentPricePerLot) || 0;
      
      // Seçili hisse senedi bilgisi
      const stockInfo = data.stockPicker;
      const stockSymbol = stockInfo?.symbol;
      
      // Güncel fiyat belirleme: Manuel > Market Data > Alış Fiyatı
      let currentPrice = pricePerLot; // Fallback: alış fiyatı
      let extraInfo = '';
      let priceSource = 'Alış fiyatı kullanılıyor';
      
      // Önce manuel güncel fiyat kontrol et
      if (manualCurrentPrice > 0) {
        currentPrice = manualCurrentPrice;
        priceSource = 'Manuel güncel fiyat';
        const gain = currentPrice - pricePerLot;
        const gainPercent = pricePerLot > 0 ? ((gain / pricePerLot) * 100) : 0;
        extraInfo = `${stockInfo?.name || 'Hisse'} - Manuel: ₺${currentPrice.toFixed(2)} (${gain >= 0 ? '+' : ''}₺${gain.toFixed(2)} / ${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%)`;
      }
      // Market data'dan güncel fiyat al (eğer manuel girilmemişse)
      else if (stockSymbol && marketData && marketData[stockSymbol]) {
        currentPrice = marketData[stockSymbol].price || pricePerLot;
        priceSource = 'Otomatik market data';
        const change = marketData[stockSymbol].change;
        const changePercent = marketData[stockSymbol].changePercent;
        
        extraInfo = `${stockInfo.name} (${stockSymbol}) - Otomatik: ₺${currentPrice.toFixed(2)}`;
        if (change !== undefined) {
          extraInfo += ` (${change >= 0 ? '+' : ''}₺${change.toFixed(2)} / ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        }
      }
      // Hiçbir güncel fiyat yoksa alış fiyatını kullan
      else if (stockInfo) {
        extraInfo = `${stockInfo.name} (${stockSymbol}) - Güncel fiyat girilmemiş (kar/zarar: ₺0)`;
      }
      
      const totalInvested = lotCount * pricePerLot;
      const currentValue = lotCount * currentPrice;
      const gain = currentValue - totalInvested;
      const gainPercent = totalInvested > 0 ? ((gain / totalInvested) * 100) : 0;
      
      return {
        totalInvested,
        currentValue,
        gain,
        gainPercent,
        units: `${lotCount} lot`,
        extraInfo: extraInfo + ` | ${priceSource}`
      };
    }
  },
  'crypto': {
    name: 'Kripto Para',
    fields: [
      { key: 'cryptoPicker', label: 'Kripto Para', type: 'assetpicker', assetType: 'crypto', required: true },
      { key: 'amount', label: 'Miktar', type: 'number', step: '0.00000001', required: true },
      { key: 'purchasePrice', label: 'Alış Fiyatı ($)', type: 'number', step: '0.01', required: true },
      { key: 'currentPrice', label: 'Güncel Fiyat ($)', type: 'number', step: '0.01', placeholder: 'Otomatik güncellenecek' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const amount = parseFloat(data.amount) || 0;
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentPrice = parseFloat(data.currentPrice) || purchasePrice; // Fallback to purchase price
      
      const coinName = data.cryptoPicker?.name || data.coinName || 'Kripto Para';
      let extraInfo = `Coin: ${coinName}`;
      
      // Güncel fiyat durumu
      if (data.currentPrice && parseFloat(data.currentPrice) !== purchasePrice) {
        extraInfo += ` - Canlı fiyat: $${parseFloat(data.currentPrice).toFixed(2)}`;
      } else if (!data.currentPrice || parseFloat(data.currentPrice) === 0) {
        extraInfo += ' - Güncel fiyat girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: amount * purchasePrice,
        currentValue: amount * currentPrice,
        units: `${amount} ${coinName}`,
        gain: (amount * currentPrice) - (amount * purchasePrice),
        gainPercent: purchasePrice > 0 ? (((currentPrice - purchasePrice) / purchasePrice) * 100) : 0,
        extraInfo
      };
    }
  },
  'gold': {
    name: 'Altın',
    fields: [
      { key: 'goldPicker', label: 'Altın Türü', type: 'assetpicker', assetType: 'gold', required: true },
      { key: 'weight', label: 'Ağırlık (gram)', type: 'number', step: '0.01', required: true },
      { key: 'purchasePrice', label: 'Alış Fiyatı (₺/gram)', type: 'number', step: '0.01', required: true },
      { key: 'currentPrice', label: 'Güncel Fiyat (₺/gram)', type: 'number', step: '0.01', placeholder: 'Otomatik güncellenecek' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const weight = parseFloat(data.weight) || 0;
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentPrice = parseFloat(data.currentPrice);
      
      // Eğer güncel fiyat girilmemişse alış fiyatını kullan (kazanç 0 olur)
      const effectiveCurrentPrice = currentPrice || purchasePrice;
      
      let extraInfo = 'Altın yatırımı';
      
      // Güncel fiyat girilmemişse uyarı ekle
      if (!currentPrice || currentPrice === 0) {
        extraInfo += ' - Güncel fiyat girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: weight * purchasePrice,
        currentValue: weight * effectiveCurrentPrice,
        units: `${weight} gram`,
        extraInfo: extraInfo
      };
    }
  },
  'fund': {
    name: 'Yatırım Fonu',
    fields: [
      { key: 'fundPicker', label: 'Yatırım Fonu', type: 'assetpicker', assetType: 'fund', required: true },
      { key: 'units', label: 'Pay Adedi', type: 'number', step: '0.0001', required: true },
      { key: 'purchasePrice', label: 'Alış Fiyatı (₺)', type: 'number', step: '0.0001', required: true },
      { key: 'currentPrice', label: 'Güncel Fiyat (₺)', type: 'number', step: '0.0001', placeholder: 'Otomatik güncellenecek' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const units = parseFloat(data.units) || 0;
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentPrice = parseFloat(data.currentPrice);
      
      const effectiveCurrentPrice = currentPrice || purchasePrice;
      
      let extraInfo = data.fundName ? `Fon: ${data.fundName}` : null;
      if (data.fundCode) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + `Kod: ${data.fundCode}`;
      }
      
      if (!currentPrice || currentPrice === 0) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + 'Güncel fiyat girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: units * purchasePrice,
        currentValue: units * effectiveCurrentPrice,
        units: `${units} pay`,
        extraInfo: extraInfo
      };
    }
  },
  'bond': {
    name: 'Tahvil',
    fields: [
      { key: 'bondName', label: 'Tahvil Adı', type: 'text', required: true },
      { key: 'nominal', label: 'Nominal Değer (₺)', type: 'number', step: '0.01', required: true },
      { key: 'quantity', label: 'Adet', type: 'number', required: true },
      { key: 'purchasePrice', label: 'Alış Fiyatı (%)', type: 'number', step: '0.01', required: true },
      { key: 'currentPrice', label: 'Güncel Fiyat (%)', type: 'number', step: '0.01' },
      { key: 'maturityDate', label: 'Vade Tarihi', type: 'date' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const nominal = parseFloat(data.nominal) || 0;
      const quantity = parseFloat(data.quantity) || 0;
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentPrice = parseFloat(data.currentPrice);
      
      const effectiveCurrentPrice = currentPrice || purchasePrice;
      
      let extraInfo = data.bondName ? `Tahvil: ${data.bondName}` : null;
      if (data.maturityDate) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + `Vade: ${data.maturityDate}`;
      }
      
      if (!currentPrice || currentPrice === 0) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + 'Güncel fiyat girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: (nominal * quantity * purchasePrice) / 100,
        currentValue: (nominal * quantity * effectiveCurrentPrice) / 100,
        units: `${quantity} adet`,
        extraInfo: extraInfo
      };
    }
  },
  'real_estate': {
    name: 'Gayrimenkul',
    fields: [
      { key: 'propertyName', label: 'Gayrimenkul Adı', type: 'text', required: true },
      { key: 'propertyType', label: 'Tür', type: 'select', required: true, options: [
        { value: 'apartment', label: 'Daire' },
        { value: 'house', label: 'Müstakil Ev' },
        { value: 'office', label: 'Ofis' },
        { value: 'shop', label: 'Dükkan' },
        { value: 'land', label: 'Arsa' },
        { value: 'other', label: 'Diğer' }
      ]},
      { key: 'purchasePrice', label: 'Alış Fiyatı (₺)', type: 'number', step: '0.01', required: true },
      { key: 'currentValue', label: 'Güncel Değer (₺)', type: 'number', step: '0.01' },
      { key: 'location', label: 'Konum', type: 'text', placeholder: 'Şehir/İlçe' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentValue = parseFloat(data.currentValue);
      
      const effectiveCurrentValue = currentValue || purchasePrice;
      
      const propertyTypes = {
        'apartment': 'Daire',
        'house': 'Müstakil Ev',
        'office': 'Ofis',
        'shop': 'Dükkan',
        'land': 'Arsa',
        'other': 'Diğer'
      };
      
      let extraInfo = data.propertyName ? `${data.propertyName}` : null;
      if (data.propertyType) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + propertyTypes[data.propertyType];
      }
      if (data.location) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + data.location;
      }
      
      if (!currentValue || currentValue === 0) {
        extraInfo = (extraInfo ? extraInfo + ' - ' : '') + 'Güncel değer girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: purchasePrice,
        currentValue: effectiveCurrentValue,
        units: '1 adet',
        extraInfo: extraInfo
      };
    }
  },
  'commodity': {
    name: 'Emtia',
    fields: [
      { key: 'commodityType', label: 'Emtia Türü', type: 'select', required: true, options: [
        { value: 'silver', label: 'Gümüş' },
        { value: 'platinum', label: 'Platin' },
        { value: 'oil', label: 'Petrol' },
        { value: 'wheat', label: 'Buğday' },
        { value: 'cotton', label: 'Pamuk' },
        { value: 'other', label: 'Diğer' }
      ]},
      { key: 'quantity', label: 'Miktar', type: 'number', step: '0.01', required: true },
      { key: 'unit', label: 'Birim', type: 'select', required: true, options: [
        { value: 'gram', label: 'Gram' },
        { value: 'kg', label: 'Kilogram' },
        { value: 'ton', label: 'Ton' },
        { value: 'barrel', label: 'Varil' },
        { value: 'lot', label: 'Lot' }
      ]},
      { key: 'purchasePrice', label: 'Alış Fiyatı (₺/birim)', type: 'number', step: '0.01', required: true },
      { key: 'currentPrice', label: 'Güncel Fiyat (₺/birim)', type: 'number', step: '0.01' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const quantity = parseFloat(data.quantity) || 0;
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const currentPrice = parseFloat(data.currentPrice);
      
      const effectiveCurrentPrice = currentPrice || purchasePrice;
      
      const commodityTypes = {
        'silver': 'Gümüş',
        'platinum': 'Platin',
        'oil': 'Petrol',
        'wheat': 'Buğday',
        'cotton': 'Pamuk',
        'other': 'Diğer'
      };
      
      const units = {
        'gram': 'gram',
        'kg': 'kg',
        'ton': 'ton',
        'barrel': 'varil',
        'lot': 'lot'
      };
      
      let extraInfo = commodityTypes[data.commodityType] || 'Emtia';
      
      if (!currentPrice || currentPrice === 0) {
        extraInfo += ' - Güncel fiyat girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: quantity * purchasePrice,
        currentValue: quantity * effectiveCurrentPrice,
        units: `${quantity} ${units[data.unit] || data.unit}`,
        extraInfo: extraInfo
      };
    }
  },
  'forex': {
    name: 'Döviz',
    fields: [
      { key: 'currency', label: 'Döviz Türü', type: 'select', required: true, options: [
        { value: 'USD', label: 'Amerikan Doları (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'GBP', label: 'İngiliz Sterlini (GBP)' },
        { value: 'CHF', label: 'İsviçre Frangı (CHF)' },
        { value: 'JPY', label: 'Japon Yeni (JPY)' },
        { value: 'CAD', label: 'Kanada Doları (CAD)' },
        { value: 'AUD', label: 'Avustralya Doları (AUD)' },
        { value: 'other', label: 'Diğer' }
      ]},
      { key: 'amount', label: 'Miktar', type: 'number', step: '0.01', required: true },
      { key: 'purchaseRate', label: 'Alış Kuru (₺)', type: 'number', step: '0.0001', required: true },
      { key: 'currentRate', label: 'Güncel Kur (₺)', type: 'number', step: '0.0001' }
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      const amount = parseFloat(data.amount) || 0;
      const purchaseRate = parseFloat(data.purchaseRate) || 0;
      const currentRate = parseFloat(data.currentRate);
      
      const effectiveCurrentRate = currentRate || purchaseRate;
      
      let extraInfo = `Döviz: ${data.currency}`;
      
      if (!currentRate || currentRate === 0) {
        extraInfo += ' - Güncel kur girilmemiş (kazanç 0)';
      }
      
      return {
        totalInvested: amount * purchaseRate,
        currentValue: amount * effectiveCurrentRate,
        units: `${amount} ${data.currency}`,
        extraInfo: extraInfo
      };
    }
  },
  'deposit': {
    name: 'Vadeli Mevduat',
    fields: [
      { key: 'name', label: 'Yatırım Adı', type: 'text', required: true, placeholder: 'Örn: Ziraat Bankası Vadeli Mevduat' },
      { key: 'amount', label: 'Ana Para (₺)', type: 'number', step: '0.01', required: true },
      { key: 'startDate', label: 'Başlangıç Tarihi', type: 'date', required: true },
      { key: 'endDate', label: 'Vade Tarihi', type: 'date', required: true },
      { key: 'interestRate', label: 'Faiz Oranı (%)', type: 'number', step: '0.01', required: true },
      { key: 'interestType', label: 'Faiz Türü', type: 'select', required: true, options: [
        { value: 'simple', label: 'Basit Faiz' },
        { value: 'compound', label: 'Bileşik Faiz (Aylık)' }
      ]}
    ],
    calculate: (data, purchaseDate, investmentAmount) => {
      // Amount can come from data.amount (form) or investmentAmount (existing investment)
      const amount = parseFloat(data.amount) || parseFloat(investmentAmount) || 0;
      const rate = parseFloat(data.interestRate) || 0;
      
      // Vade süresini hesapla (başlangıç ve bitiş tarihi arasındaki ay sayısı)
      let termMonths = 0;
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        termMonths = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44));
      }
      
      const startDate = data.startDate ? new Date(data.startDate) : (purchaseDate ? new Date(purchaseDate) : new Date());
      const currentDate = new Date();
      
      console.log('📊 Vadeli Mevduat Hesaplama:', {
        amount,
        rate,
        termMonths,
        startDate: startDate.toISOString().split('T')[0],
        endDate: data.endDate,
        interestType: data.interestType
      });
      
      // Calculate elapsed months from start date
      const elapsedMonths = Math.max(0, Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30.44)));
      const actualElapsedMonths = Math.min(elapsedMonths, termMonths);
      
      let currentValue, maturityValue, progressInfo;
      
      if (data.interestType === 'compound') {
        // Compound interest calculation
        const monthlyRate = rate / 100 / 12;
        maturityValue = amount * Math.pow(1 + monthlyRate, termMonths);
        currentValue = amount * Math.pow(1 + monthlyRate, actualElapsedMonths);
      } else {
        // Simple interest calculation
        const monthlyInterest = (amount * rate / 100) / 12;
        maturityValue = amount + (monthlyInterest * termMonths);
        currentValue = amount + (monthlyInterest * actualElapsedMonths);
      }
      
      // Progress information - Her zaman dinamik hesaplama yap
      if (currentDate < startDate) {
        progressInfo = 'Henüz başlamadı';
        currentValue = amount; // No interest earned yet
      } else if (elapsedMonths >= termMonths) {
        progressInfo = 'Vade doldu';
        currentValue = maturityValue;
      } else {
        // Başlangıç tarihi varsa gerçek geçen süreyi kullan
        if (data.startDate) {
          progressInfo = `${actualElapsedMonths}/${termMonths} ay geçti`;
          // currentValue zaten yukarıda hesaplandı
        } else {
          // Başlangıç tarihi yoksa purchase date'i kullan
          const purchaseDateObj = purchaseDate ? new Date(purchaseDate) : new Date();
          const elapsedFromPurchase = Math.max(0, Math.floor((currentDate - purchaseDateObj) / (1000 * 60 * 60 * 24 * 30.44)));
          const actualElapsedFromPurchase = Math.min(elapsedFromPurchase, termMonths);
          
          if (data.interestType === 'compound') {
            const monthlyRate = rate / 100 / 12;
            currentValue = amount * Math.pow(1 + monthlyRate, actualElapsedFromPurchase);
          } else {
            const monthlyInterest = (amount * rate / 100) / 12;
            currentValue = amount + (monthlyInterest * actualElapsedFromPurchase);
          }
          
          progressInfo = `${actualElapsedFromPurchase}/${termMonths} ay geçti (alış tarihinden)`;
        }
      }
      
      return {
        totalInvested: amount,
        currentValue: currentValue,
        maturityValue: maturityValue,
        units: `${termMonths} ay vadeli`,
        extraInfo: progressInfo
      };
    }
  }
};

const DynamicInvestmentForm = ({ investment, onSubmit, onCancel }) => {
  const [investmentType, setInvestmentType] = useState(investment?.type || '');
  const [formData, setFormData] = useState(() => {
    if (investment) {
      // Mevcut yatırımı düzenleme modu - Tüm alanları yükle
      console.log('🔍 Loading investment for editing:', investment);
      console.log('🔍 Investment type:', investment.type);
      console.log('🔍 Investment data:', investment.data);
      console.log('🔍 Investment details:', investment.details);
      
      const initialData = {
        name: investment.name || '',
        amount: investment.amount?.toString() || '',
        // Investment data'dan tüm alanları yükle
        ...investment.data || {},
        // Details'den de tüm alanları yükle
        ...investment.details || {},
        // Yatırım türüne özel alanları kontrol et ve güvenli yükle
        ...(investment.type === 'stock' && {
          stockPicker: investment.data?.stockPicker || investment.details?.stockPicker || null,
          lotCount: (investment.data?.lotCount || investment.details?.lotCount || '').toString(),
          pricePerLot: (investment.data?.pricePerLot || investment.details?.pricePerLot || '').toString(),
          currentPricePerLot: (investment.data?.currentPricePerLot || investment.details?.currentPricePerLot || investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'crypto' && {
          cryptoPicker: investment.data?.cryptoPicker || investment.details?.cryptoPicker || null,
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'gold' && {
          goldPicker: investment.data?.goldPicker || investment.details?.goldPicker || null,
          weight: (investment.data?.weight || investment.details?.weight || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'fund' && {
          fundPicker: investment.data?.fundPicker || investment.details?.fundPicker || null,
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'deposit' && {
          name: investment.data?.name || investment.details?.name || investment.name || '',
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          interestRate: (investment.data?.interestRate || investment.details?.interestRate || '').toString(),
          startDate: investment.data?.startDate || investment.details?.startDate || '',
          termMonths: (investment.data?.termMonths || investment.details?.termMonths || '').toString(),
          interestType: investment.data?.interestType || investment.details?.interestType || 'simple'
        })
      };
      
      console.log('✅ Form data initialized:', initialData);
      return initialData;
    }
    console.log('⚠️ No investment provided, returning empty form data');
    return {};
  });

  // Investment prop'u değiştiğinde form'u yeniden yükle
  useEffect(() => {
    if (investment) {
      console.log('🔄 Investment prop changed, reloading form data:', investment);
      setInvestmentType(investment.type || '');
      
      const newFormData = {
        name: investment.name || '',
        amount: investment.amount?.toString() || '',
        // Investment data'dan tüm alanları yükle
        ...investment.data || {},
        // Details'den de tüm alanları yükle
        ...investment.details || {},
        // Yatırım türüne özel alanları kontrol et ve güvenli yükle
        ...(investment.type === 'stock' && {
          stockPicker: investment.data?.stockPicker || investment.details?.stockPicker || null,
          lotCount: (investment.data?.lotCount || investment.details?.lotCount || '').toString(),
          pricePerLot: (investment.data?.pricePerLot || investment.details?.pricePerLot || '').toString(),
          currentPricePerLot: (investment.data?.currentPricePerLot || investment.details?.currentPricePerLot || investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'crypto' && {
          cryptoPicker: investment.data?.cryptoPicker || investment.details?.cryptoPicker || null,
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'gold' && {
          goldPicker: investment.data?.goldPicker || investment.details?.goldPicker || null,
          weight: (investment.data?.weight || investment.details?.weight || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'fund' && {
          fundPicker: investment.data?.fundPicker || investment.details?.fundPicker || null,
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          purchasePrice: (investment.data?.purchasePrice || investment.details?.purchasePrice || '').toString(),
          currentPrice: (investment.data?.currentPrice || investment.details?.currentPrice || '').toString()
        }),
        ...(investment.type === 'deposit' && {
          name: investment.data?.name || investment.details?.name || investment.name || '',
          amount: (investment.data?.amount || investment.details?.amount || investment.amount || '').toString(),
          interestRate: (investment.data?.interestRate || investment.details?.interestRate || '').toString(),
          startDate: investment.data?.startDate || investment.details?.startDate || '',
          termMonths: (investment.data?.termMonths || investment.details?.termMonths || '').toString(),
          interestType: investment.data?.interestType || investment.details?.interestType || 'simple'
        })
      };
      
      console.log('🔄 New form data loaded:', newFormData);
      setFormData(newFormData);
    }
  }, [investment]);

  // Calculate investment preview
  const calculations = useMemo(() => {
    if (!investmentType || !investmentTypes[investmentType]) return null;
    
    const typeConfig = investmentTypes[investmentType];
    // Market data'yı calculation'a geç (şimdilik null, gerçek entegrasyon sonra yapılacak)
    return typeConfig.calculate(formData, investment?.purchaseDate, null, null);
  }, [investmentType, formData, investment?.purchaseDate]);

  const handleInputChange = async (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Kripto para seçildiğinde otomatik olarak güncel fiyatı getir
    if (key === 'cryptoPicker' && value && value.id) {
      console.log('Kripto para seçildi:', value);
      try {
        const { default: marketDataService } = await import('../services/marketData');
        console.log('MarketDataService yüklendi, fiyat alınıyor...');
        const cryptoPrices = await marketDataService.getCryptoPrices([value.id]);
        const livePrice = cryptoPrices[value.id];
        console.log('Canlı kripto fiyatı:', livePrice);
        
        if (livePrice && livePrice.price) {
          console.log('Fiyat güncelleniyor:', livePrice.price);
          setFormData(prev => ({ 
            ...prev, 
            [key]: value,
            currentPrice: livePrice.price.toString()
          }));
          console.log('Form data güncellendi');
        } else {
          console.log('Canlı fiyat bulunamadı, fallback kullanılıyor');
          // Fallback: Değeri koru ama 0 yapma
          setFormData(prev => ({ 
            ...prev, 
            [key]: value
          }));
        }
      } catch (error) {
        console.error('Canlı kripto fiyatı alınamadı:', error);
        // Hata durumunda sadece asset'i set et, çökme
        setFormData(prev => ({ 
          ...prev, 
          [key]: value
        }));
      }
    }
    
    // Altın seçildiğinde otomatik olarak güncel fiyatı getir
    if (key === 'goldPicker' && value && value.id) {
      try {
        const { default: marketDataService } = await import('../services/marketData');
        const goldPrices = await marketDataService.getGoldPrices();
        const livePrice = goldPrices[value.type || value.id];
        
        if (livePrice && livePrice.price) {
          setFormData(prev => ({ 
            ...prev, 
            [key]: value,
            currentPrice: livePrice.price.toString()
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            [key]: value
          }));
        }
      } catch (error) {
        console.error('Canlı altın fiyatı alınamadı:', error);
        setFormData(prev => ({ 
          ...prev, 
          [key]: value
        }));
      }
    }
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

    // Calculate correct investment amount based on type
    let calculatedAmount = parseFloat(formData.amount) || 0;
    
    // Her yatırım türü için doğru tutarı hesapla
    if (investmentTypes[investmentType] && investmentTypes[investmentType].calculate) {
      try {
        const calc = investmentTypes[investmentType].calculate(formData, null, calculatedAmount);
        calculatedAmount = calc.totalInvested || calculatedAmount;
      } catch (error) {
        console.error(`Error calculating amount for ${investmentType}:`, error);
        // Fallback: use form amount or calculated values
        if (investmentType === 'stock') {
          const lotCount = parseFloat(formData.lotCount) || 0;
          const pricePerLot = parseFloat(formData.pricePerLot) || 0;
          calculatedAmount = lotCount * pricePerLot;
        } else if (investmentType === 'crypto') {
          const amount = parseFloat(formData.amount) || 0;
          const purchasePrice = parseFloat(formData.purchasePrice) || 0;
          calculatedAmount = amount * purchasePrice;
        } else if (investmentType === 'gold') {
          const weight = parseFloat(formData.weight) || 0;
          const purchasePrice = parseFloat(formData.purchasePrice) || 0;
          calculatedAmount = weight * purchasePrice;
        }
      }
    }

    // Create investment name based on type and data
    let investmentName = formData.name;
    if (!investmentName) {
      if (investmentType === 'deposit') {
        investmentName = `${typeConfig.name} - ₺${calculatedAmount.toLocaleString('tr-TR')}`;
      } else if (investmentType === 'stock') {
        const stockInfo = formData.stockPicker;
        const stockName = stockInfo?.name || stockInfo?.symbol || 'Hisse Senedi';
        investmentName = `${stockName} - ${formData.lotCount || 0} lot`;
      } else if (investmentType === 'fund') {
        const fundInfo = formData.fundPicker;
        const fundName = fundInfo?.name || fundInfo?.symbol || 'Yatırım Fonu';
        investmentName = `${fundName} - ₺${calculatedAmount.toLocaleString('tr-TR')}`;
      } else if (investmentType === 'crypto') {
        const cryptoInfo = formData.cryptoPicker;
        const cryptoName = cryptoInfo?.name || cryptoInfo?.symbol || 'Kripto Para';
        investmentName = `${cryptoName} - ${formData.amount || 0} ${cryptoInfo?.symbol || 'COIN'}`;
      } else if (investmentType === 'gold') {
        const goldInfo = formData.goldPicker;
        const goldName = goldInfo?.name || 'Altın';
        investmentName = `${goldName} - ${formData.weight || 0} gram`;
      } else {
        investmentName = typeConfig.name;
      }
    }

    const investmentData = {
      type: investmentType,
      name: investmentName,
      amount: calculatedAmount,
      data: formData,
      details: formData
    };

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
                
                {field.type === 'stockpicker' ? (
                  <AssetPicker
                    assetType="stock"
                    value={formData[field.key]}
                    onChange={(stockData) => handleInputChange(field.key, stockData)}
                    placeholder={field.placeholder || 'Hisse senedi seçin...'}
                  />
                ) : field.type === 'fundpicker' ? (
                  <AssetPicker
                    assetType="fund"
                    value={formData[field.key]}
                    onChange={(fundData) => handleInputChange(field.key, fundData)}
                    placeholder={field.placeholder || 'Yatırım fonu seçin...'}
                  />
                ) : field.type === 'cryptopicker' ? (
                  <AssetPicker
                    assetType="crypto"
                    value={formData[field.key]}
                    onChange={(cryptoData) => handleInputChange(field.key, cryptoData)}
                    placeholder={field.placeholder || 'Kripto para seçin...'}
                  />
                ) : field.type === 'goldpicker' ? (
                  <AssetPicker
                    assetType="gold"
                    value={formData[field.key]}
                    onChange={(goldData) => handleInputChange(field.key, goldData)}
                    placeholder={field.placeholder || 'Altın varlığı seçin...'}
                  />
                ) : field.type === 'assetpicker' ? (
                  <AssetPicker
                    assetType={field.assetType}
                    value={formData[field.key]}
                    onChange={(assetData) => handleInputChange(field.key, assetData)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'select' ? (
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
                  {calculations.maturityValue && (
                    <div>
                      <span className="text-blue-700 font-medium">Vade Sonu:</span>
                      <div className="text-blue-900 font-semibold">
                        ₺{calculations.maturityValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
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
