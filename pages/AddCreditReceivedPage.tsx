
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { XIcon, PlusCircleIcon, UsersIcon, CalendarIcon, FileTextIcon, LandmarkIcon, CreditCardIcon } from '../components/icons';
import AmountInput from '../components/ui/AmountInput';
import { toYYYYMMDD } from '../utils/date';
import SegmentedControl from '../components/ui/SegmentedControl';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';

const AddCreditReceivedPage: React.FC = () => {
    const { addCreditReceivedEntry, cards } = useData();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [returnDateFilter, setReturnDateFilter] = useState<DateFilter>({ mode: 'day', value: null });
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cardId, setCardId] = useState('');
    const [note, setNote] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) return;
        
        const creditAmount = parseFloat(amount);
        const returnDate = returnDateFilter.value as Date;

        if (!personName || !creditAmount || !returnDate) {
             addToast("Please fill in all required fields.", 'error');
             return;
        }
        if (paymentMethod === 'card' && !cardId) {
            addToast("Please select a card where you received the credit.", 'error');
            return;
        }

        setLoading(true);
        try {
            await addCreditReceivedEntry({
                personName,
                amount: creditAmount,
                returnDate: toYYYYMMDD(returnDate),
                initialPaymentMethod: paymentMethod,
                initialCardId: paymentMethod === 'card' ? cardId : undefined,
                initialNote: note,
            });
            addToast(`Credit from ${personName} added successfully!`, 'success');
            navigate('/credit-received');
        } catch (error: any) {
            addToast(error.message || 'Failed to add credit received. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const paymentOptions = [
      { value: 'cash' as const, label: 'Cash', icon: LandmarkIcon },
      { value: 'card' as const, label: 'Card', icon: CreditCardIcon },
    ];
    
    const cardOptions: SelectOption[] = useMemo(() => cards.map(c => ({ value: c.id, label: `${c.cardName} (**** ${c.cardNumber.slice(-4)})` })), [cards]);

    const formInputClasses = "block w-full px-4 py-3 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-zinc-500 dark:placeholder:text-zinc-400";

    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center animate-fade-in-up">
            <Card className="w-full max-w-lg mx-auto !p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Add Credit Received</h2>
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
                                <label htmlFor="personName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">From Whom / Person Name</label>
                                <div className="relative">
                                    <UsersIcon className="w-5 h-5 absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                                    <input type="text" id="personName" value={personName} onChange={e => setPersonName(e.target.value)} className={`${formInputClasses} pl-11`} placeholder="Enter name..." required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="returnDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Return Date</label>
                                 <div className="relative">
                                     <PremierDatePicker value={returnDateFilter} onChange={setReturnDateFilter} allowRangeSelection={false} minDate={new Date()} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Received Via</label>
                                <SegmentedControl options={paymentOptions} value={paymentMethod} onChange={(v) => setPaymentMethod(v as 'cash' | 'card')} />
                                {paymentMethod === 'card' && (
                                    <div className="mt-4 animate-fade-in-up">
                                        <CustomSelect 
                                            icon={<CreditCardIcon className="w-5 h-5"/>} 
                                            value={cardId} 
                                            onChange={setCardId} 
                                            options={cardOptions} 
                                            placeholder="Select card" 
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">This will be recorded as an income transaction and added to your selected balance (Cash or Card).</p>
                            </div>
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
                        <Button type="submit" className="w-full flex items-center justify-center text-base py-3" disabled={loading}>
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {loading ? 'Adding...' : 'Add Credit'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddCreditReceivedPage;