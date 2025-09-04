-- Financial Dashboard Database Schema

-- Enable RLS (Row Level Security)
ALTER DATABASE SCHEMA ENABLE ROW LEVEL SECURITY;

-- Users Table (handled by Supabase Auth, referenced here for clarity)
-- This table is automatically created and managed by Supabase Auth

-- Profiles Table - Extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  currency_preference TEXT DEFAULT 'KES',
  theme_preference TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Account Types Enum
CREATE TYPE account_type AS ENUM ('mpesa', 'sbm', 'coop');

-- Accounts Table - Financial accounts information
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type account_type NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT,
  additional_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, account_type, account_number)
);

-- RLS for accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Balances Table - Current balance for each account
CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id)
);

-- RLS for balances
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

-- Balances policies
CREATE POLICY "Users can view their own balances" ON balances
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM accounts WHERE id = balances.account_id)
  );

-- Transaction Types Enum
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

-- Transactions Table - Financial transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  category TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM accounts WHERE id = transactions.account_id)
  );

-- Settings Table - User application settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'system',
  currency TEXT DEFAULT 'KES',
  notification_email BOOLEAN DEFAULT TRUE,
  notification_low_balance BOOLEAN DEFAULT TRUE,
  notification_large_transaction BOOLEAN DEFAULT TRUE,
  low_balance_threshold DECIMAL(15, 2) DEFAULT 1000,
  large_transaction_threshold DECIMAL(15, 2) DEFAULT 10000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS for settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Users can view their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to create profile and settings when a new user signs up
CREATE OR REPLACE FUNCTION public.create_profile_and_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and settings on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.create_profile_and_settings();

-- Create a function to update profile when user updates in auth
CREATE OR REPLACE FUNCTION public.update_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    updated_at = now()
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when user is updated
CREATE OR REPLACE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.update_profile();

-- Create a function to update account balance when a transaction is created
CREATE OR REPLACE FUNCTION public.update_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
  v_current_balance DECIMAL(15, 2);
  v_new_balance DECIMAL(15, 2);
BEGIN
  -- Get the account_id
  v_account_id := NEW.account_id;
  
  -- Get current balance
  SELECT amount INTO v_current_balance
  FROM public.balances
  WHERE account_id = v_account_id;
  
  -- If no balance record exists, create one with zero balance
  IF v_current_balance IS NULL THEN
    INSERT INTO public.balances (account_id, amount)
    VALUES (v_account_id, 0)
    RETURNING amount INTO v_current_balance;
  END IF;
  
  -- Calculate new balance based on transaction type
  IF NEW.type = 'credit' THEN
    v_new_balance := v_current_balance + NEW.amount;
  ELSE
    v_new_balance := v_current_balance - NEW.amount;
  END IF;
  
  -- Update balance
  UPDATE public.balances
  SET 
    amount = v_new_balance,
    last_updated = NOW()
  WHERE account_id = v_account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update balance when transaction is created
CREATE OR REPLACE TRIGGER on_transaction_created
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.update_balance_on_transaction();

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_balances_account_id ON balances(account_id);
CREATE INDEX idx_settings_user_id ON settings(user_id);