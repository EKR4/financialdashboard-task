"use client";

import React, { useState } from 'react';
import { MpesaBalance, SbmBalance, CoopBalance } from '@/types';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: 'mpesa' | 'sbm' | 'coop';
  accountData: MpesaBalance | SbmBalance | CoopBalance | null;
}

export default function AccountDetailsModal({ 
  isOpen, 
  onClose, 
  accountType, 
  accountData 
}: AccountDetailsModalProps) {
  if (!isOpen || !accountData) return null;

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'mpesa':
        return 'M-Pesa';
      case 'sbm':
        return 'SBM Bank';
      case 'coop':
        return 'Co-operative Bank';
      default:
        return type;
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getAccountTypeLabel(accountType)} Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Account Information
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                <span className="text-gray-900 dark:text-white font-medium">{accountData.account_number}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(accountData.balance)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                <span className="text-gray-900 dark:text-white font-medium">{accountData.currency}</span>
              </div>
              
              {'account_type' in accountData && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountData.account_type}</span>
                </div>
              )}
              
              {'branch' in accountData && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountData.branch}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatDate(accountData.last_updated)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}