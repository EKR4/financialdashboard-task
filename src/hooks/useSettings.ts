import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSettings {
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
}

interface AccountSettings {
  theme: 'system' | 'light' | 'dark';
  currency: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  lowBalanceAlerts: boolean;
  largeTransactionAlerts: boolean;
  lowBalanceThreshold?: number;
  largeTransactionThreshold?: number;
}

interface SecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface Settings {
  profile: ProfileSettings;
  account: AccountSettings;
  notifications: NotificationSettings;
}

interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileSettings>) => Promise<{ success: boolean; error?: string }>;
  updateAccountPreferences: (data: Partial<AccountSettings>) => Promise<{ success: boolean; error?: string }>;
  updateNotificationSettings: (data: Partial<NotificationSettings>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (data: SecuritySettings) => Promise<{ success: boolean; error?: string }>;
}

export function useSettings(): UseSettingsReturn {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default settings
  const [settings, setSettings] = useState<Settings>({
    profile: {
      fullName: '',
      phoneNumber: '',
    },
    account: {
      theme: 'system',
      currency: 'KES',
    },
    notifications: {
      emailNotifications: true,
      lowBalanceAlerts: true,
      largeTransactionAlerts: true,
      lowBalanceThreshold: 1000,
      largeTransactionThreshold: 10000,
    }
  });

  // Fetch user settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone_number, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch settings data
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('theme, currency, notification_email, notification_low_balance, notification_large_transaction, low_balance_threshold, large_transaction_threshold')
          .eq('user_id', user.id)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        
        // Update state with fetched data
        setSettings({
          profile: {
            fullName: profileData?.full_name || '',
            phoneNumber: profileData?.phone_number || '',
            avatarUrl: profileData?.avatar_url,
          },
          account: {
            theme: (settingsData?.theme as 'system' | 'light' | 'dark') || 'system',
            currency: settingsData?.currency || 'KES',
          },
          notifications: {
            emailNotifications: settingsData?.notification_email ?? true,
            lowBalanceAlerts: settingsData?.notification_low_balance ?? true,
            largeTransactionAlerts: settingsData?.notification_large_transaction ?? true,
            lowBalanceThreshold: settingsData?.low_balance_threshold || 1000,
            largeTransactionThreshold: settingsData?.large_transaction_threshold || 10000,
          }
        });
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err.message || 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user, supabase]);

  // Update profile information
  const updateProfile = async (data: Partial<ProfileSettings>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setError(null);
      
      // In a real app, this would update the actual database
      // For now, we'll just update the local state and simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...data
        }
      }));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  // Update account preferences
  const updateAccountPreferences = async (data: Partial<AccountSettings>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setError(null);
      
      // In a real app, this would update the actual database
      // For now, we'll just update the local state and simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          theme: data.theme,
          currency: data.currency,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          ...data
        }
      }));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating account preferences:', err);
      setError(err.message || 'Failed to update account preferences');
      return { success: false, error: err.message || 'Failed to update account preferences' };
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (data: Partial<NotificationSettings>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setError(null);
      
      // In a real app, this would update the actual database
      // For now, we'll just update the local state and simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          notification_email: data.emailNotifications,
          notification_low_balance: data.lowBalanceAlerts,
          notification_large_transaction: data.largeTransactionAlerts,
          low_balance_threshold: data.lowBalanceThreshold,
          large_transaction_threshold: data.largeTransactionThreshold,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          ...data
        }
      }));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating notification settings:', err);
      setError(err.message || 'Failed to update notification settings');
      return { success: false, error: err.message || 'Failed to update notification settings' };
    }
  };

  // Update password
  const updatePassword = async (data: SecuritySettings) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      setError(null);
      
      // Validation
      if (!data.currentPassword) {
        return { success: false, error: 'Current password is required' };
      }
      
      if (!data.newPassword) {
        return { success: false, error: 'New password is required' };
      }
      
      if (data.newPassword !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      
      // In a real app, this would update the actual password
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  return {
    settings,
    loading,
    error,
    updateProfile,
    updateAccountPreferences,
    updateNotificationSettings,
    updatePassword
  };
}