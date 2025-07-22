import React, { useState } from 'react';
import Layout from './components/Layout';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      <div style={{ padding: '20px' }}>
        <h1>FinMate - Layout Test</h1>
        <p>Bu adımda Layout bileşeni ile test ediyoruz.</p>
        <p>Aktif görünüm: {currentView}</p>
        <div style={{ backgroundColor: '#f0f0f0', padding: '20px', marginTop: '20px' }}>
          <h2>İçerik Alanı</h2>
          <p>Burada Dashboard ve diğer bileşenler olacak.</p>
        </div>
      </div>
    </Layout>
  );
}

export default App;
