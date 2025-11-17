

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PaymentMethod, CreditReceivedHistoryItem } from '../types';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { XIcon, LandmarkIcon, CreditCardIcon, ChevronLeftIcon, Trash2Icon, UploadIcon } from '../components/icons';
import AmountInput from '../components/ui/AmountInput';

const AddReturnPaymentForm: React.FC<{ entryId: string, remainingAmount: number, onClose: () => void }> = ({ entryId, remainingAmount, onClose }) => {
    const { addCreditReceivedReturn, cards } = useData();
    const { addToast } = useToast();

    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [cardId, setCardId] = useState('');
    const [note, setNote] = useState('');

    const cardOptions: SelectOption[] = useMemo(() => cards.map(c => ({ value: c.id, label: `${c.cardName} (**** ${c.cardNumber.slice(-4)})` })), [cards]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const returnAmount = parseFloat(amount);
        if (returnAmount > remainingAmount) {
            addToast("Return amount cannot be greater than the remaining balance.", 'error');
            return;
        }
        if (paymentMethod === 'card' && !cardId) {
            addToast("Please select one of your cards to pay from.", 'error');
            return;
        }

        addCreditReceivedReturn(entryId, returnAmount, paymentMethod, paymentMethod === 'card' ? cardId : undefined, note);
        addToast("Return payment recorded successfully!", 'success');
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-zinc-700/50 rounded-lg text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Balance Due</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">Rs. {remainingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Return Amount</label>
                <AmountInput value={amount} onChange={setAmount} className="mt-1 block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-700/50 border-slate-300 dark:border-zinc-600 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pay With</label>
                <div className="mt-1 grid grid-cols-2 gap-2 rounded-md bg-slate-100 dark:bg-zinc-900 p-1">
                    <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md w-full transition-colors text-sm font-semibold ${paymentMethod === 'cash' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        <LandmarkIcon className="w-5 h-5" /> Cash
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md w-full transition-colors text-sm font-semibold ${paymentMethod === 'card' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        <CreditCardIcon className="w-5 h-5" /> Card
                    </button>
                </div>
            </div>
            {paymentMethod === 'card' && (
                <div className="animate-fade-in-up">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Your Card</label>
                    <CustomSelect value={cardId} onChange={setCardId} options={cardOptions} placeholder="Choose a card" />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Note</label>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-700/50 border-slate-300 dark:border-zinc-600 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Optional details..." />
            </div>
            <div className="flex justify-end pt-4 gap-3 border-t dark:border-zinc-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Return Payment</Button>
            </div>
        </form>
    );
};

const HistoryItem: React.FC<{ item: CreditReceivedHistoryItem, onDelete: () => void }> = ({ item, onDelete }) => {
    const { cards } = useData();
    const card = item.cardId ? cards.find(c => c.id === item.cardId) : null;
    
    return (
        <div className="flex items-start space-x-4 group">
             <div className="mt-1 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                <UploadIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
             </div>
             <div className="flex-grow">
                <p className="font-bold text-emerald-600 dark:text-emerald-500">
                    Returned: Rs. {item.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(item.date).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 capitalize">
                    Paid with {item.paymentMethod}{card ? ` (${card.cardName})` : ''}
                </p>
                {item.note && <p className="text-sm italic text-zinc-500 dark:text-zinc-400 mt-1">"{item.note}"</p>}
             </div>
             <button onClick={onDelete} title="Delete this payment" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50">
                 <Trash2Icon className="w-4 h-4" />
             </button>
        </div>
    );
};

const CreditReceivedDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { creditReceivedEntries, deleteCreditReceivedEntry, deleteCreditReceivedReturnHistory } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<CreditReceivedHistoryItem | null>(null);

  const entry = useMemo(() => creditReceivedEntries.find(e => e.id === id), [creditReceivedEntries, id]);

  if (!entry) {
    return <Card><p className="text-center">Credit entry not found.</p></Card>;
  }
  
  const remaining = entry.amount - entry.returnedAmount;
  const progress = entry.amount > 0 ? (entry.returnedAmount / entry.amount) * 100 : 100;
  const isOverdue = new Date(entry.returnDate) < new Date() && entry.status !== 'completed';

  const statusInfo = {
      pending: { text: 'Pending', color: 'bg-orange-500', textColor: 'text-orange-500' },
      'partially-paid': { text: 'Partially Paid', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
      completed: { text: 'Completed', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  };

  const displayStatus = isOverdue ? { text: 'Overdue', color: 'bg-rose-500', textColor: 'text-rose-500'} : statusInfo[entry.status];

  const handleDeleteEntry = () => {
    deleteCreditReceivedEntry(entry.id);
    addToast('Credit entry and all associated transactions have been deleted.', 'success');
    navigate('/credit-received');
  };

  const handleDeleteHistoryItem = () => {
      if (historyToDelete) {
          deleteCreditReceivedReturnHistory(entry.id, historyToDelete.id);
          addToast('Return payment and associated transaction deleted.', 'success');
          setHistoryToDelete(null);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <Link to="/credit-received" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors">
                <ChevronLeftIcon className="w-5 h-5"/>
                Back to All Credit Received
            </Link>
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2Icon className="w-4 h-4 mr-2" /> Delete Entry
            </Button>
        </div>

        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{entry.personName}</h2>
                    <p className={`text-sm font-semibold ${isOverdue ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        Return By: {new Date(entry.returnDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${displayStatus.color} text-white`}>
                    {displayStatus.text}
                </div>
            </div>
            <div className="mt-6">
                <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-4">
                    <div className={`${displayStatus.color} h-4 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="mt-2 grid grid-cols-3 text-sm font-medium">
                    <div className="text-left text-emerald-600 dark:text-emerald-500">Returned: Rs. {entry.returnedAmount.toLocaleString('en-IN')}</div>
                    <div className="text-center text-zinc-800 dark:text-zinc-100">Total: Rs. {entry.amount.toLocaleString('en-IN')}</div>
                    <div className={`text-right ${displayStatus.textColor}`}>Pending: Rs. {remaining.toLocaleString('en-IN')}</div>
                </div>
            </div>
            {entry.status !== 'completed' && (
                <div className="mt-6 text-center border-t dark:border-zinc-700 pt-4">
                    <Button onClick={() => setIsReturnModalOpen(true)}>Return Payment</Button>
                </div>
            )}
        </Card>

        <Card>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Return History</h3>
            <div className="space-y-6 border-l-2 border-slate-200 dark:border-zinc-700 ml-4">
                {entry.history.length > 0 ? entry.history.map(item => (
                    <div key={item.id} className="relative pl-8">
                        <div className="absolute -left-[11px] top-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full border-4 border-slate-200 dark:border-zinc-700"></div>
                        <HistoryItem item={item} onDelete={() => setHistoryToDelete(item)} />
                    </div>
                )) : (
                    <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No return payments have been made yet.</p>
                )}
            </div>
        </Card>

        {isReturnModalOpen && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsReturnModalOpen(false)}>
                <Card className="w-full max-w-md animate-fade-in-up !p-0" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-zinc-700">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Return Payment</h2>
                        <button onClick={() => setIsReturnModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 sm:p-6">
                       <AddReturnPaymentForm entryId={entry.id} remainingAmount={remaining} onClose={() => setIsReturnModalOpen(false)} />
                    </div>
                </Card>
            </div>
        )}

        {isDeleteModalOpen && (
             <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                <Card className="w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                            <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-5">Delete Credit Entry</h3>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>Are you sure you want to delete this entire credit entry from <strong>{entry.personName}</strong>?</p>
                            <p className="mt-2 font-semibold">This will also delete all associated income and expense transactions from your records.</p>
                            <p className="mt-4">This action cannot be undone.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteEntry}>Delete</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {historyToDelete && (
             <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                <Card className="w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                         <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-2">Delete Return Payment?</h3>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>Are you sure you want to delete this return payment of <strong>Rs. {historyToDelete.amount.toLocaleString('en-IN')}</strong>?</p>
                            <p className="mt-2 font-semibold">This will also delete the associated expense transaction and update your balances.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setHistoryToDelete(null)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteHistoryItem}>Delete</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}
    </div>
  );
};

export default CreditReceivedDetailPage;