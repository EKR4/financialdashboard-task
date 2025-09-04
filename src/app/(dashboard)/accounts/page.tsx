"use client";

import { useBalances } from '@/hooks/useBalances';
import AccountDetailsModal from '@/components/AccountDetailsModal';
import AddAccountModal from '@/components/AddAccountModal';
import Notification, { NotificationType } from '@/components/Notification';
import { createClient } from '@/utils/supabase/client';
import React, { useState } from 'react';

export default function AccountsPage() {
  const { mpesa, sbm, coop, fetchMpesa, fetchSbm, fetchCoop } = useBalances();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<'mpesa' | 'sbm' | 'coop' | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });
  
  const supabase = createClient();

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

  const handleViewDetails = (accountType: 'mpesa' | 'sbm' | 'coop') => {
    setSelectedAccountType(accountType);
    setDetailsModalOpen(true);
  };

  const handleUnlinkAccount = async (accountType: string) => {
    try {
      setIsUnlinking(accountType);
      
      // Get the user's account from Supabase
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('account_type', accountType)
        .eq('is_active', true)
        .single();
      
      if (accountError || !account) {
        throw new Error('Account not found');
      }
      
      // Update the account to inactive
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', account.id);
      
      if (updateError) {
        throw updateError;
      }
      
      showNotification('success', `${getAccountTypeLabel(accountType)} unlinked successfully`);
      
      // Refresh data
      if (accountType === 'mpesa') await fetchMpesa();
      else if (accountType === 'sbm') await fetchSbm();
      else if (accountType === 'coop') await fetchCoop();
      
    } catch (error: any) {
      showNotification('error', `Failed to unlink account: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUnlinking(null);
    }
  };

  const handleAddAccount = async (accountType: string, accountNumber: string, additionalData?: Record<string, string>) => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return Promise.reject(new Error('Not authenticated'));
      }
      
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('account_type', accountType)
        .eq('account_number', accountNumber)
        .eq('is_active', true)
        .maybeSingle();
      
      if (existingAccount) {
        return Promise.reject(new Error('This account is already linked'));
      }
      
      // Insert the new account
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: session.user.id,
          account_type: accountType,
          account_number: accountNumber,
          additional_data: additionalData || {},
          is_active: true
        })
        .select('id')
        .single();
      
      if (accountError || !newAccount) {
        throw accountError || new Error('Failed to create account');
      }
      
      // Create initial balance entry
      const { error: balanceError } = await supabase
        .from('balances')
        .insert({
          account_id: newAccount.id,
          amount: 0, // Initial balance
          currency: 'KES',
          last_updated: new Date().toISOString()
        });
      
      if (balanceError) {
        // If balance creation fails, remove the account
        await supabase.from('accounts').delete().eq('id', newAccount.id);
        throw balanceError;
      }
      
      showNotification('success', `${getAccountTypeLabel(accountType)} linked successfully`);
      
      // Refresh data
      if (accountType === 'mpesa') await fetchMpesa();
      else if (accountType === 'sbm') await fetchSbm();
      else if (accountType === 'coop') await fetchCoop();
      
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  };

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

  const getAccountData = (type: 'mpesa' | 'sbm' | 'coop') => {
    switch (type) {
      case 'mpesa':
        return mpesa.data;
      case 'sbm':
        return sbm.data;
      case 'coop':
        return coop.data;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Linked Accounts</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your connected financial accounts
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Accounts</h2>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* M-Pesa Account */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">M-Pesa</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Account: {mpesa.data?.account_number || "Not available"}
              </p>
              {mpesa.data && (
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                </div>
              )}
            </div>
            <div className="mt-3 sm:mt-0 space-x-2">
              <button 
                onClick={() => handleViewDetails('mpesa')}
                disabled={!mpesa.data || mpesa.loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Details
              </button>
              <button 
                onClick={() => handleUnlinkAccount('mpesa')}
                disabled={!mpesa.data || mpesa.loading || isUnlinking === 'mpesa'}
                className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlinking === 'mpesa' ? 'Unlinking...' : 'Unlink'}
              </button>
            </div>
          </div>

          {/* SBM Bank Account */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">SBM Bank</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Account: {sbm.data?.account_number || "Not available"}
                {sbm.data?.account_type && ` • ${sbm.data.account_type}`}
              </p>
              {sbm.data && (
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                </div>
              )}
            </div>
            <div className="mt-3 sm:mt-0 space-x-2">
              <button 
                onClick={() => handleViewDetails('sbm')}
                disabled={!sbm.data || sbm.loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Details
              </button>
              <button 
                onClick={() => handleUnlinkAccount('sbm')}
                disabled={!sbm.data || sbm.loading || isUnlinking === 'sbm'}
                className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlinking === 'sbm' ? 'Unlinking...' : 'Unlink'}
              </button>
            </div>
          </div>

          {/* Co-operative Bank Account */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Co-operative Bank</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Account: {coop.data?.account_number || "Not available"}
                {coop.data?.branch && ` • ${coop.data.branch} Branch`}
              </p>
              {coop.data && (
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                </div>
              )}
            </div>
            <div className="mt-3 sm:mt-0 space-x-2">
              <button 
                onClick={() => handleViewDetails('coop')}
                disabled={!coop.data || coop.loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Details
              </button>
              <button 
                onClick={() => handleUnlinkAccount('coop')}
                disabled={!coop.data || coop.loading || isUnlinking === 'coop'}
                className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlinking === 'coop' ? 'Unlinking...' : 'Unlink'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Link a New Account</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Connect another financial account to track all your finances in one place.
        </p>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Account
        </button>
      </div>

      {/* Account Details Modal */}
      {selectedAccountType && (
        <AccountDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          accountType={selectedAccountType}
          accountData={getAccountData(selectedAccountType)}
        />
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddAccount={handleAddAccount}
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