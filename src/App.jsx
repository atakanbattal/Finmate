import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import CashManagement from './components/CashManagement';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

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
    <AppProvider>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderCurrentView()}
      </Layout>
    </AppProvider>
  );
}

export default App;
