"use client";

import React, { useState } from 'react';
import ExportModal, { ExportFormat } from '@/components/ExportModal';
import { exportTransactionsAsCSV, exportTransactionsAsJSON } from '@/utils/exportHelpers';
import Notification, { NotificationType } from '@/components/Notification';
import { useBalances } from '@/hooks/useBalances';

export default function TransactionsPage() {
  const { transactions, fetchTransactions } = useBalances();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchTransactions();
      showNotification('success', 'Transactions refreshed successfully');
    } catch (error: unknown) {
      showNotification('error', `Failed to refresh transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = (format: ExportFormat) => {
    try {
      if (!transactions.data.length) {
        showNotification('info', 'No transactions available to export');
        return;
      }

      // Map transaction data to the required Transaction interface with strict account types
      const exportData = transactions.data.map((t, index) => {
        // Determine the account type with strict literal types
        let accountType: 'mpesa' | 'sbm' | 'coop';
        if (t.accountId.includes('mpesa')) {
          accountType = 'mpesa';
        } else if (t.accountId.includes('sbm')) {
          accountType = 'sbm';
        } else {
          accountType = 'coop'; // Default to coop if not matched
        }

        return {
          id: `export-${index}`, // Generate an id since it's required by the interface
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type,
          account: accountType
        };
      });

      if (format === 'csv') {
        exportTransactionsAsCSV(exportData, `transactions_${new Date().toISOString().slice(0, 10)}`);
      } else if (format === 'json') {
        exportTransactionsAsJSON(exportData, `transactions_${new Date().toISOString().slice(0, 10)}`);
      }
      
      showNotification('success', `Transactions exported successfully as ${format.toUpperCase()}`);
    } catch (error: unknown) {
      console.error('Export error:', error);
      showNotification('error', `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to determine account type from accountId
  const getAccountTypeFromId = (accountId: string): string => {
    if (accountId.includes('mpesa')) return 'mpesa';
    if (accountId.includes('sbm')) return 'sbm';
    if (accountId.includes('coop')) return 'coop';
    return 'other';
  };

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
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View your recent financial activities
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing || transactions.loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isRefreshing || transactions.loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : "Refresh"}
            </button>
            <button 
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Export
            </button>
          </div>
        </div>
        
        {transactions.error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">
              {transactions.error}
            </p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Account
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>No transactions found.</p>
                    <button 
                      onClick={handleRefresh} 
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Refresh
                    </button>
                  </td>
                </tr>
              ) : (
                transactions.data.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getAccountLabel(getAccountTypeFromId(transaction.accountId))}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {transactions.data.length} transaction{transactions.data.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-2">
            <button 
              disabled={true}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              disabled={true}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
}