import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import SavingsSettings from './SavingsSettings';
import { investmentTypes } from './DynamicInvestmentForm';
import { calculatePortfolioValueDynamic, getTransactionsWithRecurring, formatCurrency } from '../utils/calculations';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showProjection, setShowProjection] = useState(true);

  // Removed - using direct month/year selection now

  // Calculate cash and investment totals
  const cashData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get date range for selected month/year (SIMPLIFIED like Dashboard)
    const getDateRange = () => {
      return {
        start: new Date(selectedYear, selectedMonth, 1),
        end: new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59)
      };
    };

    const { start: startDate, end: endDate } = getDateRange();
    
    // Get transactions with recurring instances for selected period
    const getFilteredTransactions = () => {
      return getTransactionsWithRecurring(state.transactions, startDate, endDate);
    };

    const filteredTransactions = getFilteredTransactions();
    
    // Calculate totals - GÜVENLİ HESAPLAMA
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const netCashFlow = totalIncome - totalExpenses;
    
    // Calculate investment totals using same function as Investments section
    const totalInvestmentValue = calculatePortfolioValueDynamic(state.investments, investmentTypes);
    
    const totalInvestmentCost = state.investments.reduce((sum, inv) => {
      const amount = parseFloat(inv.amount) || 0;
      return sum + amount;
    }, 0);
    
    const investmentGainLoss = totalInvestmentValue - totalInvestmentCost;
    
    // Calculate available cash from ALL transactions (not just current period) - GÜVENLİ HESAPLAMA
    const allTimeIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const allTimeExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const availableCash = Math.max(0, allTimeIncome - allTimeExpenses - totalInvestmentCost);
    
    // Total wealth = available cash + current investment value
    const totalWealth = availableCash + totalInvestmentValue;
    
    // Calculate regular income/expenses for projection - GÜVENLİ HESAPLAMA
    // Check for recurring transactions (either isRecurring=true or has recurring properties)
    const regularIncome = filteredTransactions
      .filter(t => t.type === 'income' && (t.isRecurring || t.recurring?.frequency))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const regularExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && (t.isRecurring || t.recurring?.frequency))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
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
  }, [state.transactions, state.investments, selectedMonth, selectedYear]);

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
              {formatCurrency(value)}
            </p>
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{formatCurrency(Math.abs(trendValue))}</span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 opacity-75" />
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
          <p className="text-gray-600 mt-1">
            {[
              'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ][selectedMonth]} {selectedYear} - Nakit Durumu
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {/* Ay Seçici */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 border border-gray-300"
          >
            {[
              'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ].map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          {/* Yıl Seçici */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 border border-gray-300"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>



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
              <div className="font-semibold">{formatCurrency(cashData.availableCash)}</div>
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
              <div className="font-semibold">{formatCurrency(cashData.totalInvestmentValue)}</div>
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
                +{formatCurrency(cashData.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Gider</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(cashData.totalExpenses)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Net Akış</span>
              <span className={`font-bold text-lg ${cashData.netCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashData.netCashFlow > 0 ? '+' : ''}{formatCurrency(cashData.netCashFlow)}
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
                +{formatCurrency(cashData.regularIncome)}/ay
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Düzenli Gider</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(cashData.regularExpenses)}/ay
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Aylık Net</span>
              <span className={`font-bold ${cashData.monthlyNetRegular > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cashData.monthlyNetRegular > 0 ? '+' : ''}{formatCurrency(cashData.monthlyNetRegular)}/ay
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
              Mevcut Nakit: {formatCurrency(cashData.availableCash)}
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
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-500">Kalan</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(remaining)}
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
          <button 
            onClick={() => actions.setActiveModal('addTransaction', { type: 'income' })}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Gelir Ekle</span>
          </button>
          
          <button 
            onClick={() => actions.setActiveModal('addTransaction', { type: 'expense' })}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            <Minus className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">Gider Ekle</span>
          </button>
          
          <button 
            onClick={() => actions.setActiveModal('addInvestment')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Yatırım Ekle</span>
          </button>
          
          <button 
            onClick={() => actions.setActiveModal('addGoal')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <Target className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Hedef Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;
