-- ============================================
-- Expense Tracker Database Schema
-- ============================================
-- This file contains all database tables, relations, and triggers
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile information (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  theme_setting TEXT DEFAULT 'system' CHECK (theme_setting IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- ============================================
-- CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  card_number TEXT NOT NULL, -- Encrypted in production
  expiry_date TEXT NOT NULL, -- MM/YY format
  card_type TEXT NOT NULL CHECK (card_type IN ('visa', 'mastercard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  date TIMESTAMPTZ NOT NULL,
  note TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'credit')),
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  credit_id UUID, -- References credit_entries(id) - handled by trigger
  credit_history_id UUID, -- References credit_history(id) - handled by trigger
  credit_received_id UUID, -- References credit_received(id) - handled by trigger
  credit_received_history_id UUID, -- References credit_received_history(id) - handled by trigger
  receipt_image_url TEXT, -- For storing receipt images in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREDIT ENTRIES TABLE (Credit Lent)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  given_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (returned_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially-paid', 'completed')),
  initial_payment_method TEXT NOT NULL CHECK (initial_payment_method IN ('cash', 'card')),
  initial_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  initial_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (returned_amount <= amount)
);

-- ============================================
-- CREDIT HISTORY TABLE (Credit Lent History)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_id UUID NOT NULL REFERENCES credit_entries(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('given', 'returned')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREDIT RECEIVED TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_received (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  return_date DATE NOT NULL,
  received_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (returned_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially-paid', 'completed')),
  initial_payment_method TEXT NOT NULL CHECK (initial_payment_method IN ('cash', 'card')),
  initial_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  initial_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (returned_amount <= amount)
);

-- ============================================
-- CREDIT RECEIVED HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_received_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_received_id UUID NOT NULL REFERENCES credit_received(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_entries_user_id ON credit_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_entries_status ON credit_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_history_credit_id ON credit_history(credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_received_user_id ON credit_received(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_received_status ON credit_received(user_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_received_history_credit_received_id ON credit_received_history(credit_received_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update credit entry status based on returned amount
CREATE OR REPLACE FUNCTION update_credit_entry_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    UPDATE credit_entries
    SET 
      returned_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_history
        WHERE credit_id = NEW.credit_id AND type = 'returned'
      ),
      status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM credit_history WHERE credit_id = NEW.credit_id AND type = 'returned') >= (SELECT amount FROM credit_entries WHERE id = NEW.credit_id) THEN 'completed'
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM credit_history WHERE credit_id = NEW.credit_id AND type = 'returned') > 0 THEN 'partially-paid'
        ELSE 'pending'
      END,
      updated_at = NOW()
    WHERE id = NEW.credit_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update credit received status based on returned amount
CREATE OR REPLACE FUNCTION update_credit_received_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    UPDATE credit_received
    SET 
      returned_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_received_history
        WHERE credit_received_id = NEW.credit_received_id
      ),
      status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM credit_received_history WHERE credit_received_id = NEW.credit_received_id) >= (SELECT amount FROM credit_received WHERE id = NEW.credit_received_id) THEN 'completed'
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM credit_received_history WHERE credit_received_id = NEW.credit_received_id) > 0 THEN 'partially-paid'
        ELSE 'pending'
      END,
      updated_at = NOW()
    WHERE id = NEW.credit_received_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for cards
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for transactions
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for credit_entries
CREATE TRIGGER update_credit_entries_updated_at
  BEFORE UPDATE ON credit_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update credit entry status when history changes
CREATE TRIGGER update_credit_entry_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON credit_history
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_entry_status();

-- Trigger to update credit received status when history changes
CREATE TRIGGER update_credit_received_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON credit_received_history
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_received_status();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE categories IS 'Transaction categories for income and expenses';
COMMENT ON TABLE cards IS 'User credit/debit cards';
COMMENT ON TABLE transactions IS 'All financial transactions (income and expenses)';
COMMENT ON TABLE credit_entries IS 'Money lent to others (credit given)';
COMMENT ON TABLE credit_history IS 'History of credit given/returned';
COMMENT ON TABLE credit_received IS 'Money received from others (credit borrowed)';
COMMENT ON TABLE credit_received_history IS 'History of credit received payments made';

