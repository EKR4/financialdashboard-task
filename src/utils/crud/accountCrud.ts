import { Account } from '@/types';
import { createClient } from '../supabase/client';

interface AccountCreate {
  user_id: string;
  account_type: 'mpesa' | 'sbm' | 'coop';
  account_number: string;
  account_name?: string;
  additional_data?: Record<string, unknown>;
}

interface AccountUpdate {
  account_name?: string;
  is_active?: boolean;
  additional_data?: Record<string, unknown>;
}

/**
 * CRUD operations for accounts table
 */
export const accountCrud = {
  /**
   * Create a new account
   */
  createAccount: async (accountData: AccountCreate): Promise<Account> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: accountData.user_id,
          account_type: accountData.account_type,
          account_number: accountData.account_number,
          account_name: accountData.account_name,
          additional_data: accountData.additional_data || {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating account:', error);
        throw error;
      }
      
      return {
        id: data.id,
        user_id: data.user_id,
        account_type: data.account_type,
        account_number: data.account_number,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    }
  },
  
  /**
   * Get account details by ID
   */
  getAccount: async (accountId: string): Promise<Account | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Record not found
        console.error('Error fetching account:', error);
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        user_id: data.user_id,
        account_type: data.account_type,
        account_number: data.account_number,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Failed to get account:', error);
      throw error;
    }
  },
  
  /**
   * Update an account
   */
  updateAccount: async (accountId: string, accountData: AccountUpdate): Promise<Account | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('accounts')
        .update({
          account_name: accountData.account_name,
          is_active: accountData.is_active,
          additional_data: accountData.additional_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating account:', error);
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        user_id: data.user_id,
        account_type: data.account_type,
        account_number: data.account_number,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Failed to update account:', error);
      throw error;
    }
  },
  
  /**
   * Delete an account
   */
  deleteAccount: async (accountId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  },
  
  /**
   * List all accounts for a user
   */
  listUserAccounts: async (userId: string, includeInactive: boolean = false): Promise<Account[]> => {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
      
      // Filter out inactive accounts unless specifically requested
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching accounts:', error);
        throw error;
      }
      
      if (!data) return [];
      
      return data.map(account => ({
        id: account.id,
        user_id: account.user_id,
        account_type: account.account_type,
        account_number: account.account_number,
        is_active: account.is_active,
        created_at: account.created_at,
        updated_at: account.updated_at
      }));
    } catch (error) {
      console.error('Failed to list accounts:', error);
      throw error;
    }
  },
  
  /**
   * Check if account exists
   */
  accountExists: async (userId: string, accountType: string, accountNumber: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('account_type', accountType)
        .eq('account_number', accountNumber)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return false; // Record not found
        console.error('Error checking account existence:', error);
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Failed to check account existence:', error);
      throw error;
    }
  }
};