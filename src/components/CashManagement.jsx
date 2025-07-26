import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import SavingsSettings from './SavingsSettings';
import { investmentTypes } from './DynamicInvestmentForm';
import { calculateCashManagementData, formatCurrency } from '../utils/calculations';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Target,
  Info,
  Plus,
  Minus,
  CreditCard,
  AlertTriangle,
  Edit,
  Trash2
} from 'lucide-react';

// DebtModal Component
const DebtModal = ({ debt, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: debt?.name || '',
    creditor: debt?.creditor || '',
    totalAmount: debt?.totalAmount || '',
    paidAmount: debt?.paidAmount || '',
    interestRate: debt?.interestRate || '',
    monthlyPayment: debt?.monthlyPayment || '',
    dueDate: debt?.dueDate || '',
    notes: debt?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.creditor || !formData.totalAmount) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    const debtData = {
      id: debt?.id || `debt-${Date.now()}`,
      name: formData.name,
      creditor: formData.creditor,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      interestRate: parseFloat(formData.interestRate) || 0,
      monthlyPayment: parseFloat(formData.monthlyPayment) || 0,
      dueDate: formData.dueDate || null,
      notes: formData.notes,
      createdAt: debt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(debtData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {debt ? 'Borç Düzenle' : 'Yeni Borç Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borç Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Kredi kartı, konut kredisi, vb."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alacaklı *
              </label>
              <input
                type="text"
                value={formData.creditor}
                onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Banka adı, kurum adı, vb."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toplam Borç *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ödenen Tutar
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faiz Oranı (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aylık Ödeme
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyPayment}
                  onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vade Tarihi
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Ek bilgiler, hatırlatmalar, vb."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
              >
                {debt ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CashManagement = () => {
  const { state, actions } = useApp();
  const { transactions = [], users = [] } = state;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [showProjection, setShowProjection] = useState(true);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  // Removed - using direct month/year selection now

  // Calculate cash and investment totals using shared function
  const cashData = useMemo(() => {
    return calculateCashManagementData(state, investmentTypes, selectedMonth, selectedYear, selectedPerson);
  }, [state.transactions, state.investments, selectedMonth, selectedYear, selectedPerson]);

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

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
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
          
          {/* Kişi Seçici */}
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 border border-gray-300"
          >
            <option value="all">Tüm Aile</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
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
          color="green"
        />
        <StatCard
          title="Yatırım Değeri"
          value={cashData.totalInvestmentValue}
          icon={TrendingUp}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          
          <button 
            onClick={() => setShowDebtModal(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
          >
            <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-orange-700 font-medium">Borç Ekle</span>
          </button>
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Borçlar</h2>
          <button
            onClick={() => setShowDebtModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Borç Ekle
          </button>
        </div>
        
        {state.debts && state.debts.length > 0 ? (
          <div className="space-y-3">
            {state.debts.map(debt => {
              const remainingAmount = debt.totalAmount - (debt.paidAmount || 0);
              const progress = ((debt.paidAmount || 0) / debt.totalAmount) * 100;
              
              return (
                <div key={debt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-gray-900">{debt.name}</h3>
                        <p className="text-sm text-gray-500">{debt.creditor}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingDebt(debt);
                          setShowDebtModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu borcu silmek istediğinizden emin misiniz?')) {
                            actions.deleteDebt(debt.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Toplam Borç</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ödenen</p>
                      <p className="font-semibold text-green-600">{formatCurrency(debt.paidAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kalan</p>
                      <p className="font-semibold text-red-600">{formatCurrency(remainingAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Faiz Oranı</p>
                      <p className="font-semibold text-gray-900">%{debt.interestRate || 0}</p>
                    </div>
                  </div>
                  
                  {debt.dueDate && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Vade: {new Date(debt.dueDate).toLocaleDateString('tr-TR')}</span>
                      {new Date(debt.dueDate) < new Date() && (
                        <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                      )}
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>%{progress.toFixed(1)} ödendi</span>
                    <span>{debt.monthlyPayment ? `Aylık: ${formatCurrency(debt.monthlyPayment)}` : ''}</span>
                  </div>
                  
                  {debt.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{debt.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Henüz borç kaydı bulunmuyor</p>
            <p className="text-sm text-gray-400 mb-4">
              Borçlarınızı ekleyerek takip etmeye başlayın
            </p>
            <button
              onClick={() => setShowDebtModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Borcunuzu Ekleyin
            </button>
          </div>
        )}
      </div>

      {/* Debt Modal */}
      {showDebtModal && (
        <DebtModal
          debt={editingDebt}
          onClose={() => {
            setShowDebtModal(false);
            setEditingDebt(null);
          }}
          onSave={(debtData) => {
            if (editingDebt) {
              actions.updateDebt({ ...editingDebt, ...debtData });
            } else {
              actions.addDebt(debtData);
            }
            setShowDebtModal(false);
            setEditingDebt(null);
          }}
        />
      )}
    </div>
  );
};

export default CashManagement;
