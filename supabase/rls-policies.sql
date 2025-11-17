-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- This file contains all RLS policies for secure data access
-- Run this in your Supabase SQL Editor AFTER running schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_received_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if needed)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CARDS POLICIES
-- ============================================

-- Users can view their own cards
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cards
CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cards
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cards
CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREDIT ENTRIES POLICIES
-- ============================================

-- Users can view their own credit entries
CREATE POLICY "Users can view own credit entries"
  ON credit_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credit entries
CREATE POLICY "Users can insert own credit entries"
  ON credit_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credit entries
CREATE POLICY "Users can update own credit entries"
  ON credit_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own credit entries
CREATE POLICY "Users can delete own credit entries"
  ON credit_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREDIT HISTORY POLICIES
-- ============================================

-- Users can view credit history for their own credit entries
CREATE POLICY "Users can view own credit history"
  ON credit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM credit_entries
      WHERE credit_entries.id = credit_history.credit_id
      AND credit_entries.user_id = auth.uid()
    )
  );

-- Users can insert credit history for their own credit entries
CREATE POLICY "Users can insert own credit history"
  ON credit_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM credit_entries
      WHERE credit_entries.id = credit_history.credit_id
      AND credit_entries.user_id = auth.uid()
    )
  );

-- Users can update credit history for their own credit entries
CREATE POLICY "Users can update own credit history"
  ON credit_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM credit_entries
      WHERE credit_entries.id = credit_history.credit_id
      AND credit_entries.user_id = auth.uid()
    )
  );

-- Users can delete credit history for their own credit entries
CREATE POLICY "Users can delete own credit history"
  ON credit_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM credit_entries
      WHERE credit_entries.id = credit_history.credit_id
      AND credit_entries.user_id = auth.uid()
    )
  );

-- ============================================
-- CREDIT RECEIVED POLICIES
-- ============================================

-- Users can view their own credit received entries
CREATE POLICY "Users can view own credit received"
  ON credit_received FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credit received entries
CREATE POLICY "Users can insert own credit received"
  ON credit_received FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credit received entries
CREATE POLICY "Users can update own credit received"
  ON credit_received FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own credit received entries
CREATE POLICY "Users can delete own credit received"
  ON credit_received FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREDIT RECEIVED HISTORY POLICIES
-- ============================================

-- Users can view credit received history for their own entries
CREATE POLICY "Users can view own credit received history"
  ON credit_received_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM credit_received
      WHERE credit_received.id = credit_received_history.credit_received_id
      AND credit_received.user_id = auth.uid()
    )
  );

-- Users can insert credit received history for their own entries
CREATE POLICY "Users can insert own credit received history"
  ON credit_received_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM credit_received
      WHERE credit_received.id = credit_received_history.credit_received_id
      AND credit_received.user_id = auth.uid()
    )
  );

-- Users can update credit received history for their own entries
CREATE POLICY "Users can update own credit received history"
  ON credit_received_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM credit_received
      WHERE credit_received.id = credit_received_history.credit_received_id
      AND credit_received.user_id = auth.uid()
    )
  );

-- Users can delete credit received history for their own entries
CREATE POLICY "Users can delete own credit received history"
  ON credit_received_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM credit_received
      WHERE credit_received.id = credit_received_history.credit_received_id
      AND credit_received.user_id = auth.uid()
    )
  );

