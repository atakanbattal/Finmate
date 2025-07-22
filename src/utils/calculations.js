import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, addMonths, addWeeks, addYears, isBefore, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';

// Date range utilities
export const getDateRange = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'thisMonth':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      };
    case 'thisYear':
      return {
        start: startOfYear(now),
        end: endOfYear(now)
      };
    case 'lastYear':
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear)
      };
    case 'all':
    default:
      return {
        start: new Date('2020-01-01'),
        end: new Date('2030-12-31')
      };
  }
};

// Generate recurring transaction instances for a given date range
export const generateRecurringInstances = (transaction, startDate, endDate) => {
  if (!transaction.recurring || !transaction.recurringPeriod) {
    return [];
  }

  const instances = [];
  const transactionDate = parseISO(transaction.date);
  const rangeStart = parseISO(startDate.toISOString().split('T')[0]);
  const rangeEnd = parseISO(endDate.toISOString().split('T')[0]);
  const recurringEnd = transaction.recurringEndDate ? parseISO(transaction.recurringEndDate) : null;

  // Start from the NEXT occurrence, not the original date
  let currentDate = transactionDate;
  
  // Move to first occurrence based on period
  switch (transaction.recurringPeriod) {
    case 'WEEKLY':
      currentDate = addWeeks(currentDate, 1);
      break;
    case 'MONTHLY':
      currentDate = addMonths(currentDate, 1);
      break;
    case 'QUARTERLY':
      currentDate = addMonths(currentDate, 3);
      break;
    case 'YEARLY':
      currentDate = addYears(currentDate, 1);
      break;
    default:
      return instances; // Invalid period, return empty
  }

  // Generate instances within the date range
  while (!isAfter(currentDate, rangeEnd)) {
    // Check if we've passed the recurring end date
    if (recurringEnd && isAfter(currentDate, recurringEnd)) {
      break;
    }
    
    // Only include if the current date is within our target range
    if (!isBefore(currentDate, rangeStart)) {
      instances.push({
        ...transaction,
        id: `${transaction.id}_${format(currentDate, 'yyyy-MM-dd')}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        isRecurringInstance: true,
        parentRecurringId: transaction.id
      });
    }

    // Move to next occurrence based on period
    switch (transaction.recurringPeriod) {
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'QUARTERLY':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'YEARLY':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        break;
    }
  }

  return instances;
};

// Get all transactions including recurring instances for a date range
export const getTransactionsWithRecurring = (transactions, startDate, endDate) => {
  const nonRecurringTransactions = [];
  const recurringInstances = [];
  
  // Separate recurring and non-recurring transactions
  transactions.forEach(transaction => {
    if (transaction.recurring && !transaction.isRecurringInstance) {
      // For recurring transactions, only include the original if it's within the date range
      const transactionDate = parseISO(transaction.date);
      const rangeStart = parseISO(startDate.toISOString().split('T')[0]);
      const rangeEnd = parseISO(endDate.toISOString().split('T')[0]);
      
      // Include original transaction if it's within range
      if (!isBefore(transactionDate, rangeStart) && !isAfter(transactionDate, rangeEnd)) {
        nonRecurringTransactions.push(transaction);
      }
      
      // Generate recurring instances (excluding the original date)
      const instances = generateRecurringInstances(transaction, startDate, endDate);
      recurringInstances.push(...instances);
    } else {
      // Non-recurring transactions are always included
      nonRecurringTransactions.push(transaction);
    }
  });
  
  return [...nonRecurringTransactions, ...recurringInstances];
};

// Filter transactions by date range
export const filterTransactionsByDate = (transactions, dateRange) => {
  const { start, end } = getDateRange(dateRange);
  
  // Get all transactions including recurring instances
  const allTransactions = getTransactionsWithRecurring(transactions, start, end);
  
  return allTransactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    return isWithinInterval(transactionDate, { start, end });
  });
};

// Calculate total income from transactions
export const calculateTotalIncome = (transactions, filters = {}) => {
  let filteredTransactions = transactions.filter(t => t.type === 'income');
  
  if (filters.dateRange && filters.dateRange !== 'all') {
    filteredTransactions = filterTransactionsByDate(filteredTransactions, filters.dateRange);
  } else if (filters.dateRange === 'all') {
    // For 'all' range, still include recurring instances for a reasonable period
    const start = new Date('2020-01-01');
    const end = new Date('2030-12-31');
    filteredTransactions = getTransactionsWithRecurring(filteredTransactions, start, end)
      .filter(t => t.type === 'income');
  }
  
  if (filters.user && filters.user !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.userId === filters.user);
  }
  
  if (filters.category && filters.category !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
  }
  
  return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate total expenses from transactions
export const calculateTotalExpenses = (transactions, filters = {}) => {
  let filteredTransactions = transactions.filter(t => t.type === 'expense');
  
  if (filters.dateRange && filters.dateRange !== 'all') {
    filteredTransactions = filterTransactionsByDate(filteredTransactions, filters.dateRange);
  } else if (filters.dateRange === 'all') {
    // For 'all' range, still include recurring instances for a reasonable period
    const start = new Date('2020-01-01');
    const end = new Date('2030-12-31');
    filteredTransactions = getTransactionsWithRecurring(filteredTransactions, start, end)
      .filter(t => t.type === 'expense');
  }
  
  if (filters.user && filters.user !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.userId === filters.user);
  }
  
  if (filters.category && filters.category !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
  }
  
  return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate net cash flow
export const calculateNetCashFlow = (transactions, filters = {}) => {
  const income = calculateTotalIncome(transactions, filters);
  const expenses = calculateTotalExpenses(transactions, filters);
  return income - expenses;
};

// Helper function to calculate dynamic current value for an investment
const calculateDynamicCurrentValue = (investment, investmentTypes) => {
  let dynamicCurrentValue = investment.currentValue || investment.amount;
  
  // Dinamik hesaplama yap
  if (investment.type && investment.data && investmentTypes && investmentTypes[investment.type]) {
    try {
      const dynamicCalc = investmentTypes[investment.type].calculate(
        investment.data, 
        investment.purchaseDate, 
        investment.amount
      );
      dynamicCurrentValue = dynamicCalc.currentValue || investment.amount;
    } catch (error) {
      console.error(`Error calculating ${investment.type}:`, error);
      dynamicCurrentValue = investment.currentValue || investment.amount;
    }
  }
  
  return dynamicCurrentValue;
};

// Calculate investment portfolio value (basic version - for backward compatibility)
export const calculatePortfolioValue = (investments) => {
  return investments.reduce((total, investment) => total + (investment.currentValue || investment.amount), 0);
};

// Calculate investment portfolio value with dynamic calculation
export const calculatePortfolioValueDynamic = (investments, investmentTypes) => {
  return investments.reduce((total, investment) => {
    const dynamicCurrentValue = calculateDynamicCurrentValue(investment, investmentTypes);
    return total + dynamicCurrentValue;
  }, 0);
};

// Calculate investment gains/losses (basic version - for backward compatibility)
export const calculateInvestmentGains = (investments) => {
  return investments.reduce((total, investment) => {
    return total + ((investment.currentValue || investment.amount) - investment.amount);
  }, 0);
};

// Calculate investment gains/losses with dynamic calculation
export const calculateInvestmentGainsDynamic = (investments, investmentTypes) => {
  return investments.reduce((total, investment) => {
    const dynamicCurrentValue = calculateDynamicCurrentValue(investment, investmentTypes);
    const gain = dynamicCurrentValue - investment.amount;
    return total + gain;
  }, 0);
};

// Calculate goal progress
export const calculateGoalProgress = (goal) => {
  if (goal.targetAmount === 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
};

// Group transactions by category
export const groupTransactionsByCategory = (transactions, type = null) => {
  let filteredTransactions = transactions;
  
  if (type) {
    filteredTransactions = transactions.filter(t => t.type === type);
  }
  
  return filteredTransactions.reduce((groups, transaction) => {
    const category = transaction.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(transaction);
    return groups;
  }, {});
};

// Get category totals
export const getCategoryTotals = (transactions, type = null) => {
  const grouped = groupTransactionsByCategory(transactions, type);
  
  return Object.entries(grouped).map(([category, categoryTransactions]) => ({
    category,
    total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
    count: categoryTransactions.length
  })).sort((a, b) => b.total - a.total);
};

// Get monthly summary data
export const getMonthlyData = (transactions, year = new Date().getFullYear()) => {
  const months = [];
  
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Get all transactions including recurring instances for this month
    const allTransactions = getTransactionsWithRecurring(transactions, monthStart, monthEnd);
    
    const monthTransactions = allTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    months.push({
      month: format(monthStart, 'MMM', { locale: tr }),
      monthNumber: month + 1,
      income,
      expenses,
      netFlow: income - expenses
    });
  }
  
  return months;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

// Calculate savings rate
export const calculateSavingsRate = (income, expenses) => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

// Get recent transactions
export const getRecentTransactions = (transactions, limit = 10) => {
  return [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};
