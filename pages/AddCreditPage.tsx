import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { PaymentMethod } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { XIcon, LandmarkIcon, CreditCardIcon, PlusCircleIcon, UsersIcon, CalendarIcon, FileTextIcon } from '../components/icons';
import AmountInput from '../components/ui/AmountInput';
import { toYYYYMMDD } from '../utils/date';
import SegmentedControl from '../components/ui/SegmentedControl';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';

const AddCreditPage: React.FC = () => {
    const { cards, addCreditEntry, balances } = useData();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDateFilter, setDueDateFilter] = useState<DateFilter>({ mode: 'day', value: null });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [cardId, setCardId] = useState('');
    const [note, setNote] = useState('');
    
    const cardOptions: SelectOption[] = useMemo(() => cards.map(c => ({ value: c.id, label: `${c.cardName} (**** ${c.cardNumber.slice(-4)})` })), [cards]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const creditAmount = parseFloat(amount);
        const dueDate = dueDateFilter.value as Date;

        if (!personName || !creditAmount || !dueDate) {
             addToast("Please fill in all required fields.", 'error');
             return;
        }
        if (paymentMethod === 'card' && !cardId) {
            addToast("Please select a card.", 'error');
            return;
        }

        const balance = paymentMethod === 'cash' ? balances.cash : (balances[cardId] || 0);
        if (balance < creditAmount) {
            addToast("Insufficient balance to give this credit.", 'error');
            return;
        }

        addCreditEntry({
            personName,
            amount: creditAmount,
            dueDate: toYYYYMMDD(dueDate),
            initialPaymentMethod: paymentMethod,
            initialCardId: paymentMethod === 'card' ? cardId : undefined,
            initialNote: note,
        });

        addToast(`Credit for ${personName} added successfully!`, 'success');
        navigate('/credit');
    };

    const paymentOptions = [
      { value: 'cash' as const, label: 'Cash', icon: LandmarkIcon },
      { value: 'card' as const, label: 'Card', icon: CreditCardIcon },
    ];
    
    const formInputClasses = "block w-full px-4 py-3 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center animate-fade-in-up">
            <Card className="w-full max-w-lg mx-auto !p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Add Credit Lent</h2>
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

                         <div className="space-y-4">
                            <div>
                                <label htmlFor="personName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Person Name</label>
                                <div className="relative">
                                    <UsersIcon className="w-5 h-5 absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                                    <input type="text" id="personName" value={personName} onChange={e => setPersonName(e.target.value)} className={`${formInputClasses} pl-11`} required placeholder="Enter name..." />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Due Date</label>
                                <PremierDatePicker value={dueDateFilter} onChange={setDueDateFilter} allowRangeSelection={false} minDate={new Date()} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Given By</label>
                                <SegmentedControl options={paymentOptions} value={paymentMethod} onChange={(v) => setPaymentMethod(v as PaymentMethod)} />
                            </div>
                            {paymentMethod === 'card' && (
                                <div className="animate-fade-in-up">
                                    <CustomSelect icon={<CreditCardIcon className="w-5 h-5"/>} value={cardId} onChange={setCardId} options={cardOptions} placeholder="Choose a card" />
                                </div>
                            )}
                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Note (Optional)</label>
                                <div className="relative">
                                    <FileTextIcon className="w-5 h-5 absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                                    <textarea id="note" rows={2} value={note} onChange={e => setNote(e.target.value)} className={`${formInputClasses} pl-11`} placeholder="Add a description..." />
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800/80">
                        <Button type="submit" className="w-full flex items-center justify-center text-base py-3">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add Credit
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
};

export default AddCreditPage;