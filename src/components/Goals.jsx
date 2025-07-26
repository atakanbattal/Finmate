import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Target, 
  Edit2, 
  Trash2,
  Calendar,
  CheckCircle,
  Circle,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createGoal, GOAL_CATEGORIES } from '../types';
import { formatCurrency, calculateCashManagementData } from '../utils/calculations';
import { investmentTypes } from './DynamicInvestmentForm';

const Goals = () => {
  const { state, actions } = useApp();
  const { goals } = state;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Filter goals based on current filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return !goal.isCompleted;
    if (filter === 'completed') return goal.isCompleted;
    return true;
  }).sort((a, b) => {
    // Sort by completion status, then by target date
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(a.targetDate) - new Date(b.targetDate);
  });

  const GoalModal = ({ goal, onClose }) => {
    console.log('=== GOAL MODAL RENDER START ===');
    console.log('Goal modal props:', { goal, onClose });
    
    const [useCashAndInvestments, setUseCashAndInvestments] = useState(false);
    
    // Dashboard kartlarından AYNI değerleri kullan - shared calculation function ile (ERROR HANDLING)
    const cashData = useMemo(() => {
      try {
        const currentDate = new Date();
        return calculateCashManagementData(state, investmentTypes, currentDate.getMonth(), currentDate.getFullYear());
      } catch (error) {
        console.error('Error calculating cash management data in Goals:', error);
        // Fallback values to prevent white screen
        return {
          availableCash: 0,
          totalWealth: 0,
          totalInvestmentValue: 0,
          totalInvestmentCost: 0
        };
      }
    }, [state.transactions, state.investments]);
    
    // Dashboard kartlarından gelen değerler
    const availableCash = cashData.availableCash || 0; // "Mevcut Nakit" kartı değeri
    const totalWealth = cashData.totalWealth || 0; // "Toplam Servet" kartı değeri
    
    console.log('Dashboard card values:');
    console.log('Mevcut Nakit (availableCash):', availableCash);
    console.log('Toplam Servet (totalWealth):', totalWealth);
    
    // Kullanıcının talebi: Toplam Servet + Mevcut Nakit kartlarının toplamını kullan
    const availableAmount = useCashAndInvestments ? (totalWealth + availableCash) : availableCash;

    const [formData, setFormData] = useState(
      goal || {
        title: '',
        description: '',
        targetAmount: '',
        currentAmount: goal ? goal.currentAmount : availableAmount.toString(),
        targetDate: '',
        category: 'SAVINGS'
      }
    );

    // Update current amount when cash/investment selection changes
    React.useEffect(() => {
      if (!goal) {
        setFormData(prev => ({
          ...prev,
          currentAmount: availableAmount.toString()
        }));
      }
    }, [availableAmount, goal]);

    const handleSubmit = (e) => {
      console.log('=== GOAL SUBMIT START ===');
      
      try {
        e.preventDefault();
        console.log('Form data before validation:', formData);
        
        if (!formData.title || !formData.targetAmount || !formData.targetDate) {
          console.log('Validation failed - missing required fields');
          alert('Lütfen tüm zorunlu alanları doldurun');
          return;
        }

        const goalData = {
          ...formData,
          targetAmount: parseFloat(formData.targetAmount) || 0,
          currentAmount: parseFloat(formData.currentAmount) || 0
        };

        console.log('Goal data prepared:', goalData);
        console.log('Actions object:', actions);
        console.log('State object:', state);

        if (goal) {
          console.log('=== UPDATING EXISTING GOAL ===');
          console.log('Existing goal:', goal);
          console.log('Update data:', goalData);
          
          if (typeof actions.updateGoal !== 'function') {
            throw new Error('actions.updateGoal is not a function');
          }
          
          actions.updateGoal({ ...goal, ...goalData });
          console.log('Goal update action dispatched');
        } else {
          console.log('=== CREATING NEW GOAL ===');
          
          if (typeof createGoal !== 'function') {
            throw new Error('createGoal is not a function');
          }
          
          const newGoal = createGoal(goalData);
          console.log('New goal created:', newGoal);
          
          if (typeof actions.addGoal !== 'function') {
            throw new Error('actions.addGoal is not a function');
          }
          
          console.log('About to dispatch addGoal action');
          actions.addGoal(newGoal);
          console.log('Goal add action dispatched successfully');
        }
        
        console.log('=== GOAL OPERATION COMPLETED ===');
        console.log('About to close modal');
        
        if (typeof onClose !== 'function') {
          throw new Error('onClose is not a function');
        }
        
        onClose();
        console.log('Modal closed successfully');
        console.log('=== GOAL SUBMIT END ===');
        
      } catch (error) {
        console.error('=== GOAL SUBMIT ERROR ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        console.error('Form data at error:', formData);
        console.error('Actions at error:', actions);
        console.error('State at error:', state);
        
        alert('Hedef kaydedilirken bir hata oluştu: ' + error.message + '. Lütfen tekrar deneyin.');
        // Don't close the modal on error so user can retry
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {goal ? 'Hedefi Düzenle' : 'Yeni Hedef Ekle'}
            </h2>
            
            <form onSubmit={(e) => {
              console.log('=== FORM ONSUBMIT TRIGGERED ===');
              console.log('Form event:', e);
              handleSubmit(e);
            }} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Örn: Acil durum fonu"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Hedef hakkında detaylar..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="select-field"
                >
                  {Object.entries(GOAL_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Tutar (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Funding Source Selection */}
              {!goal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finansman Kaynağı
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fundingSource"
                        checked={!useCashAndInvestments}
                        onChange={() => setUseCashAndInvestments(false)}
                        className="mr-2"
                      />
                      <span className="text-sm">Sadece Nakit (₺{availableCash.toLocaleString('tr-TR')})</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="fundingSource"
                        checked={useCashAndInvestments}
                        onChange={() => setUseCashAndInvestments(true)}
                        className="mr-2"
                      />
                      <span className="text-sm">Toplam Servet + Mevcut Nakit (₺{(totalWealth + availableCash).toLocaleString('tr-TR')})</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Yatırımlarınızı da bu hedef için kullanmayı planlıyorsanız ikinci seçeneği seçin
                  </p>
                </div>
              )}

              {/* Current Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Tutar (₺)
                </label>
                {!goal && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-700 text-sm">
                      <Target className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {useCashAndInvestments 
                          ? `Toplam Kullanılabilir: ₺${(totalWealth + availableCash).toLocaleString('tr-TR')} (Toplam Servet: ₺${totalWealth.toLocaleString('tr-TR')} + Mevcut Nakit: ₺${availableCash.toLocaleString('tr-TR')})`
                          : `Mevcut Nakitiniz: ₺${availableCash.toLocaleString('tr-TR')}`
                        }
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Bu miktar otomatik olarak başlangıç tutarı olarak ayarlandı
                    </p>
                  </div>
                )}
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {goal ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const toggleGoalCompletion = (goal) => {
    actions.updateGoal({
      ...goal,
      isCompleted: !goal.isCompleted,
      currentAmount: goal.isCompleted ? goal.currentAmount : goal.targetAmount
    });
  };

  const updateGoalProgress = (goal, newAmount) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) return;
    
    actions.updateGoal({
      ...goal,
      currentAmount: amount,
      isCompleted: amount >= goal.targetAmount
    });
  };

  // Calculate summary stats
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finansal Hedefler</h1>
          <p className="text-gray-600">Hedeflerinizi belirleyin ve ilerlemenizi takip edin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Hedef
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Hedefler</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeGoals.length}</p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{completedGoals.length}</p>
            </div>
            <div className="p-3 rounded-full bg-success-100">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Hedef</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalTargetAmount)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Genel İlerleme</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {overallProgress.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <Circle className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tümü ({goals.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aktif ({activeGoals.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tamamlanan ({completedGoals.length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => {
          const progress = calculateGoalProgress(goal);
          const isOverdue = new Date(goal.targetDate) < new Date() && !goal.isCompleted;
          
          return (
            <div key={goal.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
              goal.isCompleted 
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start space-x-4">
                    {/* Goal Icon & Completion Toggle */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleGoalCompletion(goal)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                          goal.isCompleted 
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        {goal.isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Target className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    
                    {/* Goal Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-xl font-semibold truncate ${
                          goal.isCompleted ? 'text-emerald-800' : 'text-gray-900'
                        }`}>
                          {goal.title}
                        </h3>
                        
                        {/* Category Badge */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {GOAL_CATEGORIES[goal.category]}
                        </span>
                        
                        {/* Overdue Badge */}
                        {isOverdue && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Gecikmiş
                          </span>
                        )}
                      </div>
                      
                      {goal.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{goal.description}</p>
                      )}
                      
                      {/* Target Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Hedef Tarih: {new Date(goal.targetDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
                          actions.deleteGoal(goal.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">İlerleme Durumu</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      goal.isCompleted ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {progress.toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          goal.isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    {progress > 10 && (
                      <div 
                        className="absolute top-0 left-0 h-full flex items-center px-2 text-xs font-medium text-white"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      >
                        {progress >= 50 && `${progress.toFixed(0)}%`}
                      </div>
                    )}
                  </div>
                  
                  {/* Amount Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Mevcut Tutar</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">Hedef Tutar</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Remaining Amount */}
                  {!goal.isCompleted && (
                    <div className="text-center py-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Kalan Tutar</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                      </p>
                    </div>
                  )}
                  
                  {/* Savings Analysis */}
                  {!goal.isCompleted && (() => {
                    const targetDate = new Date(goal.targetDate);
                    const currentDate = new Date();
                    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
                    const monthsRemaining = Math.max(1, Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24 * 30)));
                    const monthlyNeeded = remainingAmount / monthsRemaining;
                    const isOverdue = targetDate < currentDate;
                    
                    return (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h4 className="font-medium text-gray-700">Birikim Analizi</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Aylık Birikim Gereksinimi</p>
                            <p className={`text-lg font-bold ${
                              isOverdue ? 'text-red-600' : monthlyNeeded > 10000 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {formatCurrency(monthlyNeeded)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Kalan Süre</p>
                            <p className={`text-lg font-bold ${
                              isOverdue ? 'text-red-600' : monthsRemaining <= 3 ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                              {isOverdue ? 'Gecikmiş' : `${monthsRemaining} ay`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Overdue Warning Only */}
                        {isOverdue && (
                          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                            <p><strong>⚠️ Önemli:</strong> Bu hedef gecikmiş durumda. Hedef tarihini güncelleyin veya daha fazla birikim yapın.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Update Progress Input */}
                  {!goal.isCompleted && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Yeni tutar girin"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateGoalProgress(goal, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">Enter ile güncelle</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredGoals.length === 0 && (
          <div className="card p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">
              {filter === 'active' ? 'Aktif hedef bulunmuyor' :
               filter === 'completed' ? 'Tamamlanmış hedef bulunmuyor' :
               'Henüz hedef eklenmemiş'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Finansal hedeflerinizi belirleyerek tasarruf planınızı oluşturun
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Hedefinizi Ekleyin
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <GoalModal onClose={() => setShowAddModal(false)} />
      )}
      
      {editingGoal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
};

export default Goals;
