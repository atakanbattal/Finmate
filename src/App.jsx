import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CashManagement from './components/CashManagement';
import DynamicInvestmentForm from './components/DynamicInvestmentForm';
import ErrorBoundary from './components/ErrorBoundary';
import { createTransaction, createGoal, createReceivable } from './types';

// Simple Transaction Modal Component
const SimpleTransactionModal = ({ onClose, modalData, actions }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: modalData?.type || 'income'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert('Lütfen açıklama ve tutar alanlarını doldurun');
      return;
    }

    // 🔧 PRODUCTION-SAFE TÜRKÇE LOCALE-AWARE NUMBER PARSING
    const normalizeAmount = (value) => {
      try {
        if (!value || value === '' || value === null || value === undefined) {
          return 0;
        }
        
        // String'e çevir ve temizle
        let cleanValue = String(value).trim();
        
        // Boş string kontrolü
        if (cleanValue === '') {
          return 0;
        }
        
        // Türkçe format normalize et
        cleanValue = cleanValue
          .replace(/\./g, '')  // Binlik ayırıcıları sil (54.000 → 54000)
          .replace(',', '.');  // Ondalık virgülü noktaya çevir (,50 → .50)
        
        // parseFloat ile dönüştür
        const result = parseFloat(cleanValue);
        
        // NaN kontrolü
        if (isNaN(result)) {
          console.error('❌ Production SimpleModal: parseFloat failed for value:', value, 'cleaned:', cleanValue);
          return 0;
        }
        
        console.log('✅ Production SimpleModal: Amount parsed successfully:', value, '→', result);
        return result;
        
      } catch (error) {
        console.error('❌ Production SimpleModal: normalizeAmount error:', error, 'value:', value);
        return 0;
      }
    };

    const parsedAmount = normalizeAmount(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir tutar girin');
      return;
    }

    const transactionData = createTransaction({
      description: formData.description,
      amount: parsedAmount,
      category: formData.category || (formData.type === 'income' ? 'Diğer Gelir' : 'Diğer Gider'),
      type: formData.type,
      date: new Date().toISOString().split('T')[0],
      userId: 'default'
    });

    actions.addTransaction(transactionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.type === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="İşlem açıklaması"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutar *</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  setFormData({ ...formData, amount: value });
                }}
                onBlur={(e) => {
                  // 🔧 PRODUCTION-SAFE SimpleTransactionModal onBlur handler
                  try {
                    const value = e.target.value;
                    if (value && value.trim() !== '') {
                      // String'e çevir ve temizle
                      let cleanValue = String(value).trim();
                      
                      if (cleanValue === '') {
                        return;
                      }
                      
                      // Türkçe format normalize et
                      const normalized = cleanValue
                        .replace(/\./g, '')  // Binlik ayırıcıları sil
                        .replace(',', '.');  // Virgülü noktaya çevir
                      
                      const numValue = parseFloat(normalized);
                      
                      if (!isNaN(numValue) && numValue > 0) {
                        const formatted = new Intl.NumberFormat('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(numValue);
                        
                        console.log('✅ Production SimpleModal onBlur: Formatted successfully:', value, '→', formatted);
                        setFormData({ ...formData, amount: formatted });
                      } else {
                        console.error('❌ Production SimpleModal onBlur: Invalid number:', value, 'normalized:', normalized);
                      }
                    }
                  } catch (error) {
                    console.error('❌ Production SimpleModal onBlur error:', error, 'value:', e.target.value);
                    // Hata durumunda değeri olduğu gibi bırak
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Örnek: 54.000,50 veya 1.234,00
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={formData.type === 'income' ? 'Gelir kategorisi' : 'Gider kategorisi'}
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
                Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Simple Goal Modal Component
const SimpleGoalModal = ({ onClose, actions }) => {
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    const goalData = createGoal({
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      targetDate: formData.targetDate,
      notes: formData.notes,
      userId: 'default'
    });

    actions.addGoal(goalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Hedef Ekle</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Adı *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Hedef adı"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tutar *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Tutar</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tarih *</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Hedef hakkında notlar"
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
                Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Inner App component that uses the context
function AppContent() {
  // Hash routing sistemi - URL'den currentView'i oku
  const getViewFromHash = () => {
    const hash = window.location.hash.replace('#/', '');
    const validViews = ['dashboard', 'transactions', 'cash-management', 'investments', 'goals', 'reports', 'settings'];
    return validViews.includes(hash) ? hash : 'dashboard';
  };
  
  const [currentView, setCurrentView] = useState(getViewFromHash());
  const { state, actions } = useApp();
  const { activeModal, modalData } = state;
  
  // Hash değişikliklerini dinle
  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // currentView değiştiğinde hash'i güncelle
  const handleViewChange = (view) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'cash-management':
        return <CashManagement />;
      case 'investments':
        return <Investments />;
      case 'goals':
        return <Goals />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} setCurrentView={handleViewChange}>
        {renderCurrentView()}
      </Layout>
      
      {/* Render modals based on activeModal */}
      {(activeModal === 'addTransaction' || activeModal === 'addIncome' || activeModal === 'addExpense') && (
        <SimpleTransactionModal
          onClose={actions.closeModal}
          modalData={modalData}
          actions={actions}
        />
      )}
      {activeModal === 'addInvestment' && (
        <DynamicInvestmentForm
          onClose={actions.closeModal}
          investment={modalData}
          actions={actions}
        />
      )}
      {activeModal === 'addGoal' && (
        <SimpleGoalModal
          onClose={actions.closeModal}
          actions={actions}
        />
      )}
    </>
  );
}

// Main App component with provider
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
