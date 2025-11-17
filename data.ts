
import { User, Category, Transaction, CardDetails, CreditEntry, CreditHistoryItem, CreditReceivedEntry } from './types';

export const dummyUser: User = {
  id: 1,
  name: "Nihath",
  email: "nihath@mail.com"
};

export const dummyCards: CardDetails[] = [
  { id: 'card-1', cardName: 'HNB Visa Card', cardNumber: '4242424242421234', expiryDate: '12/28', cardType: 'visa' },
  { id: 'card-2', cardName: 'Sampath Mastercard', cardNumber: '5555444433338888', expiryDate: '06/27', cardType: 'mastercard' },
];

export const dummyCategories: Category[] = [
  {id: '1', "name": "Salary", "type": "income"},
  {id: '2', "name": "Freelance", "type": "income"},
  {id: '3', "name": "Gifts", "type": "income"},
  {id: '11', "name": "Credit Return", "type": "income"},
  {id: '12', "name": "Credit Received", "type": "income"},
  {id: '4', "name": "Food", "type": "expense"},
  {id: '5', "name": "Rent", "type": "expense"},
  {id: '6', "name": "Transport", "type": "expense"},
  {id: '7', "name": "Shopping", "type": "expense"},
  {id: '8', "name": "Utilities", "type": "expense"},
  {id: '9', "name": "Entertainment", "type": "expense"},
  {id: '10', "name": "Credit", "type": "expense"},
  {id: '13', "name": "Credit Return Paid", "type": "expense"},
];

export const dummyTransactions: Transaction[] = [
    {"id": '1', "type": "income", "category": "Salary", "amount": 50000, "date": new Date('2025-11-01T09:00:00').toISOString(), "note": "Monthly salary"},
    {"id": '2', "type": "expense", "category": "Rent", "amount": 18000, "date": new Date('2025-11-03T18:30:00').toISOString(), "note": "House rent", "paymentMethod": "cash"},
    {"id": '3', "type": "expense", "category": "Shopping", "amount": 2500, "date": new Date('2025-11-05T15:15:00').toISOString(), "note": "New shoes", "paymentMethod": "card", "cardId": "card-1"},
    {"id": '4', "type": "income", "category": "Freelance", "amount": 8000, "date": new Date('2025-11-06T11:00:00').toISOString(), "note": "Logo design"},
    {"id": '5', "type": "expense", "category": "Food", "amount": 1200, "date": new Date('2025-11-02T13:00:00').toISOString(), "note": "Lunch at cafe", "paymentMethod": "card", "cardId": "card-2"},
    {"id": '6', "type": "expense", "category": "Transport", "amount": 500, "date": new Date('2025-11-08T08:45:00').toISOString(), "note": "Bus fare", "paymentMethod": "cash"},
    {"id": '7', "type": "expense", "category": "Food", "amount": 1500, "date": new Date('2025-11-10T20:00:00').toISOString(), "note": "Dinner with friends", "paymentMethod": "credit"},
    {"id": '8', "type": "expense", "category": "Entertainment", "amount": 800, "date": new Date('2025-11-12T19:30:00').toISOString(), "note": "Movie tickets", "paymentMethod": "card", "cardId": "card-1"},
    {"id": '9', "type": "income", "category": "Gifts", "amount": 2000, "date": new Date('2025-11-15T12:00:00').toISOString(), "note": "Birthday gift"},
    {"id": '10', "type": "expense", "category": "Utilities", "amount": 3200, "date": new Date('2025-11-20T18:00:00').toISOString(), "note": "Electricity and Internet bill", "paymentMethod": "credit"}
];

export const dummyCreditEntries: CreditEntry[] = [
  {
    id: 'credit-1',
    personName: 'John Doe',
    amount: 5000,
    dueDate: '2025-12-31',
    givenDate: new Date('2025-11-10T10:00:00').toISOString(),
    returnedAmount: 2000,
    status: 'partially-paid',
    initialPaymentMethod: 'card',
    initialCardId: 'card-1',
    initialNote: 'For project supplies',
    history: [
      { id: 'hist-1-1', date: new Date('2025-11-10T10:00:00').toISOString(), amount: 5000, type: 'given', paymentMethod: 'card', cardId: 'card-1', note: 'For project supplies' },
      { id: 'hist-1-2', date: new Date('2025-11-20T14:30:00').toISOString(), amount: 2000, type: 'returned', paymentMethod: 'cash', note: 'First part' }
    ],
  },
  {
    id: 'credit-2',
    personName: 'Jane Smith',
    amount: 1000,
    dueDate: '2025-11-30',
    givenDate: new Date('2025-11-15T18:00:00').toISOString(),
    returnedAmount: 0,
    status: 'pending',
    initialPaymentMethod: 'cash',
    initialNote: 'Lunch money',
    history: [
      { id: 'hist-2-1', date: new Date('2025-11-15T18:00:00').toISOString(), amount: 1000, type: 'given', paymentMethod: 'cash', note: 'Lunch money' }
    ],
  },
  {
    id: 'credit-3',
    personName: 'John Doe',
    amount: 2500,
    dueDate: '2025-11-25',
    givenDate: new Date('2025-11-05T09:00:00').toISOString(),
    returnedAmount: 2500,
    status: 'completed',
    initialPaymentMethod: 'cash',
    history: [
      { id: 'hist-3-1', date: new Date('2025-11-05T09:00:00').toISOString(), amount: 2500, type: 'given', paymentMethod: 'cash' },
      { id: 'hist-3-2', date: new Date('2025-11-22T12:00:00').toISOString(), amount: 2500, type: 'returned', paymentMethod: 'card', cardId: 'card-2', note: 'Paid back in full' }
    ],
  },
];

export const dummyCreditReceivedEntries: CreditReceivedEntry[] = [
    {
        id: 'cr-1',
        personName: 'Alice Johnson',
        amount: 2000,
        returnDate: '2025-12-15',
        receivedDate: new Date('2025-11-12T11:00:00').toISOString(),
        returnedAmount: 500,
        status: 'partially-paid',
        initialPaymentMethod: 'cash',
        initialNote: 'Help with rent',
        history: [
            { id: 'cr-hist-1-1', date: new Date('2025-11-25T16:00:00').toISOString(), amount: 500, paymentMethod: 'cash', note: 'First payment' }
        ]
    },
    {
        id: 'cr-2',
        personName: 'Bob Williams',
        amount: 10000,
        returnDate: '2026-01-31',
        receivedDate: new Date('2025-11-01T14:20:00').toISOString(),
        returnedAmount: 10000,
        status: 'completed',
        initialPaymentMethod: 'card',
        initialCardId: 'card-2',
        initialNote: 'Car repair loan',
        history: [
            { id: 'cr-hist-2-1', date: new Date('2025-11-30T10:00:00').toISOString(), amount: 5000, paymentMethod: 'card', cardId: 'card-1' },
            { id: 'cr-hist-2-2', date: new Date('2025-12-28T10:00:00').toISOString(), amount: 5000, paymentMethod: 'card', cardId: 'card-1' }
        ]
    },
    {
        id: 'cr-3',
        personName: 'Charlie Brown',
        amount: 500,
        returnDate: '2025-11-28',
        receivedDate: new Date('2025-11-22T09:00:00').toISOString(),
        returnedAmount: 0,
        status: 'pending',
        initialPaymentMethod: 'cash',
        history: []
    }
];