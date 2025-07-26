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

// Calculate total income from transactions (SIMPLIFIED)
export const calculateTotalIncome = (transactions, filters = {}) => {
  // Transactions already include recurring instances from Reports component
  let filteredTransactions = transactions.filter(t => t.type === 'income');
  
  // Apply user filter if specified
  if (filters.user && filters.user !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.userId === filters.user);
  }
  
  // Apply category filter if specified
  if (filters.category && filters.category !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
  }
  
  return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate total expenses from transactions (SIMPLIFIED)
export const calculateTotalExpenses = (transactions, filters = {}) => {
  // Transactions already include recurring instances from Reports component
  let filteredTransactions = transactions.filter(t => t.type === 'expense');
  
  // Apply user filter if specified
  if (filters.user && filters.user !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.userId === filters.user);
  }
  
  // Apply category filter if specified
  if (filters.category && filters.category !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
  }
  
  return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

// Calculate net cash flow (income - expenses) (SIMPLIFIED)
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

// ===== DCA (Dollar Cost Averaging) Functions =====

/**
 * Calculate DCA metrics for an investment with multiple transactions
 * @param {Array} transactions - Array of investment transactions
 * @param {number} currentPricePerUnit - Current market price per unit
 * @returns {Object} DCA metrics
 */
export const calculateDCAMetrics = (transactions, currentPricePerUnit = 0) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalQuantity: 0,
      totalInvested: 0,
      averageCost: 0,
      currentTotalValue: 0,
      totalGainLoss: 0,
      gainLossPercentage: 0
    };
  }

  // Calculate totals
  const totalQuantity = transactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
  const totalInvested = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
  
  // Calculate average cost (ortalama maliyet)
  // Formül: ortalama_maliyet = toplam_maliyet / toplam_lot
  const averageCost = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
  
  // Calculate current total value
  // Formül: güncel_değer = toplam_lot * güncel_fiyat
  const currentTotalValue = currentPricePerUnit * totalQuantity;
  
  // Calculate gain/loss (kar/zarar)
  // Formül: toplam_kazanç = güncel_değer - toplam_maliyet
  // Alternatif: toplam_kazanç = (güncel_fiyat - ortalama_maliyet) * toplam_lot
  const totalGainLoss = currentTotalValue - totalInvested;
  const alternativeGainLoss = (currentPricePerUnit - averageCost) * totalQuantity;
  
  // Calculate gain/loss percentage (kar/zarar oranı)
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  
  // DEBUG: DCA hesaplama adımları
  console.log('📊 DCA CALCULATION STEPS:');
  console.log('📊 Transactions:', transactions.map(tx => `${tx.quantity} lot × ${tx.pricePerUnit} TL = ${tx.totalAmount} TL`));
  console.log('📊 toplam_lot =', totalQuantity);
  console.log('📊 toplam_maliyet =', totalInvested, 'TL');
  console.log('📊 ortalama_maliyet = toplam_maliyet / toplam_lot =', totalInvested, '/', totalQuantity, '=', averageCost.toFixed(4), 'TL');
  console.log('📊 güncel_fiyat =', currentPricePerUnit, 'TL');
  console.log('📊 güncel_değer = toplam_lot * güncel_fiyat =', totalQuantity, '*', currentPricePerUnit, '=', currentTotalValue, 'TL');
  console.log('📊 toplam_kazanç = güncel_değer - toplam_maliyet =', currentTotalValue, '-', totalInvested, '=', totalGainLoss, 'TL');
  console.log('📊 alternatif_kazanç = (güncel_fiyat - ortalama_maliyet) * toplam_lot =', `(${currentPricePerUnit} - ${averageCost.toFixed(4)}) * ${totalQuantity} =`, alternativeGainLoss.toFixed(2), 'TL');
  console.log('📊 kazanç_oranı =', gainLossPercentage.toFixed(2), '%');
  
  return {
    totalQuantity: parseFloat(totalQuantity.toFixed(4)),
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    averageCost: parseFloat(averageCost.toFixed(4)),
    currentTotalValue: parseFloat(currentTotalValue.toFixed(2)),
    totalGainLoss: parseFloat(totalGainLoss.toFixed(2)),
    gainLossPercentage: parseFloat(gainLossPercentage.toFixed(2))
  };
};

/**
 * Add a new transaction to an investment and recalculate DCA metrics
 * @param {Object} investment - Existing investment object
 * @param {Object} newTransaction - New transaction to add
 * @param {number} currentPricePerUnit - Current market price per unit
 * @returns {Object} Updated investment with DCA metrics
 */
export const addTransactionToInvestment = (investment, newTransaction, currentPricePerUnit = 0) => {
  // Ensure transactions array exists
  let existingTransactions = investment.transactions || [];
  
  // KRITIK DÜZELTME: Eğer henüz transaction yoksa, mevcut yatırım verilerini ilk transaction olarak ekle
  if (existingTransactions.length === 0 && investment.amount && parseFloat(investment.amount) > 0) {
    console.log('🔧 İLK TRANSACTION OLUŞTURULUYOR - Mevcut yatırım verileri korunuyor');
    console.log('🔧 Investment amount:', investment.amount);
    console.log('🔧 Investment currentValue:', investment.currentValue);
    
    // Mevcut yatırım verilerinden ilk transaction'ı oluştur
    const quantity = parseFloat(investment.quantity || investment.units || investment.lots || 1);
    const totalAmount = parseFloat(investment.amount);
    const pricePerUnit = quantity > 0 ? totalAmount / quantity : totalAmount;
    
    const initialTransaction = {
      id: `tx-initial-${investment.id}`,
      date: investment.purchaseDate || new Date().toISOString().split('T')[0],
      quantity: quantity,
      pricePerUnit: pricePerUnit,
      totalAmount: totalAmount,
      notes: investment.notes || 'İlk yatırım (mevcut kayıt)',
      createdAt: investment.createdAt || new Date().toISOString()
    };
    
    existingTransactions = [initialTransaction];
    console.log('🔧 İlk transaction oluşturuldu:', initialTransaction);
  }
  
  // Create new transaction with ID and timestamp
  const transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: newTransaction.date || new Date().toISOString().split('T')[0],
    quantity: parseFloat(newTransaction.quantity || 0),
    pricePerUnit: parseFloat(newTransaction.pricePerUnit || 0),
    totalAmount: parseFloat(newTransaction.totalAmount || (newTransaction.quantity * newTransaction.pricePerUnit)),
    notes: newTransaction.notes || '',
    createdAt: new Date().toISOString()
  };
  
  // Add new transaction
  const allTransactions = [...existingTransactions, transaction];
  
  console.log('🔧 TÜM TRANSACTIONS:', allTransactions.length, 'adet');
  console.log('🔧 İlk transaction:', allTransactions[0]);
  console.log('🔧 Yeni transaction:', transaction);
  
  // Calculate DCA metrics
  const dcaMetrics = calculateDCAMetrics(allTransactions, currentPricePerUnit);
  
  console.log('🔄 DCA TRANSACTION ADDED - Debug Info:');
  console.log('🔄 Original investment amount:', investment.amount);
  console.log('🔄 Original investment currentValue:', investment.currentValue);
  console.log('🔄 New transaction amount:', transaction.totalAmount);
  console.log('🔄 DCA calculated totalInvested:', dcaMetrics.totalInvested);
  console.log('🔄 DCA calculated currentTotalValue:', dcaMetrics.currentTotalValue);
  
  // Return updated investment
  const updatedInvestment = {
    ...investment,
    transactions: allTransactions,
    // Update DCA fields
    totalQuantity: dcaMetrics.totalQuantity,
    averageCost: dcaMetrics.averageCost,
    totalInvested: dcaMetrics.totalInvested,
    currentTotalValue: dcaMetrics.currentTotalValue,
    totalGainLoss: dcaMetrics.totalGainLoss,
    gainLossPercentage: dcaMetrics.gainLossPercentage,
    // Update legacy fields for compatibility
    amount: dcaMetrics.totalInvested,
    currentValue: dcaMetrics.currentTotalValue,
    updatedAt: new Date().toISOString()
  };
  
  console.log('🔄 Updated investment amount:', updatedInvestment.amount);
  console.log('🔄 Updated investment currentValue:', updatedInvestment.currentValue);
  console.log('🔄 Updated investment object:', updatedInvestment);
  
  return updatedInvestment;
};

/**
 * Migrate existing investment to DCA format (backward compatibility)
 * @param {Object} investment - Legacy investment object
 * @returns {Object} Investment with DCA structure
 */
export const migrateInvestmentToDCA = (investment) => {
  // If already has transactions, return as is
  if (investment.transactions && investment.transactions.length > 0) {
    return investment;
  }
  
  // Create initial transaction from legacy data
  const quantity = investment.quantity || 1;
  const totalAmount = investment.amount || investment.currentValue || 0;
  const pricePerUnit = quantity > 0 ? totalAmount / quantity : totalAmount;
  
  const initialTransaction = {
    id: `tx-initial-${investment.id}`,
    date: investment.purchaseDate || new Date().toISOString().split('T')[0],
    quantity: quantity,
    pricePerUnit: pricePerUnit,
    totalAmount: totalAmount,
    notes: investment.notes || 'İlk yatırım',
    createdAt: investment.createdAt || new Date().toISOString()
  };
  
  // Calculate current price per unit from currentValue
  const currentPricePerUnit = investment.currentValue && quantity > 0 
    ? investment.currentValue / quantity 
    : pricePerUnit;
  
  // Calculate DCA metrics
  const dcaMetrics = calculateDCAMetrics([initialTransaction], currentPricePerUnit);
  
  return {
    ...investment,
    transactions: [initialTransaction],
    totalQuantity: dcaMetrics.totalQuantity,
    averageCost: dcaMetrics.averageCost,
    totalInvested: dcaMetrics.totalInvested,
    currentTotalValue: dcaMetrics.currentTotalValue,
    totalGainLoss: dcaMetrics.totalGainLoss,
    gainLossPercentage: dcaMetrics.gainLossPercentage
  };
};

/**
 * Update DCA metrics for an investment when current price changes
 * @param {Object} investment - Investment with transactions
 * @param {number} newCurrentPricePerUnit - New current market price per unit
 * @returns {Object} Updated investment with recalculated DCA metrics
 */
export const updateInvestmentDCAMetrics = (investment, newCurrentPricePerUnit) => {
  if (!investment.transactions || investment.transactions.length === 0) {
    return investment;
  }
  
  const dcaMetrics = calculateDCAMetrics(investment.transactions, newCurrentPricePerUnit);
  
  return {
    ...investment,
    currentTotalValue: dcaMetrics.currentTotalValue,
    totalGainLoss: dcaMetrics.totalGainLoss,
    gainLossPercentage: dcaMetrics.gainLossPercentage,
    // Update legacy fields for compatibility
    currentValue: dcaMetrics.currentTotalValue,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Format DCA display text for UI
 * @param {Object} dcaMetrics - DCA metrics object
 * @returns {Object} Formatted display strings
 */
export const formatDCADisplay = (dcaMetrics) => {
  return {
    totalQuantity: dcaMetrics.totalQuantity.toLocaleString('tr-TR', { maximumFractionDigits: 4 }),
    averageCost: formatCurrency(dcaMetrics.averageCost),
    totalInvested: formatCurrency(dcaMetrics.totalInvested),
    currentTotalValue: formatCurrency(dcaMetrics.currentTotalValue),
    totalGainLoss: formatCurrency(dcaMetrics.totalGainLoss),
    gainLossPercentage: `${dcaMetrics.gainLossPercentage >= 0 ? '+' : ''}${dcaMetrics.gainLossPercentage.toFixed(2)}%`
  };
};
