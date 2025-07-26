import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createTransaction, createInvestment, createGoal, createUser } from '../types';
import goalIntegrationService from '../services/goalIntegrationService';
import autoUpdateService, { UPDATE_FREQUENCIES } from '../services/autoUpdateService';
import { updateInvestmentWithMarketData } from '../services/marketData';
import { addTransactionToInvestment, migrateInvestmentToDCA, updateInvestmentDCAMetrics } from '../utils/calculations';

const AppContext = createContext();

// Initial state
const initialState = {
  users: [
    createUser({ 
      id: 'default', 
      name: 'Ana Kullanıcı', 
      role: 'admin' 
    })
  ],
  transactions: [],
  investments: [],
  goals: [],
  debts: [],
  currentUser: 'default',
  activeModal: null,
  modalData: null,
  settings: {
    savingsPercentage: 30, // Default 30% of net cash flow goes to goals
    autoGoalContribution: true,
    goalPrioritization: 'manual', // 'manual' or 'automatic'
    autoUpdateInvestments: true, // Otomatik yatırım güncellemesi
    updateFrequency: 5 * 60 * 1000, // 5 dakika (milliseconds)
    lastMarketDataUpdate: null
  },
  filters: {
    dateRange: 'thisMonth',
    category: 'all',
    user: 'all'
  }
};

// Action types
const ActionTypes = {
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  ADD_INVESTMENT: 'ADD_INVESTMENT',
  UPDATE_INVESTMENT: 'UPDATE_INVESTMENT',
  DELETE_INVESTMENT: 'DELETE_INVESTMENT',
  ADD_INVESTMENT_TRANSACTION: 'ADD_INVESTMENT_TRANSACTION',
  MIGRATE_INVESTMENT_TO_DCA: 'MIGRATE_INVESTMENT_TO_DCA',
  UPDATE_INVESTMENT_DCA_METRICS: 'UPDATE_INVESTMENT_DCA_METRICS',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_GOAL_PRIORITIES: 'UPDATE_GOAL_PRIORITIES',
  UPDATE_MARKET_DATA: 'UPDATE_MARKET_DATA',
  UPDATE_INVESTMENTS_WITH_MARKET_DATA: 'UPDATE_INVESTMENTS_WITH_MARKET_DATA',
  ADD_DEBT: 'ADD_DEBT',
  UPDATE_DEBT: 'UPDATE_DEBT',
  DELETE_DEBT: 'DELETE_DEBT',
  SET_ACTIVE_MODAL: 'SET_ACTIVE_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  LOAD_DATA: 'LOAD_DATA',
  CLEAR_DATA: 'CLEAR_DATA'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    
    case ActionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : t
        )
      };
    
    case ActionTypes.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    
    case ActionTypes.ADD_INVESTMENT:
      return {
        ...state,
        investments: [...state.investments, action.payload]
      };
    
    case ActionTypes.UPDATE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.map(i => 
          i.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : i
        )
      };
    
    case ActionTypes.DELETE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.filter(i => i.id !== action.payload)
      };
    
    case ActionTypes.ADD_INVESTMENT_TRANSACTION:
      return {
        ...state,
        investments: state.investments.map(i => 
          i.id === action.payload.investmentId 
            ? addTransactionToInvestment(i, action.payload.transaction, action.payload.currentPricePerUnit)
            : i
        )
      };
    
    case ActionTypes.MIGRATE_INVESTMENT_TO_DCA:
      return {
        ...state,
        investments: state.investments.map(i => 
          i.id === action.payload ? migrateInvestmentToDCA(i) : i
        )
      };
    
    case ActionTypes.UPDATE_INVESTMENT_DCA_METRICS:
      return {
        ...state,
        investments: state.investments.map(i => 
          i.id === action.payload.investmentId 
            ? updateInvestmentDCAMetrics(i, action.payload.currentPricePerUnit)
            : i
        )
      };
    
    case ActionTypes.ADD_GOAL:
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };
    
    case ActionTypes.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : g
        )
      };
    
    case ActionTypes.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload)
      };
    
    case ActionTypes.ADD_USER:
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(u => 
          u.id === action.payload.id ? action.payload : u
        )
      };
    
    case ActionTypes.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      };
    
    case ActionTypes.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload
      };
    
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case ActionTypes.UPDATE_GOAL_PRIORITIES:
      return {
        ...state,
        goals: action.payload
      };
    
    case ActionTypes.UPDATE_MARKET_DATA:
      return {
        ...state,
        settings: {
          ...state.settings,
          lastMarketDataUpdate: action.payload.timestamp
        },
        marketData: action.payload.data
      };
    
    case ActionTypes.UPDATE_INVESTMENTS_WITH_MARKET_DATA:
      return {
        ...state,
        investments: action.payload
      };
    
    case ActionTypes.ADD_DEBT:
      return {
        ...state,
        debts: [...state.debts, action.payload]
      };
    
    case ActionTypes.UPDATE_DEBT:
      return {
        ...state,
        debts: state.debts.map(debt => 
          debt.id === action.payload.id ? action.payload : debt
        )
      };
    
    case ActionTypes.DELETE_DEBT:
      return {
        ...state,
        debts: state.debts.filter(debt => debt.id !== action.payload)
      };
    
    case ActionTypes.SET_ACTIVE_MODAL:
      return {
        ...state,
        activeModal: action.payload.modalType,
        modalData: action.payload.data || null
      };
    
    case ActionTypes.CLOSE_MODAL:
      return {
        ...state,
        activeModal: null,
        modalData: null
      };
    
    case ActionTypes.LOAD_DATA:
      return {
        ...state,
        ...action.payload
      };
    
    case ActionTypes.CLEAR_DATA:
      return initialState;
    
    default:
      return state;
  }
}

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('finmate-data');
    console.log('Loading data from localStorage:', savedData ? 'Data found' : 'No data found');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Parsed data:', parsedData);
        
        // Sadece gerekli alanları yükle, initialState ile birleştir
        const dataToLoad = {
          transactions: parsedData.transactions || [],
          investments: parsedData.investments || [],
          goals: parsedData.goals || [],
          debts: parsedData.debts || [],
          users: parsedData.users || initialState.users,
          currentUser: parsedData.currentUser || initialState.currentUser,
          activeModal: null, // Modal state'i localStorage'dan yükleme
          modalData: null,
          settings: { ...initialState.settings, ...parsedData.settings },
          filters: { ...initialState.filters, ...parsedData.filters }
        };
        
        console.log('Loading data into state:', dataToLoad);
        dispatch({ type: ActionTypes.LOAD_DATA, payload: dataToLoad });
      } catch (error) {
        console.error('Error loading saved data:', error);
        // Hatalı veri varsa temizle
        localStorage.removeItem('finmate-data');
      }
    }
  }, []);

  // Save data to localStorage whenever state changes (debounced)
  useEffect(() => {
    // Skip saving during initial load
    if (state === initialState) return;
    
    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = {
          transactions: state.transactions,
          investments: state.investments,
          goals: state.goals,
          users: state.users,
          currentUser: state.currentUser,
          settings: state.settings,
          filters: state.filters
        };
        
        console.log('Saving data to localStorage:', dataToSave);
        localStorage.setItem('finmate-data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [state.transactions, state.investments, state.goals, state.users, state.currentUser, state.settings]);

  // Auto-update goals when transactions change
  useEffect(() => {
    if (state.transactions.length > 0 && state.goals.length > 0) {
      updateGoalsWithCashFlow();
    }
  }, [state.transactions]);

  // Otomatik yatırım güncellemesi sistemi
  useEffect(() => {
    if (state.settings.autoUpdateInvestments && state.settings.updateFrequency > 0) {
      // Otomatik güncellemeyi başlat
      autoUpdateService.start(state.settings.updateFrequency);
      
      // Güncelleme callback'ini ekle
      const handleMarketDataUpdate = (updateData) => {
        if (updateData.type === 'marketDataUpdated') {
          dispatch({
            type: ActionTypes.UPDATE_MARKET_DATA,
            payload: {
              data: updateData.data,
              timestamp: updateData.timestamp
            }
          });
          
          // Yatırımları güncelle
          if (state.investments.length > 0) {
            updateInvestmentsWithMarketData(updateData.data);
          }
        }
      };
      
      autoUpdateService.addUpdateCallback(handleMarketDataUpdate);
      
      return () => {
        autoUpdateService.removeUpdateCallback(handleMarketDataUpdate);
      };
    } else {
      // Otomatik güncellemeyi durdur
      autoUpdateService.stop();
    }
  }, [state.settings.autoUpdateInvestments, state.settings.updateFrequency]);

  // Component unmount'ta servisi temizle
  useEffect(() => {
    return () => {
      autoUpdateService.stop();
    };
  }, []);

  // Calculate net cash flow and update goals automatically
  const updateGoalsWithCashFlow = () => {
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;
    
    if (netCashFlow > 0 && state.settings.autoGoalContribution) {
      const monthlyAverages = goalIntegrationService.calculateMonthlyAverages(state.transactions);
      const contributions = goalIntegrationService.calculateAutoContributions(
        monthlyAverages.averageMonthlyNetFlow, 
        state.goals,
        {
          contributionPercentage: state.settings.savingsPercentage / 100,
          priorityBased: state.settings.goalPrioritization === 'manual'
        }
      );
      
      // Apply contributions to goals
      contributions.forEach(contribution => {
        const goalIndex = state.goals.findIndex(g => g.id === contribution.goalId);
        if (goalIndex !== -1) {
          const updatedGoal = goalIntegrationService.updateGoalWithContribution(
            state.goals[goalIndex], 
            contribution
          );
          dispatch({ type: ActionTypes.UPDATE_GOAL, payload: updatedGoal });
        }
      });
    }
  };

  // Action creators
  const actions = {
    addTransaction: (transaction) => 
      dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: transaction }),
    
    updateTransaction: (transaction) => 
      dispatch({ type: ActionTypes.UPDATE_TRANSACTION, payload: transaction }),
    
    deleteTransaction: (id) => 
      dispatch({ type: ActionTypes.DELETE_TRANSACTION, payload: id }),
    
    addInvestment: (investment) => 
      dispatch({ type: ActionTypes.ADD_INVESTMENT, payload: investment }),
    
    updateInvestment: (investment) => 
      dispatch({ type: ActionTypes.UPDATE_INVESTMENT, payload: investment }),
    
    deleteInvestment: (id) => 
      dispatch({ type: ActionTypes.DELETE_INVESTMENT, payload: id }),
    
    // DCA (Dollar Cost Averaging) methods
    addInvestmentTransaction: (investmentId, transaction, currentPricePerUnit = 0) => 
      dispatch({ 
        type: ActionTypes.ADD_INVESTMENT_TRANSACTION, 
        payload: { investmentId, transaction, currentPricePerUnit } 
      }),
    
    migrateInvestmentToDCA: (investmentId) => 
      dispatch({ type: ActionTypes.MIGRATE_INVESTMENT_TO_DCA, payload: investmentId }),
    
    updateInvestmentDCAMetrics: (investmentId, currentPricePerUnit) => 
      dispatch({ 
        type: ActionTypes.UPDATE_INVESTMENT_DCA_METRICS, 
        payload: { investmentId, currentPricePerUnit } 
      }),
    
    addGoal: (goal) => 
      dispatch({ type: ActionTypes.ADD_GOAL, payload: goal }),
    
    updateGoal: (goal) => 
      dispatch({ type: ActionTypes.UPDATE_GOAL, payload: goal }),
    
    deleteGoal: (id) => 
      dispatch({ type: ActionTypes.DELETE_GOAL, payload: id }),
    
    addUser: (user) => 
      dispatch({ type: ActionTypes.ADD_USER, payload: user }),
    
    updateUser: (user) => 
      dispatch({ type: ActionTypes.UPDATE_USER, payload: user }),
    
    deleteUser: (id) => 
      dispatch({ type: ActionTypes.DELETE_USER, payload: id }),
    
    setCurrentUser: (userId) => 
      dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: userId }),
    
    setFilters: (filters) => 
      dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    
    clearData: () => 
      dispatch({ type: ActionTypes.CLEAR_DATA }),

    // Borç yönetimi metodları
    addDebt: (debt) => 
      dispatch({ type: ActionTypes.ADD_DEBT, payload: debt }),
    
    updateDebt: (debt) => 
      dispatch({ type: ActionTypes.UPDATE_DEBT, payload: debt }),
    
    deleteDebt: (id) => 
      dispatch({ type: ActionTypes.DELETE_DEBT, payload: id }),

    // Modal yönetimi metodları
    setActiveModal: (modalType, data = null) => 
      dispatch({ type: ActionTypes.SET_ACTIVE_MODAL, payload: { modalType, data } }),
    
    closeModal: () => 
      dispatch({ type: ActionTypes.CLOSE_MODAL }),

    // Otomatik yatırım güncellemesi metodları
    updateInvestmentsWithMarketData: async (marketData) => {
      try {
        const updatedInvestments = await Promise.all(
          state.investments.map(investment => 
            updateInvestmentWithMarketData(investment, marketData)
          )
        );
        dispatch({ 
          type: ActionTypes.UPDATE_INVESTMENTS_WITH_MARKET_DATA, 
          payload: updatedInvestments 
        });
        return updatedInvestments;
      } catch (error) {
        console.error('Yatırımlar güncellenirken hata:', error);
        throw error;
      }
    },

    manualUpdateInvestments: async () => {
      try {
        const updatedInvestments = await autoUpdateService.updateInvestments(state.investments);
        return updatedInvestments;
      } catch (error) {
        console.error('Manuel güncelleme hatası:', error);
        throw error;
      }
    },

    toggleAutoUpdate: (enabled) => {
      dispatch({ 
        type: ActionTypes.UPDATE_SETTINGS, 
        payload: { autoUpdateInvestments: enabled } 
      });
    },

    setUpdateFrequency: (frequency) => {
      dispatch({ 
        type: ActionTypes.UPDATE_SETTINGS, 
        payload: { updateFrequency: frequency } 
      });
    },

    getAutoUpdateStatus: () => autoUpdateService.getStatus(),

    // Goal integration methods
    getGoalInsights: (goals, monthlyNetCashFlow) => 
      goalIntegrationService.generateGoalInsights(goals || state.goals, monthlyNetCashFlow),
    
    predictGoalAchievement: (goal, monthlyNetCashFlow) => 
      goalIntegrationService.predictAchievementDate(goal, monthlyNetCashFlow),
    
    calculateGoalProgress: (goal) => 
      goalIntegrationService.calculateProgress(goal),

    updateGoalsWithCashFlow: updateGoalsWithCashFlow,

    // Settings management
    updateSettings: (settings) => 
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings }),
    
    updateGoalPriorities: (goals) => 
      dispatch({ type: ActionTypes.UPDATE_GOAL_PRIORITIES, payload: goals })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
