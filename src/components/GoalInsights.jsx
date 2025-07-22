import React from 'react';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Clock,
  Lightbulb
} from 'lucide-react';

const GoalInsights = ({ goals = [], netCashFlow = 0, savingsPercentage = 30 }) => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'on_track':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'behind':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-900';
      case 'on_track': return 'bg-green-50 border-green-200 text-green-900';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'behind': return 'bg-red-50 border-red-200 text-red-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'on_track': return 'Başarılı';
      case 'warning': return 'Kritik Sınırda';
      case 'behind': return 'Dikkat Gerekli';
      default: return 'Belirsiz';
    }
  };

  // Tahmini tamamlanma tarihi hesaplama
  const calculateEstimatedDate = (goal, monthlyContribution) => {
    if (goal.progress >= 100) return 'Tamamlandı';
    if (monthlyContribution <= 0) return 'Belirsiz';
    
    const remaining = goal.remaining;
    const monthsNeeded = Math.ceil(remaining / monthlyContribution);
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
    
    return targetDate.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Hedefe zamanında ulaşmak için gereken aylık katkı hesaplama
  const calculateRequiredMonthlyContribution = (goal, targetMonths = 12) => {
    if (goal.progress >= 100) return 0;
    return Math.ceil(goal.remaining / targetMonths);
  };

  // Öneri oluşturma
  const generateRecommendation = (goal, monthlyContribution) => {
    if (goal.progress >= 100) {
      return '🎉 Tebrikler! Hedefinizi başarıyla tamamladınız.';
    }
    
    if (monthlyContribution <= 0) {
      return '💰 Hedefinize ulaşmak için aylık birikim yapmaya başlayın.';
    }
    
    const remaining = goal.remaining;
    const monthsNeeded = Math.ceil(remaining / monthlyContribution);
    const requiredFor12Months = calculateRequiredMonthlyContribution(goal, 12);
    
    if (monthsNeeded <= 6) {
      return `✨ Harika! Mevcut hızınızla ${monthsNeeded} ay içinde hedefinize ulaşacaksınız.`;
    } else if (monthsNeeded <= 12) {
      return `💪 ${monthsNeeded} ay içinde hedefinize ulaşabilirsiniz. Tutarlı kalın!`;
    } else {
      return `🚀 12 ay içinde ulaşmak için aylık ${formatCurrency(requiredFor12Months)} biriktirmeniz gerekiyor.`;
    }
  };

  if (!goals || goals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Akıllı Hedef Takibi</h3>
        </div>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz hedef eklenmemiş</p>
          <p className="text-sm text-gray-400 mt-1">Hedefler bölümünden yeni hedefler ekleyebilirsiniz</p>
        </div>
      </div>
    );
  }

  const monthlyGoalAllocation = netCashFlow > 0 ? (netCashFlow * savingsPercentage / 100) : 0;
  const monthlyPerGoal = goals.length > 0 ? monthlyGoalAllocation / goals.length : 0;

  const goalInsights = goals.map(goal => {
    const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    // Tahmini tamamlanma süresini hesapla
    const monthlyContribution = monthlyPerGoal;
    const monthsNeeded = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : Infinity;
    
    // Daha akıllı durum belirleme - hem ilerleme hem de tahmini süreyi dikkate al
    let status;
    if (progress >= 100) {
      status = 'completed'; // Tamamlandı - Yeşil
    } else if (monthsNeeded <= 6 || progress >= 75) {
      status = 'on_track'; // 6 ay içinde bitecek veya %75+ tamamlanmış - Yeşil
    } else if (monthsNeeded <= 12 || progress >= 40) {
      status = 'warning'; // 12 ay içinde bitecek veya %40+ tamamlanmış - Sarı
    } else {
      status = 'behind'; // 12+ ay sürecek ve %40'tan az - Kırmızı
    }
    
    return {
      ...goal,
      progress: Math.round(progress),
      remaining: remaining,
      status: status,
      monthsNeeded: monthsNeeded
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Akıllı Hedef Takibi</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Bu ay hedeflere</p>
          <p className="font-semibold text-purple-600">
            {formatCurrency(monthlyGoalAllocation)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {goalInsights.map((goal) => {
          const estimatedDate = calculateEstimatedDate(goal, monthlyPerGoal);
          const recommendation = generateRecommendation(goal, monthlyPerGoal);
          const requiredMonthly = calculateRequiredMonthlyContribution(goal, 12);
          
          return (
            <div key={goal.id} className={`p-6 rounded-xl border-2 ${getStatusColor(goal.status)} transition-all duration-200 hover:shadow-lg`}>
              {/* Hedef Başlığı */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(goal.status)}
                  <div>
                    <h4 className="text-lg font-bold">{goal.name}</h4>
                    <p className="text-sm opacity-75">{formatCurrency(goal.targetAmount)} hedef</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white shadow-sm">
                    {getStatusText(goal.status)}
                  </span>
                  <p className="text-xs mt-1 opacity-75">%{goal.progress} tamamlandı</p>
                </div>
              </div>
              
              {/* İlerleme Çubuğu */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">İlerleme Durumu</span>
                  <span className="font-bold">%{goal.progress}</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      goal.status === 'completed' ? 'bg-green-500' :
                      goal.status === 'on_track' ? 'bg-green-500' :
                      goal.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Finansal Detaylar */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 opacity-75" />
                  <p className="text-xs opacity-75">Mevcut</p>
                  <p className="font-bold text-sm">{formatCurrency(goal.currentAmount)}</p>
                </div>
                <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                  <Target className="h-5 w-5 mx-auto mb-1 opacity-75" />
                  <p className="text-xs opacity-75">Kalan</p>
                  <p className="font-bold text-sm">{formatCurrency(goal.remaining)}</p>
                </div>
              </div>
              
              {/* Aylık Katkı Bilgileri */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 opacity-75" />
                  <p className="text-xs opacity-75">Mevcut Aylık</p>
                  <p className="font-bold text-sm">{formatCurrency(monthlyPerGoal)}</p>
                </div>
                <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 opacity-75" />
                  <p className="text-xs opacity-75">12 Ay İçin Gereken</p>
                  <p className="font-bold text-sm text-orange-600">{formatCurrency(requiredMonthly)}</p>
                </div>
              </div>
              
              {/* Tahmini Tarih */}
              <div className="flex items-center space-x-2 mb-3 p-3 bg-white bg-opacity-30 rounded-lg">
                <Calendar className="h-4 w-4 opacity-75" />
                <div>
                  <p className="text-xs opacity-75">Tahmini Tamamlanma</p>
                  <p className="font-semibold text-sm">{estimatedDate}</p>
                </div>
              </div>
              
              {/* Akıllı Öneri */}
              <div className="flex items-start space-x-2 p-3 bg-white bg-opacity-30 rounded-lg">
                <Lightbulb className="h-4 w-4 mt-0.5 opacity-75 flex-shrink-0" />
                <div>
                  <p className="text-xs opacity-75 mb-1">Akıllı Öneri</p>
                  <p className="text-sm font-medium leading-relaxed">{recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalInsights;
