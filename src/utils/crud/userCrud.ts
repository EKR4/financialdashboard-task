import { User } from '@/types';
import { createClient } from '../supabase/client';

interface UserProfile {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  currency_preference?: string;
  theme_preference?: 'system' | 'light' | 'dark';
}

/**
 * CRUD operations for users table
 */
export const userCrud = {
  /**
   * Get a user profile by ID
   */
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
      
      if (!data) return null;
      
      // Map database fields to User type
      return {
        id: data.id,
        email: '', // Email is stored in auth.users, not in the users table
        created_at: data.created_at,
        updated_at: data.updated_at,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url,
        currencyPreference: data.currency_preference,
        themePreference: data.theme_preference
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },
  
  /**
   * Get a user profile with their auth information
   */
  getUserWithAuth: async (userId: string): Promise<User | null> => {
    try {
      const supabase = createClient();
      
      // First get the user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }
      
      if (!userData) return null;
      
      // Get the user's auth information
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      
      if (!authData || !authData.user) return null;
      
      // Combine the data
      return {
        id: userData.id,
        email: authData.user.email || '',
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        fullName: userData.full_name,
        phoneNumber: userData.phone_number,
        avatarUrl: userData.avatar_url,
        currencyPreference: userData.currency_preference,
        themePreference: userData.theme_preference
      };
    } catch (error) {
      console.error('Failed to get user with auth:', error);
      throw error;
    }
  },
  
  /**
   * Update a user profile
   */
  updateUser: async (userId: string, userData: UserProfile): Promise<User | null> => {
    try {
      const supabase = createClient();
      
      // Update the user profile
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          avatar_url: userData.avatar_url,
          currency_preference: userData.currency_preference,
          theme_preference: userData.theme_preference,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      if (!data) return null;
      
      // Return the updated user
      return {
        id: data.id,
        email: '', // Email is stored in auth.users
        created_at: data.created_at,
        updated_at: data.updated_at,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url,
        currencyPreference: data.currency_preference,
        themePreference: data.theme_preference
      };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },
  
  /**
   * Delete a user profile (this should only be used in combination with auth.deleteUser)
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      // Delete the user profile
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete user profile:', error);
      throw error;
    }
  },
  
  /**
   * List all users (admin only)
   */
  listUsers: async (): Promise<User[]> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      if (!data) return [];
      
      // Map database fields to User type
      return data.map(user => ({
        id: user.id,
        email: '', // Email is stored in auth.users
        created_at: user.created_at,
        updated_at: user.updated_at,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        avatarUrl: user.avatar_url,
        currencyPreference: user.currency_preference,
        themePreference: user.theme_preference
      }));
    } catch (error) {
      console.error('Failed to list users:', error);
      throw error;
    }
  }
};