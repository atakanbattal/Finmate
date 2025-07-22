import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Edit2, 
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  createTransaction, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES, 
  TRANSACTION_TYPES,
  RECURRING_PERIODS 
} from '../types';
import { formatCurrency, filterTransactionsByDate, getTransactionsWithRecurring } from '../utils/calculations';

const Transactions = () => {
  const { state, actions } = useApp();
  const { transactions, users, filters } = state;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Filter transactions based on current filters and search
  let baseTransactions = transactions;
  
  // İlk olarak sadece orijinal işlemleri al (tekrarlayan örnekleri değil)
  const originalTransactions = baseTransactions.filter(t => !t.isRecurringInstance);
  
  // Tekrarlayan işlemleri özetli göster, tek seferlik işlemleri normal göster
  const processedTransactions = originalTransactions.map(transaction => {
    if (transaction.recurring) {
      // Tekrarlayan işlem için özet bilgi oluştur
      const startDate = transaction.date;
      const endDate = transaction.recurringEndDate || 'Süresiz';
      const periodText = {
        'WEEKLY': 'Haftalık',
        'MONTHLY': 'Aylık', 
        'QUARTERLY': 'Üç Aylık',
        'YEARLY': 'Yıllık'
      }[transaction.recurringPeriod] || transaction.recurringPeriod;
      
      return {
        ...transaction,
        displayType: 'recurring-summary',
        summaryInfo: {
          startDate,
          endDate,
          period: periodText,
          isActive: endDate === 'Süresiz' || new Date(endDate) >= new Date()
        }
      };
    }
    return {
      ...transaction,
      displayType: 'single'
    };
  });
  
  const filteredTransactions = processedTransactions.filter(transaction => {
    // Search filter
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // User filter
    if (filters.user !== 'all' && transaction.userId !== filters.user) {
      return false;
    }
    
    // Category filter
    if (filters.category !== 'all' && transaction.category !== filters.category) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Date Filter Modal Component
  const DateFilterModal = ({ isOpen, onClose, onSelect }) => {
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tarih Aralığı Seçin</h3>
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
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Hızlı Seçim</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'thisMonth', label: 'Bu Ay' },
                  { key: 'lastMonth', label: 'Geçen Ay' },
                  { key: 'thisYear', label: 'Bu Yıl' },
                  { key: 'lastYear', label: 'Geçen Yıl' }
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

            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Özel Tarih Seçimi</h4>
              
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

  // User Filter Modal Component
  const UserFilterModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kişi Seçin</h3>
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
            <div className="space-y-3">
              <button
                onClick={() => {
                  onSelect('all', 'Tümü');
                  onClose();
                }}
                className="w-full p-4 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-green-700">Tüm Kişiler</div>
                    <div className="text-sm text-gray-500 group-hover:text-green-600">Herkesi göster</div>
                  </div>
                </div>
              </button>
              
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelect(user.id, user.name);
                    onClose();
                  }}
                  className="w-full p-4 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">{user.name}</div>
                      <div className="text-sm text-gray-500 group-hover:text-green-600">Kişisel işlemler</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category Filter Modal Component
  const CategoryFilterModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const allCategories = { ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kategori Seçin</h3>
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <button
                onClick={() => {
                  onSelect('all', 'Tümü');
                  onClose();
                }}
                className="w-full p-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
              >
                <div className="font-medium text-gray-900 group-hover:text-purple-700">Tüm Kategoriler</div>
                <div className="text-sm text-gray-500 group-hover:text-purple-600">Hepsini göster</div>
              </button>
              
              {Object.values(allCategories).map(category => (
                <button
                  key={category}
                  onClick={() => {
                    onSelect(category, category);
                    onClose();
                  }}
                  className="w-full p-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-purple-700">{category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TransactionModal = ({ transaction, onClose, onSave }) => {
    const [formData, setFormData] = useState(
      transaction || {
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        userId: state.currentUser,
        recurring: false,
        recurringPeriod: 'MONTHLY',
        recurringEndDate: ''
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.amount || !formData.category || !formData.description) {
        alert('Lütfen tüm alanları doldurun');
        return;
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (transaction) {
        actions.updateTransaction({ ...transaction, ...transactionData });
      } else {
        actions.addTransaction(createTransaction(formData.type, transactionData));
      }
      
      onClose();
    };

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {transaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Türü
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      className="mr-2"
                    />
                    <span className="text-success-600">Gelir</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                      className="mr-2"
                    />
                    <span className="text-danger-600">Gider</span>
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
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
                  required
                >
                  <option value="">Kategori seçin</option>
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="İşlem açıklaması"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kişi
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="select-field"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* Recurring Transaction */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Düzenli İşlem</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Bu işlem düzenli olarak tekrarlanacak</p>
              </div>

              {/* Recurring Options */}
              {formData.recurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tekrar Sıklığı
                    </label>
                    <select
                      value={formData.recurringPeriod}
                      onChange={(e) => setFormData({ ...formData, recurringPeriod: e.target.value })}
                      className="select-field"
                    >
                      {Object.entries(RECURRING_PERIODS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bitiş Tarihi (İsteğe Bağlı)
                    </label>
                    <input
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa süresiz devam eder</p>
                  </div>
                </>
              )}

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
                  {transaction ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
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
          <h1 className="text-2xl font-bold text-gray-900">Gelir & Giderler</h1>
          <p className="text-gray-600">Tüm finansal işlemlerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İşlem
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="İşlem ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Date Filter */}
            <button
              onClick={() => setShowDateModal(true)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700 min-w-[140px] justify-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="truncate">
                {(() => {
                  if (filters.dateRange === 'all') return 'Tüm Tarihler';
                  if (filters.dateRange === 'thisMonth') return 'Bu Ay';
                  if (filters.dateRange === 'lastMonth') return 'Geçen Ay';
                  if (filters.dateRange === 'thisYear') return 'Bu Yıl';
                  if (filters.dateRange === 'lastYear') return 'Geçen Yıl';
                  
                  // Özel tarih formatını kontrol et (örn: "ocak2025")
                  const months = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];
                  const monthsCapitalized = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  
                  for (let i = 0; i < months.length; i++) {
                    if (filters.dateRange.toLowerCase().startsWith(months[i])) {
                      const year = filters.dateRange.slice(months[i].length);
                      return `${monthsCapitalized[i]} ${year}`;
                    }
                  }
                  
                  return 'Tarih Seç';
                })()}
              </span>
            </button>

            {/* User Filter */}
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors text-sm font-medium text-gray-700 hover:text-green-700 min-w-[140px] justify-center"
            >
              <User className="h-4 w-4 mr-2" />
              <span className="truncate">
                {filters.user === 'all' ? 'Tüm Kişiler' : 
                 users.find(u => u.id === filters.user)?.name || 'Kişi Seç'}
              </span>
            </button>

            {/* Category Filter */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700 hover:text-purple-700 min-w-[140px] justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="truncate">
                {filters.category === 'all' ? 'Tüm Kategoriler' : filters.category}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            İşlemler ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map(transaction => {
            const user = users.find(u => u.id === transaction.userId);
            
            // Tekrarlayan işlem özeti için profesyonel görünüm
            if (transaction.displayType === 'recurring-summary') {
              const formatDateRange = (start, end) => {
                const startDate = new Date(start).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
                const endDate = end === 'Süresiz' ? 'Süresiz' : new Date(end).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
                return `${startDate} - ${endDate}`;
              };
              
              return (
                <div key={transaction.id} className="p-5 hover:bg-gray-50 border border-gray-200 rounded-lg mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{transaction.description}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.summaryInfo.isActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {transaction.summaryInfo.period} {!transaction.summaryInfo.isActive && '(Bitti)'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{transaction.category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateRange(transaction.summaryInfo.startDate, transaction.summaryInfo.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {transaction.summaryInfo.period === 'Haftalık' && 'Her hafta'}
                              {transaction.summaryInfo.period === 'Aylık' && 'Her ay'}
                              {transaction.summaryInfo.period === 'Üç Aylık' && 'Her 3 ayda'}
                              {transaction.summaryInfo.period === 'Yıllık' && 'Her yıl'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{user?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.summaryInfo.period}</p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bu tekrarlayan işlemi silmek istediğinizden emin misiniz?')) {
                              actions.deleteTransaction(transaction.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Normal tek seferlik işlem profesyonel görünümü
            return (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="font-medium">{transaction.category}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(transaction.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{user?.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
                            // Tekrarlayan işlem örneği ise parent'ı sil, değilse kendisini sil
                            const idToDelete = transaction.isRecurringInstance 
                              ? transaction.parentRecurringId 
                              : transaction.id;
                            actions.deleteTransaction(idToDelete);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">Henüz işlem kaydı bulunmuyor</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk İşleminizi Ekleyin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={() => setShowAddModal(false)}
        />
      )}
      
      {editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={() => setEditingTransaction(null)}
        />
      )}

      {/* Filter Modals */}
      <DateFilterModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelect={(key, label) => {
          actions.setFilters({ dateRange: key });
        }}
      />

      <UserFilterModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSelect={(key, label) => {
          actions.setFilters({ user: key });
        }}
      />

      <CategoryFilterModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(key, label) => {
          actions.setFilters({ category: key });
        }}
      />
    </div>
  );
};

export default Transactions;
