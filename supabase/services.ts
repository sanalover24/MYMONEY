import { supabase } from './config';
import type {
  User,
  Category,
  Transaction,
  CardDetails,
  CreditEntry,
  CreditHistoryItem,
  CreditReceivedEntry,
  CreditReceivedHistoryItem,
  TransactionType,
  PaymentMethod,
  CreditStatus,
} from '../types';

// ============================================
// AUTH SERVICE
// ============================================

// ======================== AUTH SERVICE ========================
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/#/dashboard` },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => callback(session?.user || null));
  },
};

// ======================== PROFILE SERVICE ========================
export const profileService = {
  async getProfile(userId: string, defaults?: { name: string; email: string }): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    let profileData = data;

    if (!profileData) {
      if (!defaults?.email) throw new Error('Cannot create profile without email');

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: defaults.name,
          email: defaults.email,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      profileData = newProfile;
    }

    return {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
    };
  },

  async updateProfile(userId: string, updates: { name?: string; email?: string; theme_setting?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
// ============================================
// CATEGORIES SERVICE
// ============================================

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as TransactionType,
    }));
  },

  async createCategory(userId: string, category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: category.name,
        type: category.type,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
    };
  },

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
    };
  },

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    // Delete related transactions first
    const category = await this.getCategory(categoryId);
    if (category) {
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)
        .eq('category', category.name);
    }
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
  },

  async getCategory(categoryId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    if (error) return null;
    return {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
    };
  },
};

// ============================================
// CARDS SERVICE
// ============================================

export const cardService = {
  async getCards(userId: string): Promise<CardDetails[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((c) => ({
      id: c.id,
      cardName: c.card_name,
      cardNumber: c.card_number,
      expiryDate: c.expiry_date,
      cardType: c.card_type as 'visa' | 'mastercard',
    }));
  },

  async createCard(userId: string, card: Omit<CardDetails, 'id'>): Promise<CardDetails> {
    const { data, error } = await supabase
      .from('cards')
      .insert({
        user_id: userId,
        card_name: card.cardName,
        card_number: card.cardNumber,
        expiry_date: card.expiryDate,
        card_type: card.cardType,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      cardName: data.card_name,
      cardNumber: data.card_number,
      expiryDate: data.expiry_date,
      cardType: data.card_type as 'visa' | 'mastercard',
    };
  },

  async updateCard(cardId: string, updates: Partial<CardDetails>): Promise<CardDetails> {
    const updateData: any = {};
    if (updates.cardName) updateData.card_name = updates.cardName;
    if (updates.cardNumber) updateData.card_number = updates.cardNumber;
    if (updates.expiryDate) updateData.expiry_date = updates.expiryDate;
    if (updates.cardType) updateData.card_type = updates.cardType;

    const { data, error } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      cardName: data.card_name,
      cardNumber: data.card_number,
      expiryDate: data.expiry_date,
      cardType: data.card_type as 'visa' | 'mastercard',
    };
  },

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);
    if (error) throw error;
  },

  async isCardInUse(cardId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) return true;

    const { data: creditData } = await supabase
      .from('credit_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('initial_card_id', cardId)
      .limit(1);
    return (creditData && creditData.length > 0) || false;
  },
};

// ============================================
// TRANSACTIONS SERVICE
// ============================================

export const transactionService = {
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map((t) => ({
      id: t.id,
      type: t.type as TransactionType,
      category: t.category,
      amount: parseFloat(t.amount),
      date: t.date,
      note: t.note || '',
      paymentMethod: t.payment_method as PaymentMethod | undefined,
      cardId: t.card_id || undefined,
      creditId: t.credit_id || undefined,
      creditHistoryId: t.credit_history_id || undefined,
      creditReceivedId: t.credit_received_id || undefined,
      creditReceivedHistoryId: t.credit_received_history_id || undefined,
    }));
  },

  async createTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        note: transaction.note || null,
        payment_method: transaction.paymentMethod || null,
        card_id: transaction.cardId || null,
        credit_id: transaction.creditId || null,
        credit_history_id: transaction.creditHistoryId || null,
        credit_received_id: transaction.creditReceivedId || null,
        credit_received_history_id: transaction.creditReceivedHistoryId || null,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      type: data.type as TransactionType,
      category: data.category,
      amount: parseFloat(data.amount),
      date: data.date,
      note: data.note || '',
      paymentMethod: data.payment_method as PaymentMethod | undefined,
      cardId: data.card_id || undefined,
      creditId: data.credit_id || undefined,
      creditHistoryId: data.credit_history_id || undefined,
      creditReceivedId: data.credit_received_id || undefined,
      creditReceivedHistoryId: data.credit_received_history_id || undefined,
    };
  },

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const updateData: any = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.category) updateData.category = updates.category;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date) updateData.date = updates.date;
    if (updates.note !== undefined) updateData.note = updates.note || null;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod || null;
    if (updates.cardId !== undefined) updateData.card_id = updates.cardId || null;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      type: data.type as TransactionType,
      category: data.category,
      amount: parseFloat(data.amount),
      date: data.date,
      note: data.note || '',
      paymentMethod: data.payment_method as PaymentMethod | undefined,
      cardId: data.card_id || undefined,
      creditId: data.credit_id || undefined,
      creditHistoryId: data.credit_history_id || undefined,
      creditReceivedId: data.credit_received_id || undefined,
      creditReceivedHistoryId: data.credit_received_history_id || undefined,
    };
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);
    if (error) throw error;
  },

  async deleteTransactionsByCategory(userId: string, categoryName: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('category', categoryName);
    if (error) throw error;
  },
};

// ============================================
// CREDIT ENTRIES SERVICE (Credit Lent)
// ============================================

export const creditService = {
  async getCreditEntries(userId: string): Promise<CreditEntry[]> {
    const { data, error } = await supabase
      .from('credit_entries')
      .select('*')
      .eq('user_id', userId)
      .order('given_date', { ascending: false });
    if (error) throw error;

    const entries: CreditEntry[] = [];
    for (const entry of data) {
      const history = await this.getCreditHistory(entry.id);
      entries.push({
        id: entry.id,
        personName: entry.person_name,
        amount: parseFloat(entry.amount),
        dueDate: entry.due_date,
        givenDate: entry.given_date,
        returnedAmount: parseFloat(entry.returned_amount),
        status: entry.status as CreditStatus,
        history,
        initialPaymentMethod: entry.initial_payment_method as PaymentMethod,
        initialCardId: entry.initial_card_id || undefined,
        initialNote: entry.initial_note || undefined,
      });
    }
    return entries;
  },

  async getCreditHistory(creditId: string): Promise<CreditHistoryItem[]> {
    const { data, error } = await supabase
      .from('credit_history')
      .select('*')
      .eq('credit_id', creditId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map((h) => ({
      id: h.id,
      date: h.date,
      amount: parseFloat(h.amount),
      type: h.type as 'given' | 'returned',
      paymentMethod: h.payment_method as PaymentMethod,
      cardId: h.card_id || undefined,
      note: h.note || undefined,
    }));
  },

  async createCreditEntry(userId: string, entry: Omit<CreditEntry, 'id' | 'givenDate' | 'returnedAmount' | 'status' | 'history'>): Promise<CreditEntry> {
    const now = new Date().toISOString();
    
    // Insert credit entry
    const { data: entryData, error: entryError } = await supabase
      .from('credit_entries')
      .insert({
        user_id: userId,
        person_name: entry.personName,
        amount: entry.amount,
        due_date: entry.dueDate,
        given_date: now,
        initial_payment_method: entry.initialPaymentMethod,
        initial_card_id: entry.initialCardId || null,
        initial_note: entry.initialNote || null,
      })
      .select()
      .single();
    if (entryError) throw entryError;

    // Insert initial history item
    const { data: historyData, error: historyError } = await supabase
      .from('credit_history')
      .insert({
        credit_id: entryData.id,
        date: now,
        amount: entry.amount,
        type: 'given',
        payment_method: entry.initialPaymentMethod,
        card_id: entry.initialCardId || null,
        note: entry.initialNote || null,
      })
      .select()
      .single();
    if (historyError) throw historyError;

    // Create associated transaction
    await transactionService.createTransaction(userId, {
      type: 'expense',
      category: 'Credit',
      amount: entry.amount,
      date: now,
      note: `Credit given to ${entry.personName}`,
      paymentMethod: entry.initialPaymentMethod,
      cardId: entry.initialCardId,
      creditId: entryData.id,
      creditHistoryId: historyData.id,
    });

    return {
      id: entryData.id,
      personName: entryData.person_name,
      amount: parseFloat(entryData.amount),
      dueDate: entryData.due_date,
      givenDate: entryData.given_date,
      returnedAmount: parseFloat(entryData.returned_amount),
      status: entryData.status as CreditStatus,
      history: [{
        id: historyData.id,
        date: historyData.date,
        amount: parseFloat(historyData.amount),
        type: 'given',
        paymentMethod: historyData.payment_method as PaymentMethod,
        cardId: historyData.card_id || undefined,
        note: historyData.note || undefined,
      }],
      initialPaymentMethod: entryData.initial_payment_method as PaymentMethod,
      initialCardId: entryData.initial_card_id || undefined,
      initialNote: entryData.initial_note || undefined,
    };
  },

  async addCreditReturn(creditId: string, userId: string, amount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string): Promise<void> {
    const now = new Date().toISOString();

    // Insert history item
    const { data: historyData, error: historyError } = await supabase
      .from('credit_history')
      .insert({
        credit_id: creditId,
        date: now,
        amount,
        type: 'returned',
        payment_method: paymentMethod,
        card_id: cardId || null,
        note: note || null,
      })
      .select()
      .single();
    if (historyError) throw historyError;

    // Get credit entry for person name
    const { data: creditData, error: creditError } = await supabase
      .from('credit_entries')
      .select('person_name')
      .eq('id', creditId)
      .single();
    if (creditError) throw creditError;

    // Create associated transaction
    await transactionService.createTransaction(userId, {
      type: 'income',
      category: 'Credit Return',
      amount,
      date: now,
      note: `Credit return from ${creditData.person_name}`,
      paymentMethod,
      cardId,
      creditId,
      creditHistoryId: historyData.id,
    });
  },

  async deleteCreditEntry(creditId: string, userId: string): Promise<void> {
    // Delete associated transactions first
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('credit_id', creditId);
    
    // Delete history (cascade will handle this, but being explicit)
    await supabase
      .from('credit_history')
      .delete()
      .eq('credit_id', creditId);

    // Delete credit entry
    const { error } = await supabase
      .from('credit_entries')
      .delete()
      .eq('id', creditId);
    if (error) throw error;
  },
};

// ============================================
// CREDIT RECEIVED SERVICE
// ============================================

export const creditReceivedService = {
  async getCreditReceivedEntries(userId: string): Promise<CreditReceivedEntry[]> {
    const { data, error } = await supabase
      .from('credit_received')
      .select('*')
      .eq('user_id', userId)
      .order('received_date', { ascending: false });
    if (error) throw error;

    const entries: CreditReceivedEntry[] = [];
    for (const entry of data) {
      const history = await this.getCreditReceivedHistory(entry.id);
      entries.push({
        id: entry.id,
        personName: entry.person_name,
        amount: parseFloat(entry.amount),
        returnDate: entry.return_date,
        receivedDate: entry.received_date,
        returnedAmount: parseFloat(entry.returned_amount),
        status: entry.status as CreditStatus,
        history,
        initialPaymentMethod: entry.initial_payment_method as 'cash' | 'card',
        initialCardId: entry.initial_card_id || undefined,
        initialNote: entry.initial_note || undefined,
      });
    }
    return entries;
  },

  async getCreditReceivedHistory(creditReceivedId: string): Promise<CreditReceivedHistoryItem[]> {
    const { data, error } = await supabase
      .from('credit_received_history')
      .select('*')
      .eq('credit_received_id', creditReceivedId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map((h) => ({
      id: h.id,
      date: h.date,
      amount: parseFloat(h.amount),
      paymentMethod: h.payment_method as PaymentMethod,
      cardId: h.card_id || undefined,
      note: h.note || undefined,
    }));
  },

  async createCreditReceivedEntry(userId: string, entry: Omit<CreditReceivedEntry, 'id' | 'receivedDate' | 'returnedAmount' | 'status' | 'history'>): Promise<CreditReceivedEntry> {
    const now = new Date().toISOString();
    
    // Insert credit received entry
    const { data: entryData, error: entryError } = await supabase
      .from('credit_received')
      .insert({
        user_id: userId,
        person_name: entry.personName,
        amount: entry.amount,
        return_date: entry.returnDate,
        received_date: now,
        initial_payment_method: entry.initialPaymentMethod,
        initial_card_id: entry.initialCardId || null,
        initial_note: entry.initialNote || null,
      })
      .select()
      .single();
    if (entryError) throw entryError;

    // Create associated transaction
    await transactionService.createTransaction(userId, {
      type: 'income',
      category: 'Credit Received',
      amount: entry.amount,
      date: now,
      note: `Credit received from ${entry.personName}`,
      cardId: entry.initialCardId,
      creditReceivedId: entryData.id,
    });

    return {
      id: entryData.id,
      personName: entryData.person_name,
      amount: parseFloat(entryData.amount),
      returnDate: entryData.return_date,
      receivedDate: entryData.received_date,
      returnedAmount: parseFloat(entryData.returned_amount),
      status: entryData.status as CreditStatus,
      history: [],
      initialPaymentMethod: entryData.initial_payment_method as 'cash' | 'card',
      initialCardId: entryData.initial_card_id || undefined,
      initialNote: entryData.initial_note || undefined,
    };
  },

  async addCreditReceivedReturn(entryId: string, userId: string, amount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string): Promise<void> {
    const now = new Date().toISOString();

    // Insert history item
    const { data: historyData, error: historyError } = await supabase
      .from('credit_received_history')
      .insert({
        credit_received_id: entryId,
        date: now,
        amount,
        payment_method: paymentMethod,
        card_id: cardId || null,
        note: note || null,
      })
      .select()
      .single();
    if (historyError) throw historyError;

    // Get credit received entry for person name
    const { data: creditData, error: creditError } = await supabase
      .from('credit_received')
      .select('person_name')
      .eq('id', entryId)
      .single();
    if (creditError) throw creditError;

    // Create associated transaction
    await transactionService.createTransaction(userId, {
      type: 'expense',
      category: 'Credit Return Paid',
      amount,
      date: now,
      note: `Repayment to ${creditData.person_name}`,
      paymentMethod,
      cardId,
      creditReceivedId: entryId,
      creditReceivedHistoryId: historyData.id,
    });
  },

  async deleteCreditReceivedEntry(entryId: string, userId: string): Promise<void> {
    // Delete associated transactions first
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('credit_received_id', entryId);
    
    // Delete history (cascade will handle this, but being explicit)
    await supabase
      .from('credit_received_history')
      .delete()
      .eq('credit_received_id', entryId);

    // Delete credit received entry
    const { error } = await supabase
      .from('credit_received')
      .delete()
      .eq('id', entryId);
    if (error) throw error;
  },

  async deleteCreditReceivedReturnHistory(entryId: string, historyId: string, userId: string): Promise<void> {
    // Get the history item to get the amount
    const { data: historyData, error: historyError } = await supabase
      .from('credit_received_history')
      .select('*')
      .eq('id', historyId)
      .single();
    if (historyError) throw historyError;

    // Delete associated transaction
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('credit_received_history_id', historyId);

    // Delete history item
    const { error } = await supabase
      .from('credit_received_history')
      .delete()
      .eq('id', historyId);
    if (error) throw error;
  },
};

// ============================================
// STORAGE SERVICE (for file uploads)
// ============================================

export const storageService = {
  async uploadReceipt(userId: string, file: File, transactionId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${transactionId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  async deleteReceipt(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('receipts')
      .remove([filePath]);
    if (error) throw error;
  },
};

