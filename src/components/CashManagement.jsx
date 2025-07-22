import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import SavingsSettings from './SavingsSettings';
import { investmentTypes } from './DynamicInvestmentForm';
import { calculatePortfolioValueDynamic } from '../utils/calculations';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Plus,
  Minus
} from 'lucide-react';

const CashManagement = () => {
  const { state, actions } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [showProjection, setShowProjection] = useState(true);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodLabel, setPeriodLabel] = useState('Bu Ay');

  const handlePeriodSelect = (period, label) => {
    setSelectedPeriod(period);
    setPeriodLabel(label);
  };

  // Calculate cash and investment totals
  const cashData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter transactions based on selected period
    const getFilteredTransactions = () => {
      return state.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        switch (selectedPeriod) {
          case 'thisMonth':
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          case 'lastMonth':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return transactionDate.getMonth() === lastMonth && 
                   transactionDate.getFullYear() === lastMonthYear;
          case 'last3Months':
            const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
            return transactionDate >= threeMonthsAgo;
          case 'thisYear':
            return transactionDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    };

    const filteredTransactions = getFilteredTransactions();
    
    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;
    
    // Calculate investment totals using same function as Investments section
    const totalInvestmentValue = calculatePortfolioValueDynamic(state.investments, investmentTypes);
    
    const totalInvestmentCost = state.investments.reduce((sum, inv) => {
      return sum + inv.amount;
    }, 0);
    
    const investmentGainLoss = totalInvestmentValue - totalInvestmentCost;
    
    // Calculate available cash from ALL transactions (not just current period)
    const allTimeIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const allTimeExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const availableCash = Math.max(0, allTimeIncome - allTimeExpenses - totalInvestmentCost);
    
    // Total wealth = available cash + current investment value
    const totalWealth = availableCash + totalInvestmentValue;
    
    // Calculate regular income/expenses for projection
    const regularIncome = filteredTransactions
      .filter(t => t.type === 'income' && t.isRecurring)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const regularExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.isRecurring)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyNetRegular = regularIncome - regularExpenses;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      availableCash,
      totalInvestmentValue,
      totalInvestmentCost,
      investmentGainLoss,
      totalWealth,
      regularIncome,
      regularExpenses,
      monthlyNetRegular,
      filteredTransactions
    };
  }, [state.transactions, state.investments, selectedPeriod]);

  // Calculate when cash flow will improve
  const cashFlowProjection = useMemo(() => {
    if (cashData.monthlyNetRegular <= 0) return null;
    
    const monthsToComfort = Math.ceil(10000 / cashData.monthlyNetRegular); // Assuming 10k is comfort level
    const comfortDate = new Date();
    comfortDate.setMonth(comfortDate.getMonth() + monthsToComfort);
    
    return {
      monthsToComfort,
      comfortDate,
      monthlyImprovement: cashData.monthlyNetRegular
    };
  }, [cashData.monthlyNetRegular]);

  // Get goals that can use available cash
  const availableGoals = state.goals.filter(goal => !goal.completed);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold mt-1">
              ₺{value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>₺{Math.abs(trendValue).toLocaleString('tr-TR')}</span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 opacity-75" />
        </div>
      </div>
    );
  };

  // Period Selection Modal Component (matching Reports page design)
  const PeriodModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleSelect = (type, value) => {
      if (type === 'month') {
        setSelectedMonth(value);
      } else if (type === 'year') {
        setSelectedYear(value);
      }
    };

    const handleApply = () => {
      const monthKey = `${months[selectedMonth].toLowerCase()}${selectedYear}`;
      onSelect(monthKey, `${months[selectedMonth]} ${selectedYear}`);
      onClose();
    };

    const handleQuickSelect = (range, label) => {
      onSelect(range, label);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Zaman Aralığı Seçin</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Quick Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Hızlı Seçim</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'thisMonth', label: 'Bu Ay' },
                  { key: 'lastMonth', label: 'Geçen Ay' },
                  { key: 'last3Months', label: 'Son 3 Ay' },
                  { key: 'thisYear', label: 'Bu Yıl' },
                  { key: 'all', label: 'Tüm Zamanlar' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => handleQuickSelect(option.key, option.label)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors text-gray-700 font-medium"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Month/Year Selection */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Özel Tarih Seçimi</h4>
              
              {/* Year Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Yıl</label>
                <div className="grid grid-cols-5 gap-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => handleSelect('year', year)}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        selectedYear === year
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Ay</label>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleSelect('month', index)}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        selectedMonth === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Seçilen: <span className="font-medium">{months[selectedMonth]} {selectedYear}</span>
                </div>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nakit Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm nakitinizi ve yatırımlarınızı tek yerden takip edin</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowPeriodModal(true)}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 flex items-center space-x-3 group"
          >
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{periodLabel}</div>
              <div className="text-sm text-gray-500">Periyodu değiştir</div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Period Selection Modal */}
      <PeriodModal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onSelect={handlePeriodSelect}
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Servet"
          value={cashData.totalWealth}
          icon={Wallet}
          color="purple"
        />
        <StatCard
          title="Mevcut Nakit"
          value={cashData.availableCash}
          icon={DollarSign}
          trend={cashData.netCashFlow > 0 ? 'up' : 'down'}
          trendValue={cashData.netCashFlow}
          color="green"
        />
        <StatCard
          title="Yatırım Değeri"
          value={cashData.totalInvestmentValue}
          icon={TrendingUp}
          trend={cashData.investmentGainLoss > 0 ? 'up' : 'down'}
          trendValue={cashData.investmentGainLoss}
          color="blue"
        />
        <StatCard
          title="Net Nakit Akışı"
          value={cashData.netCashFlow}
          icon={cashData.netCashFlow > 0 ? TrendingUp : TrendingDown}
          color={cashData.netCashFlow > 0 ? 'green' : 'red'}
        />
      </div>

      {/* Cash vs Investment Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          Nakit vs Yatırım Dağılımı
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span className="text-gray-700">Mevcut Nakit</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">₺{cashData.availableCash.toLocaleString('tr-TR')}</div>
              <div className="text-sm text-gray-500">
                %{((cashData.availableCash / cashData.totalWealth) * 100).toFixed(1)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span className="text-gray-700">Yatırımlar</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">₺{cashData.totalInvestmentValue.toLocaleString('tr-TR')}</div>
              <div className="text-sm text-gray-500">
                %{((cashData.totalInvestmentValue / cashData.totalWealth) * 100).toFixed(1)}
              </div>
            </div>
          </div>
          
          {/* Visual bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div 
              className="bg-green-500 h-3 rounded-l-full"
              style={{ width: `${(cashData.availableCash / cashData.totalWealth) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Cash Flow */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Aylık Nakit Akışı
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Gelir</span>
              <span className="font-semibold text-green-600">
                +₺{cashData.totalIncome.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Gider</span>
              <span className="font-semibold text-red-600">
                -₺{cashData.totalExpenses.toLocaleString('tr-TR')}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Net Akış</span>
              <span className={`font-bold text-lg ${cashData.netCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashData.netCashFlow > 0 ? '+' : ''}₺{cashData.netCashFlow.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Regular Income/Expense Projection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Düzenli Gelir/Gider Projeksiyonu
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Düzenli Gelir</span>
              <span className="font-semibold text-green-600">
                +₺{cashData.regularIncome.toLocaleString('tr-TR')}/ay
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Düzenli Gider</span>
              <span className="font-semibold text-red-600">
                -₺{cashData.regularExpenses.toLocaleString('tr-TR')}/ay
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Aylık Net</span>
              <span className={`font-bold ${cashData.monthlyNetRegular > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashData.monthlyNetRegular > 0 ? '+' : ''}₺{cashData.monthlyNetRegular.toLocaleString('tr-TR')}/ay
              </span>
            </div>
            
            {cashFlowProjection && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">Projeksiyon</span>
                </div>
                <p className="text-sm text-blue-600">
                  Mevcut düzenli gelir/gider oranınızla {cashFlowProjection.monthsToComfort} ay sonra 
                  ({cashFlowProjection.comfortDate.toLocaleDateString('tr-TR')}) 
                  finansal rahatlığa ulaşabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Birikim Ayarları */}
      <SavingsSettings
        savingsPercentage={state.settings?.savingsPercentage || 30}
        goals={state.goals}
        netCashFlow={cashData.netCashFlow}
        onUpdateSettings={actions.updateSettings}
        onUpdateGoalPriorities={actions.updateGoalPriorities}
      />

      {/* Goals Integration */}
      {availableGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Hedefler ve Mevcut Nakit
          </h2>
          
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-700 font-medium">
              Mevcut Nakit: ₺{cashData.availableCash.toLocaleString('tr-TR')}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Bu miktar hedeflerinize otomatik olarak dağıtılabilir
            </p>
          </div>
          
          <div className="space-y-3">
            {availableGoals.slice(0, 5).map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;
              
              return (
                <div key={goal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{goal.name}</h3>
                      <span className="text-sm text-gray-500">
                        %{progress.toFixed(1)} tamamlandı
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>₺{goal.currentAmount.toLocaleString('tr-TR')}</span>
                      <span>₺{goal.targetAmount.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-500">Kalan</div>
                    <div className="font-semibold text-gray-900">
                      ₺{remaining.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {availableGoals.length > 5 && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              +{availableGoals.length - 5} hedef daha...
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <Plus className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Gelir Ekle</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
            <Minus className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">Gider Ekle</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Yatırım Ekle</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <Target className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Hedef Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;
