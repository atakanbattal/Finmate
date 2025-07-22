# FinMate - Kişisel ve Aile Bütçe Yöneticisi

FinMate, kişisel ve aile finanslarınızı yönetmek için tasarlanmış kapsamlı, modern ve kullanıcı dostu bir web uygulamasıdır.

## 🌟 Özellikler

### 💰 Gelir ve Gider Takibi
- Detaylı kategori sistemi ile gelir ve gider kayıtları
- Çoklu kullanıcı desteği (aile üyeleri için)
- Farklı gelir kaynakları (maaş, ek gelir, kira, faiz, temettü vb.)
- Kapsamlı gider kategorileri (fatura, ulaşım, market, kira, kredi ödemesi, eğlence vb.)

### 📊 Yatırım Portföyü Yönetimi
- Mikro ve büyük yatırımların takibi
- Hisse senedi, döviz, altın, kripto para ve diğer yatırım türleri
- Gerçek zamanlı getiri hesaplaması
- Portföy dağılımı görselleştirmesi

### 🎯 Hedef Belirleme ve Takip
- Finansal hedefler oluşturma
- İlerleme takibi ve görselleştirme
- Hedef kategorileri (birikim, yatırım, borç ödeme vb.)
- Otomatik tamamlanma durumu

### 📈 Raporlar ve Analizler
- Aylık ve yıllık nakit akışı analizi
- Kategori bazlı harcama raporları
- Trend analizi ve görselleştirme
- Birikim oranı hesaplama
- Veri dışa aktarma

### ⚙️ Gelişmiş Özellikler
- Çoklu kullanıcı yönetimi
- Veri yedekleme ve geri yükleme
- Filtreleme ve arama özellikleri
- Responsive tasarım (mobil uyumlu)
- Yerel veri depolama (gizlilik odaklı)

## 🚀 Teknoloji Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context + useReducer
- **Data Storage**: LocalStorage (client-side)

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

3. **Tarayıcınızda açın:**
```
http://localhost:3000
```

## 🏗️ Build ve Deploy

**Production build oluşturmak için:**
```bash
npm run build
```

**Build önizlemesi:**
```bash
npm run preview
```

## 📱 Kullanım

### İlk Kurulum
1. Uygulama açıldığında varsayılan "Ana Kullanıcı" ile başlayabilirsiniz
2. Ayarlar bölümünden yeni aile üyeleri ekleyebilirsiniz
3. İlk gelir/gider kayıtlarınızı eklemeye başlayın

### Ana Özellikler
- **Dashboard**: Finansal durumunuzun genel görünümü
- **Gelir & Giderler**: Tüm işlemlerinizi kaydedin ve yönetin
- **Yatırımlar**: Portföyünüzü takip edin
- **Hedefler**: Finansal hedeflerinizi belirleyin ve takip edin
- **Raporlar**: Detaylı analizler ve görselleştirmeler
- **Ayarlar**: Kullanıcı yönetimi ve veri işlemleri

### Veri Güvenliği
- Tüm veriler tarayıcınızın yerel depolama alanında saklanır
- Hiçbir veri sunucuya gönderilmez
- Düzenli yedekleme yapmanız önerilir
- Veri dışa/içe aktarma özellikleri mevcuttur

## 🎨 Özelleştirme

### Kategoriler
Uygulama önceden tanımlanmış gelir ve gider kategorileri ile gelir. İhtiyacınıza göre `src/types/index.js` dosyasından kategorileri özelleştirebilirsiniz.

### Tema ve Renkler
Tailwind CSS kullanılarak tasarlanmıştır. `tailwind.config.js` dosyasından renk paletini özelleştirebilirsiniz.

## 📊 Veri Modeli

### İşlemler (Transactions)
- Gelir/Gider türü
- Tutar, kategori, açıklama
- Tarih ve kullanıcı bilgisi
- Tekrarlayan işlem desteği

### Yatırımlar (Investments)
- Yatırım adı ve türü
- Yatırılan tutar ve güncel değer
- Alım tarihi ve notlar
- Getiri hesaplama

### Hedefler (Goals)
- Hedef başlığı ve açıklama
- Hedef tutar ve mevcut tutar
- Hedef tarihi ve kategori
- İlerleme takibi

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız veya öneriniz varsa, lütfen issue oluşturun.

---

**FinMate ile finansal geleceğinizi kontrol altına alın! 💪**
