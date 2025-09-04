"use client";

import React from 'react';
import { useBalances } from '@/hooks/useBalances';
import BalanceCard from '@/components/BalanceCard';

export default function Dashboard() {
  const {
    mpesa, sbm, coop,
    fetchMpesa, fetchSbm, fetchCoop,
    totalBalance
  } = useBalances();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track all your accounts in one place
        </p>
      </div>
      
      {/* Total Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <h2 className="text-xl font-semibold">Total Balance</h2>
          <p className="text-3xl md:text-4xl font-bold mt-4">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-white/80 text-sm mt-1">Across all your accounts</p>
        </div>
        <div className="p-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
          </span>
          <button 
            onClick={() => {
              fetchMpesa();
              fetchSbm();
              fetchCoop();
            }} 
            className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-800/30 dark:text-indigo-300 rounded-md text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
          >
            Refresh All
          </button>
        </div>
      </div>
      
      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mpesa.data ? (
          <BalanceCard 
            platformName="M-Pesa" 
            accountNumber={mpesa.data.account_number} 
            balance={mpesa.data.balance}
            currency={mpesa.data.currency}
            lastUpdated={mpesa.data.last_updated}
            onRefresh={fetchMpesa}
            isLoading={mpesa.loading}
            type="mpesa"
          />
        ) : mpesa.loading ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg h-52 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold">M-Pesa</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              {mpesa.error || "No data available"}
            </p>
            <button 
              onClick={fetchMpesa}
              className="mt-4 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
            >
              Load Data
            </button>
          </div>
        )}
        
        {sbm.data ? (
          <BalanceCard 
            platformName="SBM Bank" 
            accountNumber={sbm.data.account_number} 
            balance={sbm.data.balance}
            currency={sbm.data.currency}
            lastUpdated={sbm.data.last_updated}
            onRefresh={fetchSbm}
            isLoading={sbm.loading}
            type="sbm"
          />
        ) : sbm.loading ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg h-52 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold">SBM Bank</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              {sbm.error || "No data available"}
            </p>
            <button 
              onClick={fetchSbm}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
            >
              Load Data
            </button>
          </div>
        )}
        
        {coop.data ? (
          <BalanceCard 
            platformName="Co-operative Bank" 
            accountNumber={coop.data.account_number} 
            balance={coop.data.balance}
            currency={coop.data.currency}
            lastUpdated={coop.data.last_updated}
            onRefresh={fetchCoop}
            isLoading={coop.loading}
            type="coop"
          />
        ) : coop.loading ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg h-52 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold">Co-operative Bank</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              {coop.error || "No data available"}
            </p>
            <button 
              onClick={fetchCoop}
              className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-md text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
            >
              Load Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}