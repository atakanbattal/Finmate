import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatCurrency, 
  getMonthlyData, 
  getCategoryTotals,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavingsRate,
  getTransactionsWithRecurring
} from '../utils/calculations';

const Reports = () => {
  const { state } = useApp();
  const { transactions, users } = state;
  
  const [reportType, setReportType] = useState('overview'); // 'overview', 'income', 'expenses', 'trends'
  const [timeRange, setTimeRange] = useState('thisYear');
  const [selectedUser, setSelectedUser] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRangeLabel, setDateRangeLabel] = useState('Bu Yıl');
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [reportTypeLabel, setReportTypeLabel] = useState('Genel Bakış');
  const [userLabel, setUserLabel] = useState('Tümü');

  const handleDateRangeSelect = (range, label) => {
    setTimeRange(range);
    setDateRangeLabel(label);
  };

  const handleReportTypeSelect = (type, label) => {
    setReportType(type);
    setReportTypeLabel(label);
  };

  const handleUserSelect = (user, label) => {
    setSelectedUser(user);
    setUserLabel(label);
  };

  // Get date range for filtering (STANDARDIZED)
  const getDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    switch (timeRange) {
      case 'thisMonth':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
      case 'lastMonth':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0, 23, 59, 59)
        };
      case 'last3Months':
        return {
          start: new Date(currentYear, currentMonth - 2, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
      case 'last6Months':
        return {
          start: new Date(currentYear, currentMonth - 5, 1),
          end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        };
      case 'thisYear':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31, 23, 59, 59)
        };
      case 'lastYear':
        return {
          start: new Date(currentYear - 1, 0, 1),
          end: new Date(currentYear - 1, 11, 31, 23, 59, 59)
        };
      case 'all':
        return {
          start: new Date(2020, 0, 1),
          end: new Date(currentYear + 1, 11, 31, 23, 59, 59)
        };
      default:
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31, 23, 59, 59)
        };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();
  
  // Get transactions with recurring instances
  const allTransactions = getTransactionsWithRecurring(transactions, startDate, endDate);
  
  // Filter data based on selections
  const filteredTransactions = allTransactions.filter(transaction => {
    if (selectedUser !== 'all' && transaction.userId !== selectedUser) {
      return false;
    }
    return true;
  });

  // Calculate metrics with date range
  const totalIncome = calculateTotalIncome(filteredTransactions, { startDate, endDate });
  const totalExpenses = calculateTotalExpenses(filteredTransactions, { startDate, endDate });
  const netCashFlow = calculateNetCashFlow(filteredTransactions, { startDate, endDate });
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  // Get monthly data for charts
  const monthlyData = getMonthlyData(filteredTransactions);
  
  // Get category data
  const incomeCategories = getCategoryTotals(filteredTransactions.filter(t => t.type === 'income'), 'income');
  const expenseCategories = getCategoryTotals(filteredTransactions.filter(t => t.type === 'expense'), 'expense');

  // Colors for charts
  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // Modern Date Picker Modal Component
  const DatePickerModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
                  { key: 'last6Months', label: 'Son 6 Ay' },
                  { key: 'thisYear', label: 'Bu Yıl' },
                  { key: 'lastYear', label: 'Geçen Yıl' },
                  { key: 'all', label: 'Tümü' }
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

  // Report Type Modal Component
  const ReportTypeModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const reportTypes = [
      { key: 'overview', label: 'Genel Bakış', icon: '📊', desc: 'Tüm finansal verilerin özeti' },
      { key: 'income', label: 'Gelir Analizi', icon: '💰', desc: 'Gelir kaynakları ve trendleri' },
      { key: 'expenses', label: 'Gider Analizi', icon: '💸', desc: 'Harcama kategorileri ve analizi' },
      { key: 'trends', label: 'Trend Analizi', icon: '📈', desc: 'Zaman içindeki değişimler' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rapor Türü Seçin</h3>
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
              {reportTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => {
                    onSelect(type.key, type.label);
                    onClose();
                  }}
                  className="w-full p-4 bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">{type.label}</div>
                      <div className="text-sm text-gray-500 group-hover:text-green-600">{type.desc}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Filter Modal Component
  const UserModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const userOptions = [
      { key: 'all', label: 'Tümü', icon: '👥', desc: 'Tüm kullanıcıların verileri' },
      ...users.map(user => ({
        key: user.id,
        label: user.name,
        icon: '👤',
        desc: `${user.name} kullanıcısının verileri`
      }))
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kullanıcı Seçin</h3>
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
              {userOptions.map(user => (
                <button
                  key={user.key}
                  onClick={() => {
                    onSelect(user.key, user.label);
                    onClose();
                  }}
                  className="w-full p-4 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{user.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-purple-700">{user.label}</div>
                      <div className="text-sm text-gray-500 group-hover:text-purple-600">{user.desc}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const OverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-success-600 mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
              <p className="text-2xl font-bold text-danger-600 mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-danger-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Nakit Akışı</p>
              <p className={`text-2xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Birikim Oranı</p>
              <p className={`text-2xl font-bold mt-2 ${savingsRate >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={savingsRate >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${Math.max(0, Math.min(100, Math.abs(savingsRate)))}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Nakit Akışı</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₺${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Gelir" />
            <Bar dataKey="expenses" fill="#ef4444" name="Gider" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelir Kategorileri</h3>
          {incomeCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incomeCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {incomeCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Gelir verisi bulunmuyor</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gider Kategorileri</h3>
          {expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Gider verisi bulunmuyor</p>
          )}
        </div>
      </div>
    </div>
  );

  const TrendsReport = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nakit Akışı Trendi</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₺${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Gelir"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Gider"
            />
            <Line 
              type="monotone" 
              dataKey="netFlow" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              name="Net Akış"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Yüksek Gelir Kategorileri</h3>
          <div className="space-y-3">
            {incomeCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700">{category.category}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(category.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Yüksek Gider Kategorileri</h3>
          <div className="space-y-3">
            {expenseCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700">{category.category}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(category.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const exportReport = () => {
    const reportData = {
      summary: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        savingsRate
      },
      monthlyData,
      incomeCategories,
      expenseCategories,
      generatedAt: new Date().toISOString(),
      filters: {
        timeRange,
        selectedUser: selectedUser === 'all' ? 'Tümü' : users.find(u => u.id === selectedUser)?.name
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `finmate-rapor-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar ve Analizler</h1>
          <p className="text-gray-600">Finansal durumunuzu detaylı olarak inceleyin</p>
        </div>
        <button
          onClick={exportReport}
          className="btn-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Raporu Dışa Aktar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rapor Türü
            </label>
            <button
              onClick={() => setShowReportTypeModal(true)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{reportTypeLabel}</div>
                  <div className="text-sm text-gray-500">Rapor türünü değiştir</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zaman Aralığı
            </label>
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{dateRangeLabel}</div>
                  <div className="text-sm text-gray-500">Tarih aralığını değiştir</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı
            </label>
            <button
              onClick={() => setShowUserModal(true)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-purple-500 hover:shadow-md transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{userLabel}</div>
                  <div className="text-sm text-gray-500">Kullanıcıyı değiştir</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'overview' && <OverviewReport />}
      {reportType === 'trends' && <TrendsReport />}
      
      {/* Modern Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateRangeSelect}
      />
      
      {/* Report Type Modal */}
      <ReportTypeModal
        isOpen={showReportTypeModal}
        onClose={() => setShowReportTypeModal(false)}
        onSelect={handleReportTypeSelect}
      />
      
      {/* User Filter Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSelect={handleUserSelect}
      />

      {/* Data Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Veri Özeti</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Toplam İşlem</p>
            <p className="font-semibold text-gray-900">{filteredTransactions.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Gelir İşlemi</p>
            <p className="font-semibold text-gray-900">
              {filteredTransactions.filter(t => t.type === 'income').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Gider İşlemi</p>
            <p className="font-semibold text-gray-900">
              {filteredTransactions.filter(t => t.type === 'expense').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Rapor Tarihi</p>
            <p className="font-semibold text-gray-900">
              {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
