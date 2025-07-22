// Otomatik Güncelleme Servisi
// Yatırımları belirli aralıklarla otomatik olarak günceller

import marketDataService, { updateInvestmentWithMarketData } from './marketData.js';

class AutoUpdateService {
  constructor() {
    this.updateInterval = null;
    this.isRunning = false;
    this.updateFrequency = 5 * 60 * 1000; // 5 dakika (varsayılan)
    this.lastUpdateTime = null;
    this.updateCallbacks = [];
  }

  // Güncelleme callback'i ekle
  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  // Güncelleme callback'i kaldır
  removeUpdateCallback(callback) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  // Callback'leri çağır
  notifyCallbacks(data) {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Update callback hatası:', error);
      }
    });
  }

  // Otomatik güncellemeyi başlat
  start(frequency = 5 * 60 * 1000) { // Varsayılan 5 dakika
    if (this.isRunning) {
      console.log('Otomatik güncelleme zaten çalışıyor');
      return;
    }

    this.updateFrequency = frequency;
    this.isRunning = true;

    console.log(`Otomatik güncelleme başlatıldı (${frequency / 1000 / 60} dakika aralıkla)`);

    // İlk güncellemeyi hemen yap
    this.performUpdate();

    // Periyodik güncellemeleri başlat
    this.updateInterval = setInterval(() => {
      this.performUpdate();
    }, this.updateFrequency);
  }

  // Otomatik güncellemeyi durdur
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Otomatik güncelleme durduruldu');
  }

  // Güncelleme sıklığını değiştir
  setUpdateFrequency(frequency) {
    this.updateFrequency = frequency;
    
    if (this.isRunning) {
      this.stop();
      this.start(frequency);
    }
  }

  // Manuel güncelleme yap
  async performUpdate() {
    try {
      console.log('Yatırım verileri güncelleniyor...');
      
      // Market verilerini al
      const marketData = await marketDataService.getAllMarketData();
      
      // Güncelleme zamanını kaydet
      this.lastUpdateTime = new Date().toISOString();
      
      // Callback'leri bilgilendir
      this.notifyCallbacks({
        type: 'marketDataUpdated',
        data: marketData,
        timestamp: this.lastUpdateTime
      });

      console.log('Market verileri başarıyla güncellendi');
      
      return marketData;
    } catch (error) {
      console.error('Otomatik güncelleme hatası:', error);
      
      // Hata callback'i
      this.notifyCallbacks({
        type: 'updateError',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  // Belirli yatırımları güncelle
  async updateInvestments(investments) {
    try {
      const marketData = await marketDataService.getAllMarketData();
      
      const updatedInvestments = await Promise.all(
        investments.map(investment => 
          updateInvestmentWithMarketData(investment, marketData)
        )
      );

      this.notifyCallbacks({
        type: 'investmentsUpdated',
        data: updatedInvestments,
        timestamp: new Date().toISOString()
      });

      return updatedInvestments;
    } catch (error) {
      console.error('Yatırımlar güncellenirken hata:', error);
      throw error;
    }
  }

  // Servis durumu
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateFrequency: this.updateFrequency,
      lastUpdateTime: this.lastUpdateTime,
      nextUpdateTime: this.isRunning && this.lastUpdateTime 
        ? new Date(new Date(this.lastUpdateTime).getTime() + this.updateFrequency).toISOString()
        : null
    };
  }
}

// Singleton instance
const autoUpdateService = new AutoUpdateService();

export default autoUpdateService;

// Güncelleme sıklığı seçenekleri
export const UPDATE_FREQUENCIES = {
  REAL_TIME: 1 * 60 * 1000,      // 1 dakika
  FREQUENT: 5 * 60 * 1000,       // 5 dakika
  NORMAL: 15 * 60 * 1000,        // 15 dakika
  SLOW: 30 * 60 * 1000,          // 30 dakika
  HOURLY: 60 * 60 * 1000,        // 1 saat
  MANUAL: 0                       // Manuel güncelleme
};

export const UPDATE_FREQUENCY_LABELS = {
  [UPDATE_FREQUENCIES.REAL_TIME]: 'Gerçek Zamanlı (1 dk)',
  [UPDATE_FREQUENCIES.FREQUENT]: 'Sık (5 dk)',
  [UPDATE_FREQUENCIES.NORMAL]: 'Normal (15 dk)',
  [UPDATE_FREQUENCIES.SLOW]: 'Yavaş (30 dk)',
  [UPDATE_FREQUENCIES.HOURLY]: 'Saatlik (60 dk)',
  [UPDATE_FREQUENCIES.MANUAL]: 'Manuel Güncelleme'
};
