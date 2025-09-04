/**
 * Utility functions for exporting data in different formats
 */

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  account: 'mpesa' | 'sbm' | 'coop';
}

/**
 * Converts a date string to a formatted date for export
 */
const formatDateForExport = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Converts an array of transactions to a CSV string
 */
export const transactionsToCSV = (transactions: Transaction[]): string => {
  // Define CSV headers
  const headers = ['Date', 'Description', 'Account', 'Type', 'Amount'];
  
  // Convert transactions to CSV rows
  const rows = transactions.map(transaction => [
    formatDateForExport(transaction.date),
    transaction.description,
    getAccountLabel(transaction.account),
    transaction.type === 'credit' ? 'Credit' : 'Debit',
    transaction.amount.toString()
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Gets a human-readable label for an account type
 */
const getAccountLabel = (account: string): string => {
  switch (account) {
    case 'mpesa':
      return 'M-Pesa';
    case 'sbm':
      return 'SBM Bank';
    case 'coop':
      return 'Co-operative Bank';
    default:
      return account;
  }
};

/**
 * Exports transactions as a CSV file
 */
export const exportTransactionsAsCSV = (transactions: Transaction[], fileName = 'transactions'): void => {
  const csvContent = transactionsToCSV(transactions);
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export transactions as JSON
 */
export const exportTransactionsAsJSON = (transactions: Transaction[], fileName = 'transactions'): void => {
  // Format the transactions for JSON export (we can apply any transformations here if needed)
  const formattedData = transactions.map(t => ({
    ...t,
    date: formatDateForExport(t.date),
    account: getAccountLabel(t.account),
    type: t.type === 'credit' ? 'Credit' : 'Debit'
  }));
  
  // Create a Blob containing the JSON data
  const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: 'application/json' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.json`);
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Filter transactions by date range, account, or type
 */
export const filterTransactions = (
  transactions: Transaction[],
  filters: {
    startDate?: Date,
    endDate?: Date,
    account?: 'mpesa' | 'sbm' | 'coop',
    type?: 'credit' | 'debit'
  }
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    // Filter by start date
    if (filters.startDate && transactionDate < filters.startDate) {
      return false;
    }
    
    // Filter by end date
    if (filters.endDate && transactionDate > filters.endDate) {
      return false;
    }
    
    // Filter by account
    if (filters.account && transaction.account !== filters.account) {
      return false;
    }
    
    // Filter by transaction type
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }
    
    return true;
  });
};