import { createClient } from '../supabase/client';

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'system' | 'light' | 'dark';
  currency: string;
  notification_email: boolean;
  notification_low_balance: boolean;
  notification_large_transaction: boolean;
  low_balance_threshold: number;
  large_transaction_threshold: number;
  updated_at: string;
}

interface SettingsUpdate {
  theme?: 'system' | 'light' | 'dark';
  currency?: string;
  notification_email?: boolean;
  notification_low_balance?: boolean;
  notification_large_transaction?: boolean;
  low_balance_threshold?: number;
  large_transaction_threshold?: number;
}

// Default settings values
const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'updated_at'> = {
  theme: 'system',
  currency: 'KES',
  notification_email: true,
  notification_low_balance: true,
  notification_large_transaction: true,
  low_balance_threshold: 1000,
  large_transaction_threshold: 10000
};

/**
 * CRUD operations for settings table
 */
export const settingsCrud = {
  /**
   * Get user settings
   */
  getUserSettings: async (userId: string): Promise<UserSettings | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Settings not found, create default settings
          return settingsCrud.createDefaultSettings(userId);
        }
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      return data as UserSettings;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      throw error;
    }
  },
  
  /**
   * Update user settings
   */
  updateUserSettings: async (userId: string, settingsData: SettingsUpdate): Promise<UserSettings | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .update({
          theme: settingsData.theme,
          currency: settingsData.currency,
          notification_email: settingsData.notification_email,
          notification_low_balance: settingsData.notification_low_balance,
          notification_large_transaction: settingsData.notification_large_transaction,
          low_balance_threshold: settingsData.low_balance_threshold,
          large_transaction_threshold: settingsData.large_transaction_threshold,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
      
      return data as UserSettings;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  },
  
  /**
   * Create default settings for a user
   */
  createDefaultSettings: async (userId: string): Promise<UserSettings> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .insert({
          user_id: userId,
          ...DEFAULT_SETTINGS,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating default settings:', error);
        throw error;
      }
      
      return data as UserSettings;
    } catch (error) {
      console.error('Failed to create default settings:', error);
      throw error;
    }
  },
  
  /**
   * Reset user settings to default values
   */
  resetSettings: async (userId: string): Promise<UserSettings | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .update({
          ...DEFAULT_SETTINGS,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error resetting settings:', error);
        throw error;
      }
      
      return data as UserSettings;
    } catch (error) {
      console.error('Failed to reset user settings:', error);
      throw error;
    }
  },
  
  /**
   * Get user theme preference
   */
  getUserTheme: async (userId: string): Promise<'system' | 'light' | 'dark'> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .select('theme')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return DEFAULT_SETTINGS.theme;
        console.error('Error fetching theme settings:', error);
        throw error;
      }
      
      return (data?.theme || DEFAULT_SETTINGS.theme) as 'system' | 'light' | 'dark';
    } catch (error) {
      console.error('Failed to get user theme preference:', error);
      return DEFAULT_SETTINGS.theme;
    }
  },
  
  /**
   * Get user currency preference
   */
  getUserCurrency: async (userId: string): Promise<string> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .select('currency')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return DEFAULT_SETTINGS.currency;
        console.error('Error fetching currency settings:', error);
        throw error;
      }
      
      return data?.currency || DEFAULT_SETTINGS.currency;
    } catch (error) {
      console.error('Failed to get user currency preference:', error);
      return DEFAULT_SETTINGS.currency;
    }
  },
  
  /**
   * Get user notification settings
   */
  getNotificationSettings: async (userId: string): Promise<{
    emailNotifications: boolean;
    lowBalanceAlerts: boolean;
    largeTransactionAlerts: boolean;
    lowBalanceThreshold: number;
    largeTransactionThreshold: number;
  }> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('settings')
        .select('notification_email, notification_low_balance, notification_large_transaction, low_balance_threshold, large_transaction_threshold')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return {
            emailNotifications: DEFAULT_SETTINGS.notification_email,
            lowBalanceAlerts: DEFAULT_SETTINGS.notification_low_balance,
            largeTransactionAlerts: DEFAULT_SETTINGS.notification_large_transaction,
            lowBalanceThreshold: DEFAULT_SETTINGS.low_balance_threshold,
            largeTransactionThreshold: DEFAULT_SETTINGS.large_transaction_threshold
          };
        }
        console.error('Error fetching notification settings:', error);
        throw error;
      }
      
      return {
        emailNotifications: data?.notification_email ?? DEFAULT_SETTINGS.notification_email,
        lowBalanceAlerts: data?.notification_low_balance ?? DEFAULT_SETTINGS.notification_low_balance,
        largeTransactionAlerts: data?.notification_large_transaction ?? DEFAULT_SETTINGS.notification_large_transaction,
        lowBalanceThreshold: data?.low_balance_threshold ?? DEFAULT_SETTINGS.low_balance_threshold,
        largeTransactionThreshold: data?.large_transaction_threshold ?? DEFAULT_SETTINGS.large_transaction_threshold
      };
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return {
        emailNotifications: DEFAULT_SETTINGS.notification_email,
        lowBalanceAlerts: DEFAULT_SETTINGS.notification_low_balance,
        largeTransactionAlerts: DEFAULT_SETTINGS.notification_large_transaction,
        lowBalanceThreshold: DEFAULT_SETTINGS.low_balance_threshold,
        largeTransactionThreshold: DEFAULT_SETTINGS.large_transaction_threshold
      };
    }
  }
};