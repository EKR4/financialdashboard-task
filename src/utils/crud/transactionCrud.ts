import { createClient } from '../supabase/client';

interface Transaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  reference_number?: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TransactionCreate {
  account_id: string;
  date?: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  reference_number?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface TransactionUpdate {
  description?: string;
  amount?: number;
  category?: string;
  reference_number?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  types?: ('credit' | 'debit')[];
  categories?: string[];
  status?: string;
  searchTerm?: string;
}

/**
 * CRUD operations for transactions table
 */
export const transactionCrud = {
  /**
   * Create a new transaction
   * Note: Account balance is automatically updated via database trigger
   */
  createTransaction: async (transactionData: TransactionCreate): Promise<Transaction> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          account_id: transactionData.account_id,
          date: transactionData.date || new Date().toISOString(),
          description: transactionData.description,
          amount: transactionData.amount,
          type: transactionData.type,
          category: transactionData.category,
          reference_number: transactionData.reference_number,
          status: transactionData.status || 'completed',
          metadata: transactionData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
      
      return data as Transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  },
  
  /**
   * Get a transaction by ID
   */
  getTransaction: async (transactionId: string): Promise<Transaction | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Record not found
        console.error('Error fetching transaction:', error);
        throw error;
      }
      
      return data as Transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  },
  
  /**
   * Update a transaction
   */
  updateTransaction: async (transactionId: string, transactionData: TransactionUpdate): Promise<Transaction | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('transactions')
        .update({
          description: transactionData.description,
          amount: transactionData.amount,
          category: transactionData.category,
          reference_number: transactionData.reference_number,
          status: transactionData.status,
          metadata: transactionData.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }
      
      return data as Transaction;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  },
  
  /**
   * Delete a transaction
   */
  deleteTransaction: async (transactionId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  },
  
  /**
   * List transactions for an account with optional filtering
   */
  listAccountTransactions: async (
    accountId: string, 
    page: number = 1, 
    pageSize: number = 20,
    filters?: TransactionFilter
  ): Promise<{ transactions: Transaction[]; totalCount: number }> => {
    try {
      const supabase = createClient();
      
      // Start building the query
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('account_id', accountId);
      
      // Apply filters if provided
      if (filters) {
        if (filters.startDate) {
          query = query.gte('date', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('date', filters.endDate);
        }
        
        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        if (filters.types && filters.types.length > 0) {
          query = query.in('type', filters.types);
        }
        
        if (filters.categories && filters.categories.length > 0) {
          query = query.in('category', filters.categories);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.searchTerm) {
          query = query.ilike('description', `%${filters.searchTerm}%`);
        }
      }
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute the query
      const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error('Error listing transactions:', error);
        throw error;
      }
      
      return {
        transactions: data as Transaction[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Failed to list transactions:', error);
      throw error;
    }
  },
  
  /**
   * List transactions for a user across all their accounts
   */
  listUserTransactions: async (
    userId: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: TransactionFilter
  ): Promise<{ transactions: Transaction[]; totalCount: number }> => {
    try {
      const supabase = createClient();
      
      // First get the user's accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (accountsError) {
        console.error('Error fetching user accounts:', accountsError);
        throw accountsError;
      }
      
      if (!accounts || accounts.length === 0) {
        return { transactions: [], totalCount: 0 };
      }
      
      const accountIds = accounts.map(acc => acc.id);
      
      // Start building the query for transactions
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .in('account_id', accountIds);
      
      // Apply filters if provided (same as in listAccountTransactions)
      if (filters) {
        if (filters.startDate) {
          query = query.gte('date', filters.startDate);
        }
        
        if (filters.endDate) {
          query = query.lte('date', filters.endDate);
        }
        
        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }
        
        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }
        
        if (filters.types && filters.types.length > 0) {
          query = query.in('type', filters.types);
        }
        
        if (filters.categories && filters.categories.length > 0) {
          query = query.in('category', filters.categories);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.searchTerm) {
          query = query.ilike('description', `%${filters.searchTerm}%`);
        }
      }
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute the query
      const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error('Error listing user transactions:', error);
        throw error;
      }
      
      return {
        transactions: data as Transaction[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Failed to list user transactions:', error);
      throw error;
    }
  }
};