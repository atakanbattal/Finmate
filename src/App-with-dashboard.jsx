import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <div style={{ padding: '20px' }}>
            <h1>FinMate - {currentView}</h1>
            <p>Bu sayfa henüz geliştirilmedi.</p>
          </div>
        );
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
