export interface User {
  id: string;
  email: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_type: 'mpesa' | 'sbm' | 'coop';
  account_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  last_updated: string;
}

export interface MpesaBalance {
  account_number: string;
  balance: number;
  currency: string;
  last_updated: string;
}

export interface SbmBalance {
  account_number: string;
  balance: number;
  currency: string;
  account_type: string;
  last_updated: string;
}

export interface CoopBalance {
  account_number: string;
  balance: number;
  currency: string;
  branch: string;
  last_updated: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};