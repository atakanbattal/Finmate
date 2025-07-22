import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  users: [
    { 
      id: 'default', 
      name: 'Ana Kullanıcı', 
      role: 'admin' 
    }
  ],
  transactions: [],
  investments: [],
  debts: [],
  goals: [],
  categories: [],
  accounts: [],
  recurringTransactions: [],
  currentUser: 'default',
  settings: {
    savingsPercentage: 30,
    autoGoalContribution: true,
    goalPrioritization: 'manual',
    theme: 'light',
    notifications: true,
    autoBackup: true
  },
  filters: {
    dateRange: 'thisMonth',
    category: 'all',
    user: 'all',
    account: 'all'
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
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  ADD_ACCOUNT: 'ADD_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  ADD_RECURRING_TRANSACTION: 'ADD_RECURRING_TRANSACTION',
  UPDATE_RECURRING_TRANSACTION: 'UPDATE_RECURRING_TRANSACTION',
  DELETE_RECURRING_TRANSACTION: 'DELETE_RECURRING_TRANSACTION',
  ADD_DEBT: 'ADD_DEBT',
  UPDATE_DEBT: 'UPDATE_DEBT',
  DELETE_DEBT: 'DELETE_DEBT',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_GOAL_PRIORITIES: 'UPDATE_GOAL_PRIORITIES',
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
    
    // Category actions
    case ActionTypes.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    
    case ActionTypes.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : c
        )
      };
    
    case ActionTypes.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    
    // Account actions
    case ActionTypes.ADD_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload]
      };
    
    case ActionTypes.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(a => 
          a.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : a
        )
      };
    
    case ActionTypes.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload)
      };
    
    // Recurring transaction actions
    case ActionTypes.ADD_RECURRING_TRANSACTION:
      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.payload]
      };
    
    case ActionTypes.UPDATE_RECURRING_TRANSACTION:
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map(rt => 
          rt.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : rt
        )
      };
    
    case ActionTypes.DELETE_RECURRING_TRANSACTION:
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== action.payload)
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
    
    // Investment actions
    case ActionTypes.ADD_INVESTMENT:
      return {
        ...state,
        investments: [...state.investments, action.payload]
      };
    
    // Debt actions
    case ActionTypes.ADD_DEBT:
      return {
        ...state,
        debts: [...state.debts, action.payload]
      };
    
    case ActionTypes.UPDATE_DEBT:
      return {
        ...state,
        debts: state.debts.map(d => 
          d.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : d
        )
      };
    
    case ActionTypes.DELETE_DEBT:
      return {
        ...state,
        debts: state.debts.filter(d => d.id !== action.payload)
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
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ActionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('finmate-data', JSON.stringify(state));
  }, [state]);

  // Auto-update goals when transactions change
  useEffect(() => {
    if (state.transactions.length > 0 && state.goals.length > 0) {
      updateGoalsWithCashFlow();
    }
  }, [state.transactions]);

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
    
    deleteInvestment: (id) => 
      dispatch({ type: ActionTypes.DELETE_INVESTMENT, payload: id }),
    
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
    
    // Category actions
    addCategory: (category) => 
      dispatch({ type: ActionTypes.ADD_CATEGORY, payload: category }),
    
    updateCategory: (id, category) => 
      dispatch({ type: ActionTypes.UPDATE_CATEGORY, payload: { ...category, id } }),
    
    deleteCategory: (id) => 
      dispatch({ type: ActionTypes.DELETE_CATEGORY, payload: id }),
    
    // Account actions
    addAccount: (account) => 
      dispatch({ type: ActionTypes.ADD_ACCOUNT, payload: account }),
    
    updateAccount: (id, account) => 
      dispatch({ type: ActionTypes.UPDATE_ACCOUNT, payload: { ...account, id } }),
    
    deleteAccount: (id) => 
      dispatch({ type: ActionTypes.DELETE_ACCOUNT, payload: id }),
    
    // Recurring transaction actions
    addRecurringTransaction: (recurringTransaction) => 
      dispatch({ type: ActionTypes.ADD_RECURRING_TRANSACTION, payload: recurringTransaction }),
    
    updateRecurringTransaction: (id, recurringTransaction) => 
      dispatch({ type: ActionTypes.UPDATE_RECURRING_TRANSACTION, payload: { ...recurringTransaction, id } }),
    
    deleteRecurringTransaction: (id) => 
      dispatch({ type: ActionTypes.DELETE_RECURRING_TRANSACTION, payload: id }),
    
    // Investment actions
    addInvestment: (investment) => 
      dispatch({ type: ActionTypes.ADD_INVESTMENT, payload: investment }),
    
    updateInvestment: (id, investment) => 
      dispatch({ type: ActionTypes.UPDATE_INVESTMENT, payload: { ...investment, id } }),
    
    // Debt actions
    addDebt: (debt) => 
      dispatch({ type: ActionTypes.ADD_DEBT, payload: debt }),
    
    updateDebt: (id, debt) => 
      dispatch({ type: ActionTypes.UPDATE_DEBT, payload: { ...debt, id } }),
    
    deleteDebt: (id) => 
      dispatch({ type: ActionTypes.DELETE_DEBT, payload: id }),
    
    setCurrentUser: (userId) => 
      dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: userId }),
    
    setFilters: (filters) => 
      dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
    
    clearData: () => 
      dispatch({ type: ActionTypes.CLEAR_DATA }),

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
