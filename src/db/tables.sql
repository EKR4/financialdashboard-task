-- Financial Dashboard Core Tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: RLS must be enabled per table, not at database level
-- The invalid line has been removed: ALTER DATABASE SCHEMA ENABLE ROW LEVEL SECURITY;

-- Users Table (referenced for clarity, handled by Supabase Auth)
-- Note: This table is automatically created and managed by Supabase Auth
-- CREATE TABLE auth.users (
--   id UUID PRIMARY KEY,
--   email TEXT,
--   ... other fields managed by Supabase Auth
-- );

-- User Profiles Table - Extended user information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  currency_preference TEXT DEFAULT 'KES',
  theme_preference TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
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

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM accounts WHERE id = transactions.account_id)
  );

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM accounts WHERE id = transactions.account_id)
  );

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (
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

-- Create a function to create user profile and settings when a new user signs up
CREATE OR REPLACE FUNCTION public.create_user_profile_and_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
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
FOR EACH ROW EXECUTE PROCEDURE public.create_user_profile_and_settings();

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_settings_user_id ON settings(user_id);