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

        // Use currentUser.email and name as defaults
        const profile = await profileService.getProfile(currentUser.id, {
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || 'New User',
        });
        setUser(profile || null);

        await loadAllData(currentUser.id);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
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
      setCategories(catsData.length ? catsData : dummyCategories.map(c => ({ ...c, userId: uid })));
      setCards(cardsData);
      setCreditEntries(creditData);
      setCreditReceivedEntries(creditReceivedData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const balances = useMemo(() => {
    const balanceMap: { [key: string]: number } = { cash: 0 };
    cards.forEach(card => balanceMap[card.id] = 0);

    transactions.forEach(t => {
      if (t.type === 'income') {
        if (t.cardId && balanceMap[t.cardId] !== undefined) balanceMap[t.cardId] += t.amount;
        else balanceMap.cash += t.amount;
      } else {
        if (t.cardId && balanceMap[t.cardId] !== undefined) balanceMap[t.cardId] -= t.amount;
        else if (t.paymentMethod === 'cash') balanceMap.cash -= t.amount;
      }
    });

    return balanceMap;
  }, [transactions, cards]);

  const refreshData = async () => {
    if (userId) await loadAllData(userId);
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
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
