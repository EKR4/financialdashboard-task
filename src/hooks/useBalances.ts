import { useState, useEffect, useCallback } from 'react';
import { MpesaBalance, SbmBalance, CoopBalance } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './useAuth';

interface BalancesState {
  mpesa: {
    data: MpesaBalance | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  sbm: {
    data: SbmBalance | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  coop: {
    data: CoopBalance | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
}

interface TransactionsState {
  loading: boolean;
  error: string | null;
  data: {
    accountId: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    reference: string;
  }[];
}

interface UseBalancesReturn extends BalancesState {
  fetchMpesa: () => Promise<void>;
  fetchSbm: () => Promise<void>;
  fetchCoop: () => Promise<void>;
  fetchAll: () => Promise<void>;
  totalBalance: number;
  transactions: TransactionsState;
  fetchTransactions: () => Promise<void>;
}

export function useBalances(): UseBalancesReturn {
  const { user } = useAuth();
  const supabase = createClient();
  const [balances, setBalances] = useState<BalancesState>({
    mpesa: { data: null, loading: false, error: null, lastUpdated: null },
    sbm: { data: null, loading: false, error: null, lastUpdated: null },
    coop: { data: null, loading: false, error: null, lastUpdated: null },
  });
  
  const [transactions, setTransactions] = useState<TransactionsState>({
    loading: false,
    error: null,
    data: []
  });
  const fetchMpesa = useCallback(async () => {
    try {
      setBalances(prev => ({
        ...prev,
        mpesa: { ...prev.mpesa, loading: true, error: null }
      }));
      
      const response = await fetch('/api/mpesa/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch M-Pesa balance');
      }
      
      const data = await response.json();
      
      setBalances(prev => ({
        ...prev,
        mpesa: { 
          data: data.data, 
          loading: false, 
          error: null, 
          lastUpdated: new Date() 
        }
      }));
    } catch (error: any) {
      setBalances(prev => ({
        ...prev,
        mpesa: { 
          ...prev.mpesa, 
          loading: false, 
          error: error.message || 'An error occurred' 
        }
      }));
    }
  }, []);

  const fetchSbm = useCallback(async () => {
    try {
      setBalances(prev => ({
        ...prev,
        sbm: { ...prev.sbm, loading: true, error: null }
      }));
      
      const response = await fetch('/api/sbm/account');
      
      if (!response.ok) {
        throw new Error('Failed to fetch SBM balance');
      }
      
      const data = await response.json();
      
      setBalances(prev => ({
        ...prev,
        sbm: { 
          data: data.data, 
          loading: false, 
          error: null, 
          lastUpdated: new Date() 
        }
      }));
    } catch (error: any) {
      setBalances(prev => ({
        ...prev,
        sbm: { 
          ...prev.sbm, 
          loading: false, 
          error: error.message || 'An error occurred' 
        }
      }));
    }
  }, []);

  const fetchCoop = useCallback(async () => {
    try {
      setBalances(prev => ({
        ...prev,
        coop: { ...prev.coop, loading: true, error: null }
      }));
      
      const response = await fetch('/api/coop/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch Co-op balance');
      }
      
      const data = await response.json();
      
      setBalances(prev => ({
        ...prev,
        coop: { 
          data: data.data, 
          loading: false, 
          error: null, 
          lastUpdated: new Date() 
        }
      }));
    } catch (error: any) {
      setBalances(prev => ({
        ...prev,
        coop: { 
          ...prev.coop, 
          loading: false, 
          error: error.message || 'An error occurred' 
        }
      }));
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([
      fetchMpesa(),
      fetchSbm(),
      fetchCoop()
    ]);
  }, [fetchMpesa, fetchSbm, fetchCoop]);
  
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setTransactions(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
      
      // Get all active accounts for the current user
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, account_type, account_number')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (accountsError) throw accountsError;
      
      if (!accounts || accounts.length === 0) {
        setTransactions({
          loading: false,
          error: null,
          data: []
        });
        return;
      }
      
      // Get recent transactions for these accounts
      const accountIds = accounts.map(account => account.id);
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('date', { ascending: false })
        .limit(20);
      
      if (transactionsError) throw transactionsError;
      
      // Format transactions for display
      const formattedTransactions = transactionsData.map(transaction => {
        const account = accounts.find(a => a.id === transaction.account_id);
        return {
          accountId: transaction.account_id,
          accountType: account?.account_type || 'unknown',
          accountNumber: account?.account_number || 'unknown',
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          reference: transaction.reference_number || '',
        };
      });
      
      setTransactions({
        loading: false,
        error: null,
        data: formattedTransactions
      });
    } catch (error: any) {
      setTransactions({
        loading: false,
        error: error.message || 'Failed to fetch transactions',
        data: []
      });
    }
  }, [user, supabase]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  // Fetch transactions when user changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  // Calculate total balance across all accounts
  const totalBalance = [
    balances.mpesa.data?.balance || 0,
    balances.sbm.data?.balance || 0,
    balances.coop.data?.balance || 0
  ].reduce((sum, balance) => sum + balance, 0);

  return {
    ...balances,
    fetchMpesa,
    fetchSbm,
    fetchCoop,
    fetchAll,
    totalBalance,
    transactions,
    fetchTransactions
  };
}