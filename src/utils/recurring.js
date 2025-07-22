import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, format } from 'date-fns';
import { createTransaction } from '../types';

// Generate next date for recurring transaction
export const getNextRecurringDate = (currentDate, period) => {
  const date = new Date(currentDate);
  
  switch (period) {
    case 'WEEKLY':
      return addWeeks(date, 1);
    case 'MONTHLY':
      return addMonths(date, 1);
    case 'QUARTERLY':
      return addMonths(date, 3);
    case 'YEARLY':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
};

// Generate recurring transactions for a given period
export const generateRecurringTransactions = (recurringTransaction, startDate, endDate) => {
  const transactions = [];
  let currentDate = new Date(recurringTransaction.date);
  const end = new Date(endDate);
  const start = new Date(startDate);
  
  // If transaction has an end date, use the earlier of the two
  const transactionEndDate = recurringTransaction.recurringEndDate 
    ? new Date(recurringTransaction.recurringEndDate) 
    : end;
  const actualEndDate = isBefore(transactionEndDate, end) ? transactionEndDate : end;
  
  while (isBefore(currentDate, actualEndDate) || currentDate.getTime() === actualEndDate.getTime()) {
    // Only include transactions within our date range
    if ((isAfter(currentDate, start) || currentDate.getTime() === start.getTime()) &&
        (isBefore(currentDate, actualEndDate) || currentDate.getTime() === actualEndDate.getTime())) {
      
      const generatedTransaction = createTransaction(recurringTransaction.type, {
        ...recurringTransaction,
        id: `${recurringTransaction.id}_${format(currentDate, 'yyyy-MM-dd')}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        isRecurringInstance: true,
        parentRecurringId: recurringTransaction.id,
        description: `${recurringTransaction.description} (Otomatik - ${format(currentDate, 'MM/yyyy')})`
      });
      
      transactions.push(generatedTransaction);
    }
    
    currentDate = getNextRecurringDate(currentDate, recurringTransaction.recurringPeriod);
  }
  
  return transactions;
};

// Get all transactions including generated recurring ones for a date range
export const getTransactionsWithRecurring = (transactions, startDate, endDate) => {
  const regularTransactions = transactions.filter(t => !t.recurring);
  const recurringTemplates = transactions.filter(t => t.recurring);
  
  let allTransactions = [...regularTransactions];
  
  // Generate instances for each recurring transaction
  recurringTemplates.forEach(recurringTransaction => {
    const generatedTransactions = generateRecurringTransactions(
      recurringTransaction, 
      startDate, 
      endDate
    );
    allTransactions = allTransactions.concat(generatedTransactions);
  });
  
  return allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Calculate projected balance for future months
export const calculateProjectedBalance = (transactions, currentBalance, months = 12) => {
  const today = new Date();
  const projections = [];
  
  for (let i = 0; i < months; i++) {
    const monthStart = addMonths(today, i);
    const monthEnd = addMonths(monthStart, 1);
    
    const monthTransactions = getTransactionsWithRecurring(
      transactions, 
      monthStart, 
      monthEnd
    );
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netFlow = monthIncome - monthExpenses;
    const projectedBalance = i === 0 ? currentBalance + netFlow : projections[i-1].balance + netFlow;
    
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const monthName = monthNames[monthStart.getMonth()] + ' ' + monthStart.getFullYear();
    
    projections.push({
      month: format(monthStart, 'yyyy-MM'),
      monthName: monthName,
      income: monthIncome,
      expenses: monthExpenses,
      netFlow,
      balance: projectedBalance
    });
  }
  
  return projections;
};

// Get user-specific projections
export const getUserProjections = (transactions, userId, currentBalance = 0, months = 12) => {
  const userTransactions = transactions.filter(t => t.userId === userId);
  return calculateProjectedBalance(userTransactions, currentBalance, months);
};

// Get household (all users) projections
export const getHouseholdProjections = (transactions, currentBalance = 0, months = 12) => {
  return calculateProjectedBalance(transactions, currentBalance, months);
};
