
export type PaymentMethod = 'cash' | 'card' | 'credit';
export type CardType = 'visa' | 'mastercard';

export interface CardDetails {
  id: string;
  cardName: string;
  cardNumber: string; // Stored fully, displayed masked
  expiryDate: string; // MM/YY format
  cardType: CardType;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id:string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO 8601 format (e.g., "2023-10-27T10:00:00.000Z")
  note: string;
  paymentMethod?: PaymentMethod; // Primarily for expenses
  cardId?: string; // Can be for income (e.g. refund/return) or expense
  creditId?: string; // Links transaction to a Credit Lent entry
  creditHistoryId?: string; // Links transaction to a specific Credit Lent history item
  creditReceivedId?: string; // Links transaction to a Credit Received entry
  creditReceivedHistoryId?: string; // Links transaction to a specific Credit Received history item
}


export type CreditStatus = 'pending' | 'partially-paid' | 'completed';

export interface CreditHistoryItem {
  id: string;
  date: string; // ISO string
  amount: number;
  type: 'given' | 'returned';
  paymentMethod: PaymentMethod;
  cardId?: string;
  note?: string;
}

export interface CreditEntry {
  id: string;
  personName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  givenDate: string; // ISO string
  returnedAmount: number;
  status: CreditStatus;
  history: CreditHistoryItem[];
  // Initial 'given by' information
  initialPaymentMethod: PaymentMethod;
  initialCardId?: string;
  initialNote?: string;
}

// --- New Types for Credit Received ---
export interface CreditReceivedHistoryItem {
  id: string;
  date: string; // ISO string
  amount: number;
  paymentMethod: PaymentMethod; // How I returned the money
  cardId?: string;
  note?: string;
}

export interface CreditReceivedEntry {
  id: string;
  personName: string;
  amount: number;
  returnDate: string; // YYYY-MM-DD
  receivedDate: string; // ISO string
  returnedAmount: number;
  status: CreditStatus;
  history: CreditReceivedHistoryItem[];
  // Initial 'received by' information
  initialPaymentMethod: 'cash' | 'card'; // How they gave me money
  initialCardId?: string; // Which of my cards received the money
  initialNote?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}