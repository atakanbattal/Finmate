import React, { useState } from 'react';
import { 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createUser } from '../types';
import { UPDATE_FREQUENCIES, UPDATE_FREQUENCY_LABELS } from '../services/autoUpdateService';

const Settings = () => {
  const { state, actions } = useApp();
  const { users, currentUser } = state;
  
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const UserModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState(
      user || {
        name: '',
        email: '',
        role: 'member'
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name) {
        alert('Lütfen kullanıcı adını girin');
        return;
      }

      if (user) {
        actions.updateUser({ ...user, ...formData });
      } else {
        actions.addUser(createUser(formData));
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {user ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Kullanıcı adı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="select-field"
                >
                  <option value="member">Üye</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>

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
                  {user ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DataManagementModal = ({ onClose }) => {
    const [importData, setImportData] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const exportData = () => {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `finmate-yedek-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    };

    const handleImport = () => {
      try {
        const parsedData = JSON.parse(importData);
        
        // Validate data structure
        if (!parsedData.users || !parsedData.transactions) {
          throw new Error('Geçersiz veri formatı');
        }

        actions.clearData();
        
        // Import data
        if (parsedData.users) {
          parsedData.users.forEach(user => actions.addUser(user));
        }
        if (parsedData.transactions) {
          parsedData.transactions.forEach(transaction => actions.addTransaction(transaction));
        }
        if (parsedData.investments) {
          parsedData.investments.forEach(investment => actions.addInvestment(investment));
        }
        if (parsedData.goals) {
          parsedData.goals.forEach(goal => actions.addGoal(goal));
        }

        alert('Veriler başarıyla içe aktarıldı!');
        onClose();
      } catch (error) {
        alert('Veri içe aktarma hatası: ' + error.message);
      }
    };

    const clearAllData = () => {
      if (showConfirm) {
        actions.clearData();
        alert('Tüm veriler temizlendi!');
        setShowConfirm(false);
        onClose();
      } else {
        setShowConfirm(true);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Veri Yönetimi
            </h2>
            
            <div className="space-y-6">
              {/* Export */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Verileri Dışa Aktar</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tüm verilerinizi JSON formatında yedekleyin
                </p>
                <button
                  onClick={exportData}
                  className="btn-primary w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Verileri Dışa Aktar
                </button>
              </div>

              {/* Import */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Verileri İçe Aktar</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Daha önce dışa aktardığınız verileri geri yükleyin
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="JSON verilerini buraya yapıştırın..."
                />
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Verileri İçe Aktar
                </button>
              </div>

              {/* Clear Data */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2 text-danger-600">
                  Tehlikeli Bölge
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Bu işlem tüm verilerinizi kalıcı olarak siler
                </p>
                <button
                  onClick={clearAllData}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    showConfirm 
                      ? 'bg-danger-600 hover:bg-danger-700 text-white' 
                      : 'bg-danger-100 hover:bg-danger-200 text-danger-700'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {showConfirm ? 'Onayla - Tüm Verileri Sil' : 'Tüm Verileri Temizle'}
                </button>
                {showConfirm && (
                  <p className="text-xs text-danger-600 mt-2">
                    Bu işlem geri alınamaz! Tekrar tıklayarak onaylayın.
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Kullanıcı Ekle
        </button>
      </div>

      <div className="card">
        <div className="divide-y divide-gray-200">
          {users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.email || 'E-posta belirtilmemiş'} • {user.role === 'admin' ? 'Yönetici' : 'Üye'}
                  </p>
                  {user.id === currentUser && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktif Kullanıcı
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => actions.setCurrentUser(user.id)}
                  disabled={user.id === currentUser}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    user.id === currentUser
                      ? 'bg-primary-100 text-primary-700 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {user.id === currentUser ? 'Aktif' : 'Seç'}
                </button>
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-1 text-gray-400 hover:text-primary-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (users.length === 1) {
                      alert('En az bir kullanıcı bulunmalıdır');
                      return;
                    }
                    if (user.id === currentUser) {
                      alert('Aktif kullanıcıyı silemezsiniz');
                      return;
                    }
                    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
                      actions.deleteUser(user.id);
                    }
                  }}
                  disabled={users.length === 1 || user.id === currentUser}
                  className="p-1 text-gray-400 hover:text-danger-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Otomatik Güncelleme Sekmesi
  const AutoUpdateTab = () => {
    const handleManualUpdate = async () => {
      setIsUpdating(true);
      try {
        await actions.manualUpdateInvestments();
        alert('Yatırımlar başarıyla güncellendi!');
      } catch (error) {
        alert('Güncelleme sırasında hata oluştu: ' + error.message);
      } finally {
        setIsUpdating(false);
      }
    };

    const updateStatus = actions.getAutoUpdateStatus();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Otomatik Güncelleme</h3>
          <button
            onClick={handleManualUpdate}
            disabled={isUpdating}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Güncelleniyor...' : 'Manuel Güncelle'}
          </button>
        </div>

        {/* Otomatik Güncelleme Ayarları */}
        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-4">Otomatik Güncelleme Ayarları</h4>
          
          <div className="space-y-4">
            {/* Otomatik Güncelleme Aç/Kapat */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Otomatik Güncelleme</label>
                <p className="text-sm text-gray-500">Yatırımlarınızı otomatik olarak güncel verilerle takip edin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.settings.autoUpdateInvestments}
                  onChange={(e) => actions.toggleAutoUpdate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Güncelleme Sıklığı */}
            {state.settings.autoUpdateInvestments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Güncelleme Sıklığı
                </label>
                <select
                  value={state.settings.updateFrequency}
                  onChange={(e) => actions.setUpdateFrequency(parseInt(e.target.value))}
                  className="select-field"
                >
                  {Object.entries(UPDATE_FREQUENCIES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {UPDATE_FREQUENCY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Güncelleme Durumu */}
        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-4">Güncelleme Durumu</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">Durum</span>
              </div>
              <p className={`text-sm font-semibold ${
                updateStatus.isRunning ? 'text-green-600' : 'text-gray-600'
              }`}>
                {updateStatus.isRunning ? 'Aktif' : 'Durdurulmuş'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">Son Güncelleme</span>
              </div>
              <p className="text-sm text-gray-600">
                {updateStatus.lastUpdateTime 
                  ? new Date(updateStatus.lastUpdateTime).toLocaleString('tr-TR')
                  : 'Henüz güncelleme yapılmadı'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">Sonraki Güncelleme</span>
              </div>
              <p className="text-sm text-gray-600">
                {updateStatus.nextUpdateTime 
                  ? new Date(updateStatus.nextUpdateTime).toLocaleString('tr-TR')
                  : 'Planlanmamış'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Desteklenen Yatırım Türleri */}
        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-4">Otomatik Güncellenen Yatırım Türleri</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Döviz (USD, EUR, GBP, CHF, JPY, CAD, AUD)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Altın (TCMB verileri)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700">Kripto Para (Bitcoin, Ethereum, BNB, vb.)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Hisse Senetleri (geliştiriliyor)</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Emtia (geliştiriliyor)</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Gayrimenkul, Tahvil, Fonlar (manuel)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uyarılar */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Dikkat Edilmesi Gerekenler:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Otomatik güncelleme internet bağlantısı gerektirir</li>
                <li>API limitlerini aşmamak için çok sık güncelleme yapmayın</li>
                <li>Bazı yatırım türleri henüz otomatik güncellenmiyor</li>
                <li>Veriler üçüncü taraf kaynaklardan gelir, doğruluğu garanti edilmez</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DataTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Veri Yönetimi</h3>
        <button
          onClick={() => setShowDataModal(true)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Veri İşlemleri
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-2">Toplam İşlem</h4>
          <p className="text-2xl font-bold text-primary-600">{state.transactions.length}</p>
          <p className="text-sm text-gray-500 mt-1">Gelir ve gider kayıtları</p>
        </div>

        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-2">Yatırımlar</h4>
          <p className="text-2xl font-bold text-primary-600">{state.investments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Portföy kayıtları</p>
        </div>

        <div className="card p-6">
          <h4 className="font-medium text-gray-900 mb-2">Hedefler</h4>
          <p className="text-2xl font-bold text-primary-600">{state.goals.length}</p>
          <p className="text-sm text-gray-500 mt-1">Finansal hedefler</p>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="font-medium text-gray-900 mb-4">Veri Güvenliği</h4>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Tüm verileriniz tarayıcınızın yerel depolama alanında saklanır</p>
          <p>• Veriler hiçbir sunucuya gönderilmez, tamamen yerel olarak işlenir</p>
          <p>• Düzenli olarak verilerinizi dışa aktararak yedekleme yapmanızı öneririz</p>
          <p>• Tarayıcı verilerini temizlerseniz tüm bilgileriniz silinir</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600">Uygulama ayarlarınızı ve verilerinizi yönetin</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab('autoupdate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'autoupdate'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Otomatik Güncelleme
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'data'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Veri Yönetimi
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'autoupdate' && <AutoUpdateTab />}
          {activeTab === 'data' && <DataTab />}
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <UserModal onClose={() => setShowAddUserModal(false)} />
      )}
      
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showDataModal && (
        <DataManagementModal onClose={() => setShowDataModal(false)} />
      )}
    </div>
  );
};

export default Settings;
