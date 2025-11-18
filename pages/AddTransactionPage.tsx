import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { TransactionType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { XIcon, LandmarkIcon, CreditCardIcon, PlusCircleIcon, FolderIcon, FileTextIcon } from '../components/icons';
import AmountInput from '../components/ui/AmountInput';
import SegmentedControl from '../components/ui/SegmentedControl';

const AddTransactionPage: React.FC = () => {
  const { categories, addTransaction, cards, balances } = useData();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: 'day', value: new Date() });
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cardId, setCardId] = useState('');
  
  const filteredCategories = useMemo(() => {
      const specialCategories = ['Credit', 'Credit Return', 'Credit Received', 'Credit Return Paid'];
      return categories.filter(c => c.type === type && !specialCategories.includes(c.name));
  }, [categories, type]);
  
  const categoryOptions: SelectOption[] = useMemo(() => filteredCategories.map(c => ({ value: c.name, label: c.name })), [filteredCategories]);
  const cardOptions: SelectOption[] = useMemo(() => cards.map(c => ({ value: c.id, label: `${c.cardName} (**** ${c.cardNumber.slice(-4)})` })), [cards]);

  useEffect(() => {
    setCategory('');
    setPaymentMethod('cash');
  }, [type]);

  useEffect(() => {
    if (paymentMethod !== 'card') {
        setCardId('');
    }
  }, [paymentMethod]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    const transactionAmount = parseFloat(amount);
    if (!category || !transactionAmount || transactionAmount <= 0 || !dateFilter.value) {
        if (typeof addToast === 'function') {
            addToast("Please fill in all required fields.", 'error');
        }
        return;
    }
    if (paymentMethod === 'card' && !cardId) {
        if (typeof addToast === 'function') {
            addToast("Please select a card for this transaction.", 'error');
        }
        return;
    }

    if (type === 'expense') {
        let balance = paymentMethod === 'cash' ? balances.cash : balances[cardId];
        if (balance < transactionAmount) {
            if (typeof addToast === 'function') {
                addToast("Insufficient balance for this transaction.", 'error');
            }
            return;
        }
    }
    
    setLoading(true);
    
    try {
      const selectedDate = dateFilter.value as Date;
      const currentTime = new Date();
      const finalDate = new Date(selectedDate);
      finalDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
      
      await addTransaction({
        type,
        category,
        amount: transactionAmount,
        date: finalDate.toISOString(),
        note,
        paymentMethod: paymentMethod,
        cardId: paymentMethod === 'card' ? cardId : undefined,
      });
      
      if (typeof addToast === 'function') {
        addToast('Transaction added successfully!', 'success');
      }
      navigate('/transactions');
    } catch (error: any) {
      let errorMessage = 'Failed to add transaction. Please try again.';
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.error && error.error.message && typeof error.error.message === 'string') {
          errorMessage = error.error.message;
        } else if (error.details && typeof error.details === 'string') {
          errorMessage = error.details;
        }
      }
      if (typeof addToast === 'function') {
        addToast(errorMessage, 'error');
      } else {
        console.error('addToast is not a function:', addToast);
        console.error('Error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
      { value: 'expense' as TransactionType, label: 'Expense' },
      { value: 'income' as TransactionType, label: 'Income' },
  ];

  const paymentOptions = [
      { value: 'cash' as const, label: 'Cash', icon: LandmarkIcon },
      { value: 'card' as const, label: 'Card', icon: CreditCardIcon },
  ];

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center animate-fade-in-up">
      <Card className="w-full max-w-lg mx-auto !p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">New Transaction</h2>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Cancel and go back"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <label htmlFor="amount" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Amount</label>
              <div className="flex items-center justify-center mt-1">
                <span className="text-4xl font-bold text-zinc-400 dark:text-zinc-500 mr-2">Rs.</span>
                <AmountInput
                  id="amount"
                  value={amount}
                  onChange={setAmount}
                  className="text-6xl font-bold bg-transparent border-none focus:ring-0 w-full text-center text-zinc-800 dark:text-white p-0"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* FIX: Wrap setType in a lambda to match expected onChange signature. */}
            <SegmentedControl options={typeOptions} value={type} onChange={(v) => setType(v as TransactionType)} />

            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                  icon={<FolderIcon className="w-5 h-5" />}
                  value={category}
                  onChange={setCategory}
                  options={categoryOptions}
                  placeholder="Select a category"
                />
                <PremierDatePicker value={dateFilter} onChange={setDateFilter} allowRangeSelection={false} />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {type === 'expense' ? 'Pay with' : 'Receive to'}
                </label>
                {/* FIX: Wrap setPaymentMethod in a lambda to match expected onChange signature. */}
                <SegmentedControl options={paymentOptions} value={paymentMethod} onChange={(v) => setPaymentMethod(v as 'cash' | 'card')} />
              </div>
              
              {paymentMethod === 'card' && (
                <div className="animate-fade-in-up">
                  <CustomSelect icon={<CreditCardIcon className="w-5 h-5" />} value={cardId} onChange={setCardId} options={cardOptions} placeholder="Choose a card" />
                </div>
              )}

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Note (Optional)</label>
                <div className="relative">
                   <FileTextIcon className="w-5 h-5 absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                   <textarea
                     id="note"
                     rows={3}
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     className="block w-full pl-11 pr-4 py-3 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                     placeholder="Add a description..."
                   />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800/80">
            <Button type="submit" className="w-full flex items-center justify-center text-base py-3" disabled={loading}>
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTransactionPage;