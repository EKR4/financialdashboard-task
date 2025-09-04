import { useState, useEffect, useCallback } from 'react';
import { MpesaBalance, SbmBalance, CoopBalance } from '@/types';

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

interface UseBalancesReturn extends BalancesState {
  fetchMpesa: () => Promise<void>;
  fetchSbm: () => Promise<void>;
  fetchCoop: () => Promise<void>;
  fetchAll: () => Promise<void>;
  totalBalance: number;
}

export function useBalances(): UseBalancesReturn {
  const [balances, setBalances] = useState<BalancesState>({
    mpesa: { data: null, loading: false, error: null, lastUpdated: null },
    sbm: { data: null, loading: false, error: null, lastUpdated: null },
    coop: { data: null, loading: false, error: null, lastUpdated: null },
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

  // Initial fetch on component mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
    totalBalance
  };
}