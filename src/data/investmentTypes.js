// Investment Types Configuration - Manuel Giriş Sistemi
export const investmentTypes = {
  stock: {
    name: 'Hisse Senedi',
    fields: [
      {
        key: 'stockName',
        label: 'Hisse Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: AKBANK'
      },
      {
        key: 'stockSymbol',
        label: 'Hisse Kodu',
        type: 'text',
        required: true,
        placeholder: 'Örn: AKBNK'
      },
      {
        key: 'lots',
        label: 'Lot Adedi',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '1'
      },
      {
        key: 'purchasePricePerLot',
        label: 'Alış Fiyatı (Lot Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentPricePerLot',
        label: 'Güncel Fiyat (Lot Başına)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData, investment) => {
      // Check if this is a DCA investment with transactions
      if (investment && investment.transactions && investment.transactions.length > 0) {
        // DCA hesaplamaları - güncel fiyatı formData'dan al
        const totalInvested = investment.totalInvested || investment.amount || 0;
        const totalQuantity = investment.totalQuantity || 0;
        const averageCost = investment.averageCost || 0;
        
        // CRITICAL FIX: Güncel fiyatı formData'dan al, sabit değer kullanma!
        const currentPrice = parseFloat(formData.currentPricePerLot) || 0;
        const currentValue = currentPrice * totalQuantity; // Yeniden hesapla!
        
        const gainLoss = currentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
        
        console.log('🔥 STOCK DCA CALCULATE DEBUG (FIXED):');
        console.log('🔥 DCA totalQuantity:', totalQuantity);
        console.log('🔥 DCA averageCost:', averageCost);
        console.log('🔥 DCA totalInvested:', totalInvested);
        console.log('🔥 DCA currentPrice (from form):', currentPrice);
        console.log('🔥 DCA currentValue (recalculated):', currentValue);
        console.log('🔥 DCA gainLoss:', gainLoss);
        console.log('🔥 DCA returnPercentage:', returnPercentage);
        
        return {
          totalInvested,
          currentValue,
          gainLoss,
          returnPercentage,
          units: `${totalQuantity.toFixed(2)} lot`,
          extraInfo: `DCA - Ortalama maliyet: ₺${averageCost.toFixed(4)}`
        };
      }
      
      // Legacy calculation for non-DCA investments
      const lots = parseFloat(formData.lots) || 0;
      const purchasePrice = parseFloat(formData.purchasePricePerLot) || 0;
      const currentPrice = parseFloat(formData.currentPricePerLot) || purchasePrice;
      
      const totalInvested = lots * purchasePrice;
      const currentValue = lots * currentPrice;
      const gainLoss = currentValue - totalInvested;
      const returnPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
      
      // DEBUG: Gerçek zamanlı hesaplama kontrolü
      console.log('🔥 STOCK CALCULATE DEBUG:');
      console.log('🔥 lots:', lots);
      console.log('🔥 purchasePrice:', purchasePrice);
      console.log('🔥 currentPrice:', currentPrice);
      console.log('🔥 totalInvested:', totalInvested);
      console.log('🔥 currentValue:', currentValue);
      console.log('🔥 gainLoss:', gainLoss);
      console.log('🔥 returnPercentage:', returnPercentage);
      
      return {
        totalInvested,
        currentValue,
        gainLoss,
        returnPercentage,
        units: `${lots} lot`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : `Getiri: %${returnPercentage.toFixed(2)}`
      };
    }
  },

  fund: {
    name: 'Yatırım Fonu',
    fields: [
      {
        key: 'fundName',
        label: 'Fon Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Garanti Portföy'
      },
      {
        key: 'fundCode',
        label: 'Fon Kodu',
        type: 'text',
        required: true,
        placeholder: 'GPA, TGT, AFT vs.'
      },
      {
        key: 'units',
        label: 'Pay Adedi',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '0.001'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (Pay Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.0001'
      },
      {
        key: 'currentPrice',
        label: 'Güncel Fiyat (Pay Başına)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.0001'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData, investment) => {
      // Check if this is a DCA investment with transactions
      if (investment && investment.transactions && investment.transactions.length > 0) {
        // DCA hesaplamaları - güncel fiyatı formData'dan al
        const totalInvested = investment.totalInvested || investment.amount || 0;
        const totalQuantity = investment.totalQuantity || 0;
        const averageCost = investment.averageCost || 0;
        
        // CRITICAL FIX: Güncel fiyatı formData'dan al, sabit değer kullanma!
        const currentPrice = parseFloat(formData.currentPrice) || 0;
        const currentValue = currentPrice * totalQuantity; // Yeniden hesapla!
        
        const gainLoss = currentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
        
        console.log('🔥 FUND DCA CALCULATE DEBUG (FIXED):');
        console.log('🔥 DCA totalQuantity:', totalQuantity);
        console.log('🔥 DCA averageCost:', averageCost);
        console.log('🔥 DCA totalInvested:', totalInvested);
        console.log('🔥 DCA currentPrice (from form):', currentPrice);
        console.log('🔥 DCA currentValue (recalculated):', currentValue);
        console.log('🔥 DCA gainLoss:', gainLoss);
        console.log('🔥 DCA returnPercentage:', returnPercentage);
        
        return {
          totalInvested,
          currentValue,
          gainLoss,
          returnPercentage,
          units: `${totalQuantity.toFixed(2)} pay`,
          extraInfo: `DCA - Ortalama maliyet: ₺${averageCost.toFixed(4)}`
        };
      }
      
      // Legacy calculation for non-DCA investments
      const units = parseFloat(formData.units) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentPrice = parseFloat(formData.currentPrice) || purchasePrice;
      
      const totalInvested = units * purchasePrice;
      const currentValue = units * currentPrice;
      const gainLoss = currentValue - totalInvested;
      const returnPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
      
      // DEBUG: Gerçek zamanlı hesaplama kontrolü
      console.log('🔥 FUND CALCULATE DEBUG:');
      console.log('🔥 units:', units);
      console.log('🔥 purchasePrice:', purchasePrice);
      console.log('🔥 currentPrice:', currentPrice);
      console.log('🔥 totalInvested:', totalInvested);
      console.log('🔥 currentValue:', currentValue);
      console.log('🔥 gainLoss:', gainLoss);
      console.log('🔥 returnPercentage:', returnPercentage);
      
      return {
        totalInvested,
        currentValue,
        gainLoss,
        returnPercentage,
        units: `${units} pay`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : `Getiri: %${returnPercentage.toFixed(2)}`
      };
    }
  },

  crypto: {
    name: 'Kripto Para',
    fields: [
      {
        key: 'cryptoName',
        label: 'Kripto Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Bitcoin'
      },
      {
        key: 'cryptoSymbol',
        label: 'Kripto Kodu',
        type: 'text',
        required: true,
        placeholder: 'BTC, ETH, ADA vs.'
      },
      {
        key: 'amount',
        label: 'Miktar',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '0.00000001'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (Birim Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentPrice',
        label: 'Güncel Fiyat (Birim Başına)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const amount = parseFloat(formData.amount) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentPrice = parseFloat(formData.currentPrice) || purchasePrice;
      
      const totalInvested = amount * purchasePrice;
      const currentValue = amount * currentPrice;
      
      return {
        totalInvested,
        currentValue,
        units: `${amount} ${formData.cryptoSymbol || 'coin'}`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : null
      };
    }
  },

  gold: {
    name: 'Altın',
    fields: [
      {
        key: 'goldType',
        label: 'Altın Türü',
        type: 'text',
        required: true,
        placeholder: 'Örn: Gram Altın, Çeyrek Altın'
      },
      {
        key: 'weight',
        label: 'Ağırlık (Gram)',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '0.01'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (Gram Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentPrice',
        label: 'Güncel Fiyat (Gram Başına)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const weight = parseFloat(formData.weight) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentPrice = parseFloat(formData.currentPrice) || purchasePrice;
      
      const totalInvested = weight * purchasePrice;
      const currentValue = weight * currentPrice;
      
      return {
        totalInvested,
        currentValue,
        units: `${weight} gram`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : null
      };
    }
  },

  deposit: {
    name: 'Vadeli Mevduat',
    fields: [
      {
        key: 'bankName',
        label: 'Banka Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Garanti BBVA'
      },
      {
        key: 'amount',
        label: 'Ana Para',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'interestRate',
        label: 'Faiz Oranı (%)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'maturityDate',
        label: 'Vade Tarihi',
        type: 'date',
        required: true
      },
      {
        key: 'currentValue',
        label: 'Güncel Değer',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const amount = parseFloat(formData.amount) || 0;
      const interestRate = parseFloat(formData.interestRate) || 0;
      const currentValue = parseFloat(formData.currentValue) || amount;
      
      // Basit faiz hesaplaması (gerçek hesaplama için vade süresi gerekli)
      const estimatedMaturityValue = amount * (1 + interestRate / 100);
      
      return {
        totalInvested: amount,
        currentValue: currentValue,
        maturityValue: estimatedMaturityValue,
        units: `₺${amount.toLocaleString('tr-TR')} ana para`,
        extraInfo: `%${interestRate} faiz oranı`
      };
    }
  },

  bond: {
    name: 'Tahvil',
    fields: [
      {
        key: 'bondName',
        label: 'Tahvil Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Hazine Bonosu'
      },
      {
        key: 'amount',
        label: 'Nominal Değer',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentPrice',
        label: 'Güncel Fiyat',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'maturityDate',
        label: 'Vade Tarihi',
        type: 'date',
        required: true
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const amount = parseFloat(formData.amount) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentPrice = parseFloat(formData.currentPrice) || purchasePrice;
      
      return {
        totalInvested: purchasePrice,
        currentValue: currentPrice,
        maturityValue: amount,
        units: `₺${amount.toLocaleString('tr-TR')} nominal`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : null
      };
    }
  },

  realestate: {
    name: 'Gayrimenkul',
    fields: [
      {
        key: 'propertyName',
        label: 'Gayrimenkul Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: İstanbul Daire'
      },
      {
        key: 'propertyType',
        label: 'Gayrimenkul Türü',
        type: 'select',
        required: true,
        options: [
          { value: 'apartment', label: 'Daire' },
          { value: 'house', label: 'Müstakil Ev' },
          { value: 'office', label: 'Ofis' },
          { value: 'land', label: 'Arsa' },
          { value: 'other', label: 'Diğer' }
        ]
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentValue',
        label: 'Güncel Değer',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Adres, özellikler vs.'
      }
    ],
    calculate: (formData) => {
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentValue = parseFloat(formData.currentValue) || purchasePrice;
      
      return {
        totalInvested: purchasePrice,
        currentValue: currentValue,
        units: '1 gayrimenkul',
        extraInfo: currentValue === purchasePrice ? 'Güncel değer girilmemiş (kazanç 0)' : null
      };
    }
  },

  commodity: {
    name: 'Emtia',
    fields: [
      {
        key: 'commodityName',
        label: 'Emtia Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Petrol, Buğday'
      },
      {
        key: 'amount',
        label: 'Miktar',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '0.01'
      },
      {
        key: 'unit',
        label: 'Birim',
        type: 'text',
        required: true,
        placeholder: 'kg, ton, varil vs.'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (Birim Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentPrice',
        label: 'Güncel Fiyat (Birim Başına)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.01'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const amount = parseFloat(formData.amount) || 0;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentPrice = parseFloat(formData.currentPrice) || purchasePrice;
      
      const totalInvested = amount * purchasePrice;
      const currentValue = amount * currentPrice;
      
      return {
        totalInvested,
        currentValue,
        units: `${amount} ${formData.unit || 'birim'}`,
        extraInfo: currentPrice === purchasePrice ? 'Güncel fiyat girilmemiş (kazanç 0)' : null
      };
    }
  },

  forex: {
    name: 'Döviz',
    fields: [
      {
        key: 'currencyName',
        label: 'Döviz Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Amerikan Doları'
      },
      {
        key: 'currencyCode',
        label: 'Döviz Kodu',
        type: 'text',
        required: true,
        placeholder: 'USD, EUR, GBP vs.'
      },
      {
        key: 'amount',
        label: 'Miktar',
        type: 'number',
        required: true,
        placeholder: '0',
        min: '0',
        step: '0.01'
      },
      {
        key: 'purchaseRate',
        label: 'Alış Kuru (TL)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.0001'
      },
      {
        key: 'currentRate',
        label: 'Güncel Kur (TL)',
        type: 'number',
        required: false,
        placeholder: 'Manuel giriniz',
        min: '0',
        step: '0.0001'
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Ek bilgiler...'
      }
    ],
    calculate: (formData) => {
      const amount = parseFloat(formData.amount) || 0;
      const purchaseRate = parseFloat(formData.purchaseRate) || 0;
      const currentRate = parseFloat(formData.currentRate) || purchaseRate;
      
      const totalInvested = amount * purchaseRate;
      const currentValue = amount * currentRate;
      
      return {
        totalInvested,
        currentValue,
        units: `${amount} ${formData.currencyCode || 'döviz'}`,
        extraInfo: currentRate === purchaseRate ? 'Güncel kur girilmemiş (kazanç 0)' : null
      };
    }
  },

  machinery: {
    name: 'Makine',
    fields: [
      {
        key: 'machineName',
        label: 'Makine Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: CNC Tezgahı, Forklift'
      },
      {
        key: 'brand',
        label: 'Marka/Model',
        type: 'text',
        required: false,
        placeholder: 'Örn: Siemens, Caterpillar'
      },
      {
        key: 'serialNumber',
        label: 'Seri Numarası',
        type: 'text',
        required: false,
        placeholder: 'Makine seri numarası'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (TL)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentValue',
        label: 'Güncel Değer (TL)',
        type: 'number',
        required: false,
        placeholder: 'Tahmini güncel değer',
        min: '0',
        step: '0.01'
      },
      {
        key: 'purchaseDate',
        label: 'Satın Alma Tarihi',
        type: 'date',
        required: false
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Teknik özellikler, bakım durumu vs.'
      }
    ],
    calculate: (formData) => {
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentValue = parseFloat(formData.currentValue) || purchasePrice;
      
      return {
        totalInvested: purchasePrice,
        currentValue: currentValue,
        units: '1 makine',
        extraInfo: currentValue === purchasePrice ? 'Güncel değer girilmemiş (amortisman hesaplanmamış)' : null
      };
    }
  },

  equipment: {
    name: 'Ekipman',
    fields: [
      {
        key: 'equipmentName',
        label: 'Ekipman Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: Laptop, Kamera, Ses Sistemi'
      },
      {
        key: 'brand',
        label: 'Marka/Model',
        type: 'text',
        required: false,
        placeholder: 'Örn: Apple MacBook Pro, Canon EOS'
      },
      {
        key: 'category',
        label: 'Kategori',
        type: 'text',
        required: false,
        placeholder: 'Örn: Bilgisayar, Fotoğraf, Müzik'
      },
      {
        key: 'quantity',
        label: 'Adet',
        type: 'number',
        required: true,
        placeholder: '1',
        min: '1',
        step: '1'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (Adet Başına)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentValue',
        label: 'Güncel Değer (Adet Başına)',
        type: 'number',
        required: false,
        placeholder: 'Tahmini güncel değer',
        min: '0',
        step: '0.01'
      },
      {
        key: 'purchaseDate',
        label: 'Satın Alma Tarihi',
        type: 'date',
        required: false
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Özellikler, garanti durumu vs.'
      }
    ],
    calculate: (formData) => {
      const quantity = parseFloat(formData.quantity) || 1;
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentValue = parseFloat(formData.currentValue) || purchasePrice;
      
      const totalInvested = quantity * purchasePrice;
      const totalCurrentValue = quantity * currentValue;
      
      return {
        totalInvested,
        currentValue: totalCurrentValue,
        units: `${quantity} adet`,
        extraInfo: currentValue === purchasePrice ? 'Güncel değer girilmemiş (amortisman hesaplanmamış)' : null
      };
    }
  },

  vehicle: {
    name: 'Araç',
    fields: [
      {
        key: 'vehicleName',
        label: 'Araç Adı',
        type: 'text',
        required: true,
        placeholder: 'Örn: BMW 320i, Ford Transit'
      },
      {
        key: 'brand',
        label: 'Marka',
        type: 'text',
        required: false,
        placeholder: 'Örn: BMW, Ford, Mercedes'
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        required: false,
        placeholder: 'Örn: 320i, Transit, C200'
      },
      {
        key: 'year',
        label: 'Model Yılı',
        type: 'number',
        required: false,
        placeholder: '2020',
        min: '1900',
        max: '2030'
      },
      {
        key: 'plateNumber',
        label: 'Plaka',
        type: 'text',
        required: false,
        placeholder: '34 ABC 123'
      },
      {
        key: 'purchasePrice',
        label: 'Alış Fiyatı (TL)',
        type: 'number',
        required: true,
        placeholder: '0.00',
        min: '0',
        step: '0.01'
      },
      {
        key: 'currentValue',
        label: 'Güncel Değer (TL)',
        type: 'number',
        required: false,
        placeholder: 'Tahmini güncel değer',
        min: '0',
        step: '0.01'
      },
      {
        key: 'mileage',
        label: 'Kilometre',
        type: 'number',
        required: false,
        placeholder: '0',
        min: '0',
        step: '1'
      },
      {
        key: 'purchaseDate',
        label: 'Satın Alma Tarihi',
        type: 'date',
        required: false
      },
      {
        key: 'notes',
        label: 'Notlar',
        type: 'textarea',
        required: false,
        placeholder: 'Renk, özellikler, hasar durumu vs.'
      }
    ],
    calculate: (formData) => {
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const currentValue = parseFloat(formData.currentValue) || purchasePrice;
      
      return {
        totalInvested: purchasePrice,
        currentValue: currentValue,
        units: '1 araç',
        extraInfo: currentValue === purchasePrice ? 'Güncel değer girilmemiş (amortisman hesaplanmamış)' : null
      };
    }
  }
};

export default investmentTypes;
