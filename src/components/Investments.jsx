import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Trash2,
  DollarSign,
  Calendar,
  Percent,
  Calculator,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import InvestmentDetailModal from './InvestmentDetailModal';
import { createInvestment } from '../types';
import { formatCurrency, calculatePortfolioValueDynamic, calculateInvestmentGainsDynamic } from '../utils/calculations';
import DynamicInvestmentForm, { investmentTypes } from './DynamicInvestmentForm';

const Investments = () => {
  const { state, actions } = useApp();
  const { investments } = state;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [viewingInvestment, setViewingInvestment] = useState(null);

  // Calculate portfolio metrics with improved error handling
  const portfolioMetrics = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;
    let totalGains = 0;
    
    investments.forEach(investment => {
      try {
        const investedAmount = parseFloat(investment.amount) || 0;
        let dynamicCurrentValue = investedAmount; // fallback to invested amount
        
        // Try dynamic calculation first
        if (investment.type && investment.data && investmentTypes && investmentTypes[investment.type]) {
          try {
            const dynamicCalc = investmentTypes[investment.type].calculate(
              investment.data, 
              investment.purchaseDate, 
              investedAmount
            );
            if (dynamicCalc && typeof dynamicCalc.currentValue === 'number' && !isNaN(dynamicCalc.currentValue)) {
              dynamicCurrentValue = dynamicCalc.currentValue;
              // Use totalInvested from calculation if available (more accurate)
              if (dynamicCalc.totalInvested && !isNaN(dynamicCalc.totalInvested)) {
                totalInvested += dynamicCalc.totalInvested;
              } else {
                totalInvested += investedAmount;
              }
            } else {
              totalInvested += investedAmount;
            }
          } catch (calcError) {
            console.warn(`Dynamic calculation failed for ${investment.type}:`, calcError);
            // Use manual currentValue if available
            if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
              dynamicCurrentValue = parseFloat(investment.currentValue);
            }
            totalInvested += investedAmount;
          }
        } else if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
          // Use manual currentValue if no dynamic calculation available
          dynamicCurrentValue = parseFloat(investment.currentValue);
          totalInvested += investedAmount;
        } else {
          // No current value available, use invested amount
          totalInvested += investedAmount;
        }
        
        currentValue += dynamicCurrentValue;
        
      } catch (error) {
        console.error('Error calculating investment metrics:', error);
        // Add invested amount to both values as fallback
        const investedAmount = parseFloat(investment.amount) || 0;
        totalInvested += investedAmount;
        currentValue += investedAmount;
      }
    });
    
    totalGains = currentValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      currentValue,
      totalGains,
      gainPercentage
    };
  }, [investments, investmentTypes]);
  
  const { totalInvested, currentValue, totalGains, gainPercentage } = portfolioMetrics;

  const InvestmentModal = ({ investment, onClose }) => {
    const handleSubmit = (investmentData) => {
      if (investment) {
        actions.updateInvestment({ ...investment, ...investmentData });
      } else {
        actions.addInvestment(createInvestment(investmentData));
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DynamicInvestmentForm
              investment={investment}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yatırım Portföyü</h1>
          <p className="text-gray-600">Tüm yatırımlarınızı takip edin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yatırım
        </button>
      </div>

      {/* Otomatik Güncelleme Durumu */}
      {state.settings.autoUpdateInvestments && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                actions.getAutoUpdateStatus().isRunning ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-blue-800">
                Otomatik Güncelleme: {actions.getAutoUpdateStatus().isRunning ? 'Aktif' : 'Durdurulmuş'}
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {state.settings.lastMarketDataUpdate 
                ? `Son güncelleme: ${new Date(state.settings.lastMarketDataUpdate).toLocaleString('tr-TR')}`
                : 'Henüz güncelleme yapılmadı'
              }
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Yatırım</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Güncel Değer</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(currentValue)}
              </p>
              {/* Debug: Eğer değerler aynıysa uyarı göster */}
              {(() => {
                // Tüm yatırımlar için manuel güncel değer kontrolü
                const hasAnyManualValues = investments.some(inv => 
                  (inv.type === 'stock' && inv.data?.currentPricePerLot > 0) ||
                  (inv.type === 'fund' && inv.data?.currentPrice > 0) ||
                  (inv.type === 'crypto' && inv.data?.currentPrice > 0) ||
                  (inv.type === 'gold' && inv.data?.currentPrice > 0) ||
                  (inv.type === 'deposit') || // Mevduat için hesaplanır
                  (inv.type === 'other' && inv.data?.currentValue > 0)
                );
                
                // Eğer hiç manuel değer girilmemişse ve değerler aynıysa uyarı göster
                const shouldShowWarning = !hasAnyManualValues && Math.abs(totalInvested - currentValue) < 0.01 && totalInvested > 0;
                
                return shouldShowWarning ? (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Güncel değerler girilmemiş
                  </p>
                ) : null;
              })()}
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kazanç/Kayıp</p>
              <p className={`text-2xl font-bold mt-2 ${
                totalGains >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {totalGains >= 0 ? '+' : ''}{formatCurrency(totalGains)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              totalGains >= 0 ? 'bg-success-100' : 'bg-danger-100'
            }`}>
              {totalGains >= 0 ? (
                <TrendingUp className="h-6 w-6 text-success-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-danger-600" />
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Getiri Oranı</p>
              <p className={`text-2xl font-bold mt-2 ${
                gainPercentage >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              gainPercentage >= 0 ? 'bg-success-100' : 'bg-danger-100'
            }`}>
              <Percent className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Yatırımlarım ({investments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {investments.map(investment => {
            // Güvenli yatırım hesaplama
            const investedAmount = parseFloat(investment.amount) || 0;
            let currentValue = investedAmount; // fallback to invested amount
            let totalInvested = investedAmount; // actual invested amount
            let gain = 0;
            
            try {
              // Yatırım türüne göre dinamik hesaplama
              if (investment.type && investment.data && investmentTypes && investmentTypes[investment.type]) {
                try {
                  const dynamicCalc = investmentTypes[investment.type].calculate(
                    investment.data, 
                    investment.purchaseDate, 
                    investedAmount
                  );
                  if (dynamicCalc && typeof dynamicCalc.currentValue === 'number' && !isNaN(dynamicCalc.currentValue)) {
                    currentValue = dynamicCalc.currentValue;
                    // Use more accurate totalInvested from calculation if available
                    if (dynamicCalc.totalInvested && !isNaN(dynamicCalc.totalInvested)) {
                      totalInvested = dynamicCalc.totalInvested;
                    }
                  }
                } catch (calcError) {
                  console.warn(`Dynamic calculation failed for ${investment.type}:`, calcError);
                  // Use manual currentValue if available
                  if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
                    currentValue = parseFloat(investment.currentValue);
                  }
                }
              } else if (investment.currentValue && !isNaN(parseFloat(investment.currentValue))) {
                // Use manual currentValue if no dynamic calculation available
                currentValue = parseFloat(investment.currentValue);
              }
              
              gain = currentValue - totalInvested;
            } catch (error) {
              console.error('Error in individual investment calculation:', error);
              gain = 0;
            }
            
            const gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
            
            // Yatırım türü adını Türkçe'ye çevir
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
            
            // Yatırım adını düzgün formatla
            const displayName = investment.name || `${getInvestmentTypeName(investment.type)} - ${formatCurrency(investment.amount)}`;
            
            return (
              <div 
                key={investment.id} 
                className="p-6 hover:bg-slate-50/50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer"
                onClick={() => setViewingInvestment(investment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Investment Name & Type */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                          <span className="text-slate-600 font-medium text-sm">
                            {getInvestmentTypeName(investment.type).charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg truncate">{displayName}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">{getInvestmentTypeName(investment.type)}</p>
                      </div>
                    </div>
                    
                    {/* Investment Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Yatırılan Tutar</p>
                        <p className="font-medium text-gray-900">{formatCurrency(totalInvested)}</p>
                        {totalInvested !== parseFloat(investment.amount) && (
                          <p className="text-xs text-blue-600">Hesaplanan: {formatCurrency(totalInvested)}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Tarih</p>
                        <p className="font-medium text-gray-700 flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                          {investment.purchaseDate}
                        </p>
                      </div>
                    </div>
                    
                    {/* Debug: Güncel değer durumu */}
                    {(() => {
                      // Manuel güncel değer girilmiş mi kontrol et
                      const hasManualCurrentValue = 
                        (investment.type === 'stock' && investment.data?.currentPricePerLot > 0) ||
                        (investment.type === 'fund' && investment.data?.currentPrice > 0) ||
                        (investment.type === 'crypto' && investment.data?.currentPrice > 0) ||
                        (investment.type === 'gold' && investment.data?.currentPrice > 0) ||
                        (investment.type === 'deposit') || // Mevduat için hesaplanır
                        (investment.type === 'other' && investment.data?.currentValue > 0);
                      
                      // Eğer manuel değer girilmemişse ve güncel değer yatırılan tutara eşitse uyarı göster
                      const shouldShowWarning = !hasManualCurrentValue && Math.abs(currentValue - totalInvested) < 0.01;
                      
                      return shouldShowWarning ? (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <p className="text-yellow-700 font-medium">⚠️ Güncel değer girilmemiş</p>
                          <p className="text-yellow-600 mt-1">Bu yatırımı düzenleyerek güncel değerini girin</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  
                  {/* Value & Gain */}
                  <div className="text-right ml-6 flex-shrink-0">
                    <div className="mb-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(currentValue)}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">Güncel Değer</p>
                    </div>
                    
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      gain >= 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                
                {/* Additional Info & Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {investment.type && investment.data && investmentTypes[investment.type] && (() => {
                      try {
                        const calc = investmentTypes[investment.type].calculate(
                          investment.data, 
                          investment.purchaseDate, 
                          investment.amount
                        );
                        // Vadeli mevduat için vade sonu değerini göster
                        if (investment.type === 'deposit' && calc.maturityValue) {
                          return (
                            <span className="text-gray-600">Vade Sonu: {formatCurrency(calc.maturityValue)}</span>
                          );
                        }
                        return null;
                      } catch (error) {
                        console.error(`Error calculating maturity for ${investment.type}:`, error);
                        return null;
                      }
                    })()}
                    
                    {investment.notes && (
                      <span className="text-gray-600 italic">{investment.notes}</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingInvestment(investment);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.deleteInvestment(investment.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {investments.length === 0 && (
            <div className="p-8 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Henüz yatırım kaydı bulunmuyor</p>
              <p className="text-sm text-gray-400 mb-4">
                Yatırımlarınızı ekleyerek portföyünüzü takip etmeye başlayın
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Yatırımınızı Ekleyin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Investment Distribution by Type */}
      {investments.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yatırım Dağılımı</h3>
          <div className="space-y-3">
            {Object.entries(
              investments.reduce((acc, inv) => {
                // Güvenli dinamik değer hesaplama
                const investedAmount = parseFloat(inv.amount) || 0;
                let dynamicCurrentValue = investedAmount; // fallback
                
                try {
                  if (inv.type && inv.data && investmentTypes && investmentTypes[inv.type]) {
                    try {
                      const dynamicCalc = investmentTypes[inv.type].calculate(
                        inv.data, 
                        inv.purchaseDate, 
                        investedAmount
                      );
                      if (dynamicCalc && typeof dynamicCalc.currentValue === 'number' && !isNaN(dynamicCalc.currentValue)) {
                        dynamicCurrentValue = dynamicCalc.currentValue;
                      }
                    } catch (calcError) {
                      console.warn(`Dynamic calculation failed for ${inv.type}:`, calcError);
                      if (inv.currentValue && !isNaN(parseFloat(inv.currentValue))) {
                        dynamicCurrentValue = parseFloat(inv.currentValue);
                      }
                    }
                  } else if (inv.currentValue && !isNaN(parseFloat(inv.currentValue))) {
                    dynamicCurrentValue = parseFloat(inv.currentValue);
                  }
                } catch (error) {
                  console.error('Error in distribution calculation:', error);
                }
                
                acc[inv.type] = (acc[inv.type] || 0) + dynamicCurrentValue;
                return acc;
              }, {})
            ).map(([type, value]) => {
              const percentage = currentValue > 0 ? (value / currentValue) * 100 : 0;
              
              // Yatırım türü adlarını Türkçe'ye çevir
              const getInvestmentTypeName = (type) => {
                const typeNames = {
                  'stock': 'Hisse Senedi',
                  'crypto': 'Kripto Para',
                  'gold': 'Altın',
                  'deposit': 'Vadeli Mevduat',
                  'fund': 'Yatırım Fonu',
                  'bond': 'Tahvil',
                  'real_estate': 'Gayrimenkul'
                };
                return typeNames[type] || type;
              };
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary-500 rounded"></div>
                    <span className="font-medium text-gray-700">{getInvestmentTypeName(type)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(value)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <InvestmentModal onClose={() => setShowAddModal(false)} />
      )}
      
      {editingInvestment && (
        <InvestmentModal
          investment={editingInvestment}
          onClose={() => setEditingInvestment(null)}
        />
      )}
      
      {viewingInvestment && (
        <InvestmentDetailModal
          investment={viewingInvestment}
          onClose={() => setViewingInvestment(null)}
          onEdit={() => {
            setEditingInvestment(viewingInvestment);
            setViewingInvestment(null);
          }}
        />
      )}
    </div>
  );
};

export default Investments;
