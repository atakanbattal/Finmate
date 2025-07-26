import React, { useMemo } from 'react';
import { X, Edit2, Calendar, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import { investmentTypes } from './DynamicInvestmentForm';

const InvestmentDetailModal = ({ investment, onClose, onEdit }) => {
  // Calculate investment metrics
  const metrics = useMemo(() => {
    if (!investment) return null;

    const investedAmount = parseFloat(investment.amount) || 0;
    let currentValue = investedAmount;
    let totalInvested = investedAmount;
    let gain = 0;
    let gainPercentage = 0;
    let extraInfo = '';

    try {
      // Dynamic calculation if available
      if (investment.type && investment.data && investmentTypes[investment.type]) {
        try {
          const dynamicCalc = investmentTypes[investment.type].calculate(
            investment.data, 
            investment.purchaseDate, 
            investedAmount
          );
          
          if (dynamicCalc && typeof dynamicCalc.currentValue === 'number' && !isNaN(dynamicCalc.currentValue)) {
            currentValue = dynamicCalc.currentValue;
            extraInfo = dynamicCalc.extraInfo || '';
          }
          
          if (dynamicCalc && dynamicCalc.totalInvested && !isNaN(dynamicCalc.totalInvested)) {
            totalInvested = dynamicCalc.totalInvested;
          }
        } catch (calcError) {
          console.warn(`Dynamic calculation failed for ${investment.type}:`, calcError);
          if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
            currentValue = parseFloat(investment.currentValue);
          }
        }
      } else if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
        currentValue = parseFloat(investment.currentValue);
      }
      
      gain = currentValue - totalInvested;
      gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
    } catch (error) {
      console.error('Error calculating investment metrics:', error);
    }

    return {
      investedAmount: totalInvested,
      currentValue,
      gain,
      gainPercentage,
      extraInfo
    };
  }, [investment]);

  if (!investment || !metrics) return null;

  // Get investment type name
  const getInvestmentTypeName = (type) => {
    const typeNames = {
      'deposit': 'Vadeli Mevduat',
      'stock': 'Hisse Senedi',
      'crypto': 'Kripto Para',
      'gold': 'Altın',
      'forex': 'Döviz',
      'real_estate': 'Gayrimenkul',
      'fund': 'Yatırım Fonu'
    };
    return typeNames[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const displayName = investment.name || `${getInvestmentTypeName(investment.type)} - ${formatCurrency(investment.amount)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-lg">
                {getInvestmentTypeName(investment.type).charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">{getInvestmentTypeName(investment.type)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Yatırılan Tutar</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {formatCurrency(metrics.investedAmount)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Güncel Değer</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {formatCurrency(metrics.currentValue)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className={`${
              metrics.gain >= 0 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            } border rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    metrics.gain >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    Kar/Zarar
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    metrics.gain >= 0 ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {metrics.gain >= 0 ? '+' : ''}{formatCurrency(metrics.gain)}
                  </p>
                  <p className={`text-sm ${
                    metrics.gain >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {metrics.gainPercentage >= 0 ? '+' : ''}{metrics.gainPercentage.toFixed(2)}%
                  </p>
                </div>
                {metrics.gain >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yatırım Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Satın Alma Tarihi</p>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {investment.purchaseDate}
                </p>
              </div>
              
              {investment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Notlar</p>
                  <p className="text-gray-900">{investment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Type-specific Details */}
          {investment.data && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teknik Detaylar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {investment.type === 'stock' && (
                  <>
                    {investment.data.stockPicker && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Hisse Senedi</p>
                        <p className="text-gray-900">{investment.data.stockPicker.name} ({investment.data.stockPicker.symbol})</p>
                      </div>
                    )}
                    {investment.data.lotCount && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Lot Adedi</p>
                        <p className="text-gray-900">{investment.data.lotCount}</p>
                      </div>
                    )}
                    {investment.data.pricePerLot && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Alış Fiyatı (₺/lot)</p>
                        <p className="text-gray-900">{formatCurrency(parseFloat(investment.data.pricePerLot))}</p>
                      </div>
                    )}
                    {investment.data.currentPricePerLot && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Güncel Fiyat (₺/lot)</p>
                        <p className="text-gray-900">{formatCurrency(parseFloat(investment.data.currentPricePerLot))}</p>
                      </div>
                    )}
                  </>
                )}

                {investment.type === 'fund' && (
                  <>
                    {investment.data.fundPicker && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Yatırım Fonu</p>
                        <p className="text-gray-900">{investment.data.fundPicker.name} ({investment.data.fundPicker.symbol})</p>
                      </div>
                    )}
                    {investment.data.purchasePrice && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Alış Fiyatı</p>
                        <p className="text-gray-900">{formatCurrency(parseFloat(investment.data.purchasePrice))}</p>
                      </div>
                    )}
                    {investment.data.currentPrice && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Güncel Fiyat</p>
                        <p className="text-gray-900">{formatCurrency(parseFloat(investment.data.currentPrice))}</p>
                      </div>
                    )}
                  </>
                )}

                {investment.type === 'deposit' && (
                  <>
                    {investment.data.interestRate && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Faiz Oranı</p>
                        <p className="text-gray-900">%{investment.data.interestRate}</p>
                      </div>
                    )}
                    {investment.data.termMonths && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Vade (Ay)</p>
                        <p className="text-gray-900">{investment.data.termMonths} ay</p>
                      </div>
                    )}
                    {investment.data.startDate && (
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Başlangıç Tarihi</p>
                        <p className="text-gray-900">{investment.data.startDate}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Extra Info */}
          {metrics.extraInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Ek Bilgi</p>
                  <p className="text-sm text-blue-700">{metrics.extraInfo}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Düzenle
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetailModal;
