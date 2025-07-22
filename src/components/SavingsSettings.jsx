import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Target,
  Percent,
  DollarSign
} from 'lucide-react';

const SavingsSettings = ({ 
  savingsPercentage = 30, 
  goals = [], 
  onUpdateSettings, 
  onUpdateGoalPriorities,
  netCashFlow = 0 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPercentage, setTempPercentage] = useState(savingsPercentage);
  const [tempGoalOrder, setTempGoalOrder] = useState(goals.map((goal, index) => ({
    ...goal,
    priority: goal.priority || index + 1
  })));

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      savingsPercentage: tempPercentage
    });

    onUpdateGoalPriorities(tempGoalOrder.map((goal, index) => ({
      ...goal,
      priority: index + 1
    })));

    setIsOpen(false);
  };

  const moveGoal = (index, direction) => {
    const newOrder = [...tempGoalOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setTempGoalOrder(newOrder);
    }
  };

  const calculateAllocation = (percentage) => {
    return netCashFlow > 0 ? (netCashFlow * percentage / 100) : 0;
  };

  if (!isOpen) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Birikim Ayarları</h3>
              <p className="text-sm text-gray-600">
                Net nakit akışının <strong>%{savingsPercentage}</strong>'i hedeflere aktarılıyor
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Bu ay hedeflere</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(calculateAllocation(savingsPercentage))}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ayarla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Birikim Ayarları</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Savings Percentage Setting */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Percent className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Birikim Yüzdesi</h4>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Net nakit akışının yüzdesi:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={tempPercentage}
                onChange={(e) => setTempPercentage(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="bg-blue-100 px-3 py-1 rounded-lg min-w-[60px] text-center">
                <span className="font-semibold text-blue-800">%{tempPercentage}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Hedeflere</span>
              </div>
              <p className="text-green-700 font-semibold">
                {formatCurrency(calculateAllocation(tempPercentage))}
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Serbest</span>
              </div>
              <p className="text-blue-700 font-semibold">
                {formatCurrency(netCashFlow - calculateAllocation(tempPercentage))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Priority Setting */}
      {tempGoalOrder.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">Hedef Öncelikleri</h4>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Hedeflerinizi öncelik sırasına göre düzenleyin. Üstteki hedefler önce finanse edilir.
            </p>
            
            <div className="space-y-2">
              {tempGoalOrder.map((goal, index) => (
                <div 
                  key={goal.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{goal.name}</h5>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveGoal(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveGoal(index, 'down')}
                      disabled={index === tempGoalOrder.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleSaveSettings}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Kaydet</span>
        </button>
      </div>
    </div>
  );
};

export default SavingsSettings;
