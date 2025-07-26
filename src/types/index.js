// Data models and types for FinMate application

export const INCOME_CATEGORIES = {
  SALARY: 'Maaş',
  FREELANCE: 'Serbest Çalışma',
  RENTAL: 'Kira Geliri',
  INVESTMENT: 'Yatırım Getirisi',
  DIVIDEND: 'Temettü',
  INTEREST: 'Faiz',
  BONUS: 'Bonus',
  OTHER: 'Diğer'
};

export const EXPENSE_CATEGORIES = {
  HOUSING: 'Konut',
  UTILITIES: 'Faturalar',
  FOOD: 'Gıda & Market',
  TRANSPORTATION: 'Ulaşım',
  HEALTHCARE: 'Sağlık',
  EDUCATION: 'Eğitim',
  ENTERTAINMENT: 'Eğlence',
  SHOPPING: 'Alışveriş',
  DEBT_PAYMENT: 'Kredi Ödemesi',
  INSURANCE: 'Sigorta',
  SAVINGS: 'Birikim',
  OTHER: 'Diğer'
};

export const INVESTMENT_TYPES = {
  STOCKS: 'Hisse Senedi',
  BONDS: 'Tahvil',
  MUTUAL_FUNDS: 'Yatırım Fonu',
  CRYPTO: 'Kripto Para',
  GOLD: 'Altın',
  FOREX: 'Döviz',
  REAL_ESTATE: 'Gayrimenkul',
  DEPOSIT: 'Vadeli Mevduat',
  OTHER: 'Diğer'
};

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Default data structure for a transaction
export const createTransaction = (type, data = {}) => ({
  id: data.id || crypto.randomUUID(),
  type, // 'income' or 'expense'
  amount: data.amount || 0,
  category: data.category || '',
  description: data.description || '',
  date: data.date || new Date().toISOString().split('T')[0],
  userId: data.userId || 'default',
  recurring: data.recurring || false,
  recurringPeriod: data.recurringPeriod || null, // 'monthly', 'yearly', 'weekly'
  recurringEndDate: data.recurringEndDate || null, // when recurring should stop
  isRecurringInstance: data.isRecurringInstance || false, // if this is auto-generated from recurring
  parentRecurringId: data.parentRecurringId || null, // reference to original recurring transaction
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Default data structure for an investment
export const createInvestment = (data = {}) => ({
  id: data.id || crypto.randomUUID(),
  name: data.name || '',
  type: data.type || '',
  amount: data.amount || 0,
  currentValue: data.currentValue || 0,
  purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
  userId: data.userId || 'default',
  notes: data.notes || '',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // TÜM FORM ALANLARINI KAYDET - ALIŞ FİYATI VE DETAYLAR İÇİN
  ...data // Bu satır tüm ek alanları (purchasePrice, units, fundCode vb.) investment objesine ekler
});

// Default data structure for a financial goal
export const createGoal = (data = {}) => ({
  id: data.id || crypto.randomUUID(),
  title: data.title || '',
  description: data.description || '',
  targetAmount: data.targetAmount || 0,
  currentAmount: data.currentAmount || 0,
  targetDate: data.targetDate || '',
  category: data.category || 'SAVINGS',
  userId: data.userId || 'default',
  isCompleted: data.isCompleted || false,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Default data structure for a user/family member
export const createUser = (data = {}) => ({
  id: data.id || crypto.randomUUID(),
  name: data.name || '',
  email: data.email || '',
  role: data.role || 'member', // 'admin', 'member'
  isActive: data.isActive !== undefined ? data.isActive : true,
  createdAt: data.createdAt || new Date().toISOString()
});

export const GOAL_CATEGORIES = {
  SAVINGS: 'Birikim',
  INVESTMENT: 'Yatırım',
  DEBT_PAYOFF: 'Borç Ödeme',
  PURCHASE: 'Alım Hedefi',
  EMERGENCY_FUND: 'Acil Durum Fonu',
  RETIREMENT: 'Emeklilik',
  EDUCATION: 'Eğitim',
  TRAVEL: 'Seyahat',
  OTHER: 'Diğer'
};

export const RECURRING_PERIODS = {
  WEEKLY: 'Haftalık',
  MONTHLY: 'Aylık',
  QUARTERLY: 'Üç Aylık',
  YEARLY: 'Yıllık'
};
