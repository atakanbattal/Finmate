import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GoalInsights from './GoalInsights';
import { getTransactionsWithRecurring } from '../utils/calculations';

const Dashboard = () => {
  const { state, actions } = useApp();
  const { transactions = [], users = [], goals = [], settings = {} } = state;
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    installments: 1,
    installmentType: 'monthly' // monthly, weekly, daily
  });

  // Para birimi formatı
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Filtrelenmiş işlemler
  const filteredTransactions = selectedPerson === 'all' 
    ? transactions 
    : transactions.filter(t => t.userId === selectedPerson);

  // Seçilen ay için tekrarlayan işlemleri dahil et
  const monthStart = new Date(selectedYear, selectedMonth, 1);
  const monthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
  
  // Seçilen ay için tüm işlemleri (tekrarlayan dahil) al
  const currentMonthTransactions = getTransactionsWithRecurring(filteredTransactions, monthStart, monthEnd)
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

  // Seçilen ay için finansal hesaplamalar
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Form işlemleri
  const handleShowForm = (type) => {
    setTransactionType(type);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setFormData({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      installments: 1,
      installmentType: 'monthly'
    });
  };

  const handleAddTransaction = () => {
    if (!formData.description.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Lütfen açıklama ve geçerli bir miktar girin.');
      return;
    }

    const totalAmount = parseFloat(formData.amount);
    const installmentCount = parseInt(formData.installments) || 1;
    const installmentAmount = totalAmount / installmentCount;
    
    // Taksit sayısına göre işlemler oluştur
    for (let i = 0; i < installmentCount; i++) {
      const installmentDate = new Date(formData.date);
      
      // Taksit tipine göre tarih hesapla
      switch (formData.installmentType) {
        case 'monthly':
          installmentDate.setMonth(installmentDate.getMonth() + i);
          break;
        case 'weekly':
          installmentDate.setDate(installmentDate.getDate() + (i * 7));
          break;
        case 'daily':
          installmentDate.setDate(installmentDate.getDate() + i);
          break;
      }
      
      const newTransaction = {
        id: `${Date.now()}_${i}`,
        type: transactionType,
        amount: installmentAmount,
        description: installmentCount > 1 
          ? `${formData.description.trim()} (${i + 1}/${installmentCount})`
          : formData.description.trim(),
        category: 'Genel',
        date: installmentDate.toISOString().split('T')[0],
        userId: state.currentUser || 'default',
        createdAt: new Date().toISOString(),
        isInstallment: installmentCount > 1,
        installmentInfo: installmentCount > 1 ? {
          current: i + 1,
          total: installmentCount,
          originalAmount: totalAmount
        } : null
      };
      
      actions.addTransaction(newTransaction);
    }
    
    // Reset form
    setFormData({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      installments: 1,
      installmentType: 'monthly'
    });
    setShowAddForm(false);
    
    // Başarı mesajı
    const message = installmentCount > 1 
      ? `${installmentCount} taksitli işlem başarıyla eklendi!`
      : 'İşlem başarıyla eklendi!';
    alert(message);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold mb-2">FinMate Dashboard</h1>
            <p className="text-blue-100">
              {[
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
              ][selectedMonth]} {selectedYear} - Finansal Özet
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Ay Seçici */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Kişi Seçici */}
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">Tüm Aile</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Finansal Özet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Nakit Akışı</p>
              <p className={`text-2xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
        
        {!showAddForm ? (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleShowForm('income')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Gelir Ekle
            </button>
            <button 
              onClick={() => handleShowForm('expense')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Gider Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {transactionType === 'income' ? 'Gelir' : 'Gider'} Ekle
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                transactionType === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transactionType === 'income' ? 'Gelir' : 'Gider'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={transactionType === 'income' ? 'Örn: Maaş, Freelance' : 'Örn: Market, Kira'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toplam Miktar (₺)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taksit Sayısı
                  </label>
                  <input
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: Math.max(1, parseInt(e.target.value) || 1) }))}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taksit Tipi
                  </label>
                  <select
                    value={formData.installmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, installmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Aylık</option>
                    <option value="weekly">Haftalık</option>
                    <option value="daily">Günlük</option>
                  </select>
                </div>
              </div>
              
              {/* Taksit Önizlemesi */}
              {formData.amount && formData.installments > 1 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Taksit Önizlemesi</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>Toplam:</strong> {formatCurrency(parseFloat(formData.amount) || 0)}</p>
                    <p><strong>Taksit Başına:</strong> {formatCurrency((parseFloat(formData.amount) || 0) / (formData.installments || 1))}</p>
                    <p><strong>Taksit Sayısı:</strong> {formData.installments} {formData.installmentType === 'monthly' ? 'aylık' : formData.installmentType === 'weekly' ? 'haftalık' : 'günlük'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddTransaction}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  transactionType === 'income'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {transactionType === 'income' ? 'Gelir' : 'Gider'} Ekle
              </button>
              <button
                onClick={handleCancelForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Son İşlemler */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son İşlemler</h3>
        <div className="space-y-3">
          {filteredTransactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{transaction.description || 'İsimsiz İşlem'}</p>
                <p className="text-sm text-gray-500">{transaction.category || 'Genel'}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500">{transaction.date || 'Bugün'}</p>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz işlem kaydı bulunmuyor</p>
              <button 
                onClick={() => handleShowForm('income')}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk İşleminizi Ekleyin
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Akıllı Hedef Takibi */}
      <GoalInsights 
        goals={goals}
        netCashFlow={netCashFlow}
        savingsPercentage={settings.savingsPercentage || 30}
      />

    </div>
  );
};

export default Dashboard;
