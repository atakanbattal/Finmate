import React from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Wallet,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout = ({ children, currentView, setCurrentView }) => {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Ana Sayfa', icon: Home },
    { id: 'transactions', name: 'Gelir & Giderler', icon: CreditCard },
    { id: 'cash-management', name: 'Nakit Yönetimi', icon: DollarSign },
    { id: 'investments', name: 'Yatırımlar', icon: TrendingUp },
    { id: 'goals', name: 'Hedefler', icon: Target },
    { id: 'reports', name: 'Raporlar', icon: BarChart3 },
    { id: 'settings', name: 'Ayarlar', icon: Settings },
  ];

  const currentUser = state.users.find(u => u.id === state.currentUser);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">FinMate</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name || 'Kullanıcı'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.role === 'admin' ? 'Yönetici' : 'Üye'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {navigation.find(item => item.id === currentView)?.name || 'FinMate'}
              </h2>
              
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Hoş geldiniz, {currentUser?.name}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
