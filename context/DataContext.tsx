import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, Category, User, CardDetails, CreditEntry, PaymentMethod, CreditReceivedEntry } from '../types';
import {
  authService,
  profileService,
  categoryService,
  cardService,
  transactionService,
  creditService,
  creditReceivedService,
} from '../supabase/services';
import { dummyCategories } from '../data';

type DataContextType = {
  user: User | null;
  transactions: Transaction[];
  categories: Category[];
  cards: CardDetails[];
  creditEntries: CreditEntry[];
  creditReceivedEntries: CreditReceivedEntry[];
  balances: { [key: string]: number };
  loading: boolean;
  addTransaction: (newTransaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (updated: Transaction) => Promise<void>;
  addCategory: (newCategory: Omit<Category, 'id'>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (updated: Category) => Promise<void>;
  addCard: (newCard: Omit<CardDetails, 'id'>) => Promise<void>;
  deleteCard: (id: string) => Promise<boolean>;
  updateCard: (updated: CardDetails) => Promise<void>;
  addCreditEntry: (newEntry: Omit<CreditEntry, 'id' | 'givenDate' | 'returnedAmount' | 'status' | 'history'>) => Promise<void>;
  addCreditReturn: (creditId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => Promise<void>;
  deleteCreditEntry: (id: string) => Promise<void>;
  addCreditReceivedEntry: (newEntry: Omit<CreditReceivedEntry, 'id' | 'receivedDate' | 'returnedAmount' | 'status' | 'history'>) => Promise<void>;
  addCreditReceivedReturn: (entryId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => Promise<void>;
  deleteCreditReceivedEntry: (id: string) => Promise<void>;
  deleteCreditReceivedReturnHistory: (entryId: string, historyId: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([]);
  const [creditReceivedEntries, setCreditReceivedEntries] = useState<CreditReceivedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(currentUser.id);

        const profile = await profileService.getProfile(currentUser.id, {
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || 'New User',
        });
        setUser(profile || null);

        await loadAllData(currentUser.id);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUserId(authUser.id);
        try {
          const profile = await profileService.getProfile(authUser.id, {
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'New User',
          });
          setUser(profile || null);
          await loadAllData(authUser.id);
        } catch (err) {
          console.error('Error on auth change profile load:', err);
        }
      } else {
        setUser(null);
        setUserId(null);
        setTransactions([]);
        setCategories([]);
        setCards([]);
        setCreditEntries([]);
        setCreditReceivedEntries([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAllData = async (uid: string) => {
    try {
      setLoading(true);

      const [transData, catsData, cardsData, creditData, creditReceivedData] = await Promise.all([
        transactionService.getTransactions(uid),
        categoryService.getCategories(uid),
        cardService.getCards(uid),
        creditService.getCreditEntries(uid),
        creditReceivedService.getCreditReceivedEntries(uid),
      ]);

      setTransactions(transData);
      setCategories(catsData.length ? catsData : []);
      setCards(cardsData);
      setCreditEntries(creditData);
      setCreditReceivedEntries(creditReceivedData);

      // If user has no categories, initialize with defaults
      if (catsData.length === 0) {
        try {
          for (const cat of dummyCategories) {
            await categoryService.createCategory(uid, cat);
          }
          await loadAllData(uid); // Reload to get the new categories
        } catch (error: any) {
          console.error('Error initializing default categories:', error);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (userId) {
      await loadAllData(userId);
    }
  };

  const balances = useMemo(() => {
    const balanceMap: { [key: string]: number } = { cash: 0 };
    cards.forEach(card => { balanceMap[card.id] = 0; });

    transactions.forEach(t => {
        if (t.type === 'income') {
            if (t.cardId && balanceMap[t.cardId] !== undefined) {
                balanceMap[t.cardId] += t.amount;
            } else {
                balanceMap.cash += t.amount;
            }
        } else {
            if (t.cardId && balanceMap[t.cardId] !== undefined) {
                balanceMap[t.cardId] -= t.amount;
            } else if (t.paymentMethod === 'cash') {
                balanceMap.cash -= t.amount;
            }
        }
    });
    return balanceMap;
  }, [transactions, cards]);

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const transaction = await transactionService.createTransaction(userId, newTransaction);
      setTransactions(prev => [transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };
  
  const updateTransaction = async (updated: Transaction) => {
    try {
      const transaction = await transactionService.updateTransaction(updated.id, updated);
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const addCategory = async (newCategory: Omit<Category, 'id'>) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const exists = categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type);
      if (exists) {
        throw new Error('Category already exists');
      }
      const category = await categoryService.createCategory(userId, newCategory);
      setCategories(prev => [...prev, category]);
      return true;
    } catch (error: any) {
      console.error('Error adding category:', error);
      throw error;
    }
  };
  
  const deleteCategory = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await categoryService.deleteCategory(id, userId);
      const categoryToDelete = categories.find(c => c.id === id);
      setCategories(prev => prev.filter(c => c.id !== id));
      if (categoryToDelete) {
        setTransactions(prev => prev.filter(t => t.category !== categoryToDelete.name));
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };
  
  const updateCategory = async (updated: Category) => {
    try {
      const oldCategory = categories.find(c => c.id === updated.id);
      const category = await categoryService.updateCategory(updated.id, updated);
      
      if (oldCategory && oldCategory.name !== updated.name) {
        const updatedTransactions = transactions.map(t => 
          t.category === oldCategory.name ? { ...t, category: updated.name } : t
        );
        setTransactions(updatedTransactions);
        
        for (const t of updatedTransactions.filter(t => t.category === updated.name)) {
          await transactionService.updateTransaction(t.id, { category: updated.name });
        }
      }
      
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const addCard = async (newCard: Omit<CardDetails, 'id'>) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const card = await cardService.createCard(userId, newCard);
      setCards(prev => [...prev, card]);
    } catch (error: any) {
      console.error('Error adding card:', error);
      throw error;
    }
  };
  
  const deleteCard = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const isInUse = await cardService.isCardInUse(id, userId);
      if (isInUse) {
        throw new Error('Cannot delete card. It is linked to one or more transactions.');
      }
      await cardService.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };
  
  const updateCard = async (updated: CardDetails) => {
    try {
      const card = await cardService.updateCard(updated.id, updated);
      setCards(prev => prev.map(c => c.id === card.id ? card : c));
    } catch (error: any) {
      console.error('Error updating card:', error);
      throw error;
    }
  };
  
  const addCreditEntry = async (newEntry: Omit<CreditEntry, 'id' | 'givenDate' | 'returnedAmount' | 'status' | 'history'>) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const entry = await creditService.createCreditEntry(userId, newEntry);
      setCreditEntries(prev => [entry, ...prev]);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding credit entry:', error);
      throw error;
    }
  };

  const addCreditReturn = async (creditId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await creditService.addCreditReturn(creditId, userId, returnAmount, paymentMethod, cardId, note);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding credit return:', error);
      throw error;
    }
  };
  
  const deleteCreditEntry = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await creditService.deleteCreditEntry(id, userId);
      setCreditEntries(prev => prev.filter(e => e.id !== id));
      await refreshData();
    } catch (error: any) {
      console.error('Error deleting credit entry:', error);
      throw error;
    }
  };
  
  const addCreditReceivedEntry = async (newEntry: Omit<CreditReceivedEntry, 'id' | 'receivedDate' | 'returnedAmount' | 'status' | 'history'>) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const entry = await creditReceivedService.createCreditReceivedEntry(userId, newEntry);
      setCreditReceivedEntries(prev => [entry, ...prev]);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding credit received entry:', error);
      throw error;
    }
  };

  const addCreditReceivedReturn = async (entryId: string, returnAmount: number, paymentMethod: PaymentMethod, cardId?: string, note?: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await creditReceivedService.addCreditReceivedReturn(entryId, userId, returnAmount, paymentMethod, cardId, note);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding credit received return:', error);
      throw error;
    }
  };
  
  const deleteCreditReceivedEntry = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await creditReceivedService.deleteCreditReceivedEntry(id, userId);
      setCreditReceivedEntries(prev => prev.filter(e => e.id !== id));
      await refreshData();
    } catch (error: any) {
      console.error('Error deleting credit received entry:', error);
      throw error;
    }
  };
  
  const deleteCreditReceivedReturnHistory = async (entryId: string, historyId: string) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await creditReceivedService.deleteCreditReceivedReturnHistory(entryId, historyId, userId);
      await refreshData();
    } catch (error: any) {
      console.error('Error deleting credit received return history:', error);
      throw error;
    }
  };
  
  const resetToDefaults = async () => {
    if (!userId) throw new Error('User not authenticated');
    try {
      await Promise.all([
        transactionService.getTransactions(userId).then(trans => 
          Promise.all(trans.map(t => transactionService.deleteTransaction(t.id)))
        ),
        cardService.getCards(userId).then(cards => 
          Promise.all(cards.map(c => cardService.deleteCard(c.id)))
        ),
        creditService.getCreditEntries(userId).then(credits => 
          Promise.all(credits.map(c => creditService.deleteCreditEntry(c.id, userId)))
        ),
        creditReceivedService.getCreditReceivedEntries(userId).then(credits => 
          Promise.all(credits.map(c => creditReceivedService.deleteCreditReceivedEntry(c.id, userId)))
        ),
      ]);

      await refreshData();
    } catch (error: any) {
      console.error('Error resetting data:', error);
      throw error;
    }
  };
  
  const value: DataContextType = {
      user,
      transactions,
      categories,
      cards,
      creditEntries,
      creditReceivedEntries,
      balances,
      loading,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addCategory,
      deleteCategory,
      updateCategory,
      addCard,
      deleteCard,
      updateCard,
      addCreditEntry,
      addCreditReturn,
      deleteCreditEntry,
      addCreditReceivedEntry,
      addCreditReceivedReturn,
      deleteCreditReceivedEntry,
      deleteCreditReceivedReturnHistory,
      resetToDefaults,
      refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
