/**
 * Utility functions for formatting data
 */

/**
 * Format currency values with Turkish Lira symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '₺')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₺') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0,00`;
  }
  
  const numAmount = Number(amount);
  
  // Format with Turkish locale for proper comma/dot usage
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(numAmount));
  
  const sign = numAmount < 0 ? '-' : '';
  return `${sign}${currency}${formatted}`;
};

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }
  
  const numValue = Number(value);
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
  
  return `${formatted}%`;
};

/**
 * Format date values
 * @param {string|Date} date - The date to format
 * @param {string} locale - Locale for formatting (default: 'tr-TR')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'tr-TR') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format short date values (DD/MM/YYYY)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted short date string
 */
export const formatShortDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return '';
  }
};

/**
 * Format numbers with Turkish locale
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const numValue = Number(value);
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} value - The number to format
 * @returns {string} Formatted compact number string
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const numValue = Number(value);
  
  if (Math.abs(numValue) >= 1000000000) {
    return `${(numValue / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(numValue) >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (Math.abs(numValue) >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  }
  
  return numValue.toString();
};

/**
 * Truncate text to specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - The text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatShortDate,
  formatNumber,
  formatCompactNumber,
  truncateText,
  capitalizeWords
};
