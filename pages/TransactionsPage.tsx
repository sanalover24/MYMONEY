import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2Icon, EditIcon, XIcon, ArrowUpDownIcon, FolderIcon, ArrowRightLeftIcon, PlusCircleIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ScaleIcon, BarChart3Icon, UploadIcon, DownloadIcon } from '../components/icons';
import { Transaction, TransactionType, Category } from '../types';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { toYYYYMMDD, getISODateParts, isSameDay } from '../utils/date';
import { Link } from 'react-router-dom';
import AmountInput from '../components/ui/AmountInput';
import { useSearch } from '../context/SearchContext';

const EditTransactionForm: React.FC<{ transaction: Transaction; onSubmit: (data: Transaction) => void; categories: Category[]; onClose: () => void; }> = ({ transaction, onSubmit, categories, onClose }) => {
  
  const { date: isoDate, ...restOfTransaction } = transaction;

  const [formData, setFormData] = useState({
    ...restOfTransaction,
    amount: restOfTransaction.amount.toString(),
  });
  
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: 'day',
    value: new Date(isoDate)
  });
  
  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleTypeChange = (newType: TransactionType) => {
    setFormData(prev => ({ ...prev, type: newType, category: '' })); // Reset category on type change
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDate = dateFilter.value as Date;
    if (!formData.category || !selectedDate) {
        alert('Please select a category and provide a date.');
        return;
    }
    
    const originalDate = new Date(transaction.date);
    originalDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const fullIsoDate = originalDate.toISOString();

    const transactionToSubmit: Transaction = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        date: fullIsoDate,
    };
    onSubmit(transactionToSubmit);
  };
  
  const formInputClasses = "block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";


  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
        <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800/50 p-1">
          <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 rounded-md w-1/2 transition-all duration-300 text-sm font-semibold ${formData.type === 'income' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'}`}>Income</button>
          <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 rounded-md w-1/2 transition-all duration-300 text-sm font-semibold ${formData.type === 'expense' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'}`}>Expense</button>
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
        <select name="category" value={formData.category} onChange={handleChange} className={formInputClasses} required>
          <option value="" disabled>Select a category</option>
          {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount</label>
        <AmountInput value={formData.amount} onChange={handleAmountChange} className={formInputClasses} placeholder="0.00" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
        <PremierDatePicker value={dateFilter} onChange={setDateFilter} allowRangeSelection={false} />
      </div>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Note</label>
        <textarea name="note" rows={3} value={formData.note} onChange={handleChange} className={formInputClasses} placeholder="Optional details..." />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-700/80">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

const StatItem: React.FC<{ icon: React.ElementType; label: string; value: string; colorClass: string; }> = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('600', '100')} dark:${colorClass.replace('text-', 'dark:bg-').replace('400', '900/50')}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        </div>
    </div>
);

const MonthSummaryCard: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const summary = useMemo(() => {
    const creditCategories = ['Credit', 'Credit Return', 'Credit Received', 'Credit Return Paid'];
    const isCreditTransaction = (t: Transaction) => creditCategories.includes(t.category);
    
    const income = transactions
      .filter(t => t.type === 'income' && !isCreditTransaction(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense' && !isCreditTransaction(t))
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  }, [transactions]);

  if (summary.income === 0 && summary.expense === 0) return null;

  return (
    <Card className="!p-4 bg-slate-50 dark:bg-zinc-800/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <ArrowUpRightIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Income</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-500">Rs. {summary.income.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/50">
            <ArrowDownLeftIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Expense</p>
            <p className="font-bold text-rose-600 dark:text-rose-500">Rs. {summary.expense.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TransactionsSidebar: React.FC = () => {
    const { balances, creditEntries, creditReceivedEntries, transactions } = useData();

    const { totalBalance, pendingCreditLent, pendingCreditReceived, todaysIncome, todaysExpense } = useMemo(() => {
        const creditCategories = ['Credit', 'Credit Return', 'Credit Received', 'Credit Return Paid'];
        const isCreditTransaction = (t: Transaction) => creditCategories.includes(t.category);
        
        const totalBalance = Object.values(balances).reduce((sum: number, b: number) => sum + b, 0);
        const pendingCreditLent = creditEntries.filter(e => e.status !== 'completed').reduce((sum, e) => sum + (e.amount - e.returnedAmount), 0);
        const pendingCreditReceived = creditReceivedEntries.filter(e => e.status !== 'completed').reduce((sum, e) => sum + (e.amount - e.returnedAmount), 0);
        const todayStr = toYYYYMMDD(new Date());
        const todaysTransactions = transactions.filter(t => toYYYYMMDD(new Date(t.date)) === todayStr && !isCreditTransaction(t));
        const todaysIncome = todaysTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const todaysExpense = todaysTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalBalance, pendingCreditLent, pendingCreditReceived, todaysIncome, todaysExpense };
    }, [balances, creditEntries, creditReceivedEntries, transactions]);

    return (
        <div className="space-y-6 sticky top-24">
            <Card>
                <StatItem icon={ScaleIcon} label="Total Balance" value={`Rs. ${totalBalance.toLocaleString('en-IN')}`} colorClass="text-brand-600 dark:text-brand-400" />
            </Card>
            <Card>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Pending Summary</h3>
                <div className="space-y-4">
                    <StatItem icon={UploadIcon} label="Pending Lent" value={`Rs. ${pendingCreditLent.toLocaleString('en-IN')}`} colorClass="text-rose-600 dark:text-rose-400" />
                    <StatItem icon={DownloadIcon} label="Pending Received" value={`Rs. ${pendingCreditReceived.toLocaleString('en-IN')}`} colorClass="text-amber-600 dark:text-amber-400" />
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Today's Summary</h3>
                <div className="space-y-4">
                     <StatItem icon={ArrowUpRightIcon} label="Income" value={`Rs. ${todaysIncome.toLocaleString('en-IN')}`} colorClass="text-emerald-600 dark:text-emerald-400" />
                     <StatItem icon={ArrowDownLeftIcon} label="Expense" value={`Rs. ${todaysExpense.toLocaleString('en-IN')}`} colorClass="text-rose-600 dark:text-rose-400" />
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <Link to="/add-transaction" className="w-full"><Button className="w-full flex items-center justify-center"><PlusCircleIcon className="w-5 h-5 mr-2"/> Add Transaction</Button></Link>
                    <Link to="/reports" className="w-full"><Button variant="secondary" className="w-full flex items-center justify-center"><BarChart3Icon className="w-5 h-5 mr-2"/> View Reports</Button></Link>
                    <Link to="/categories" className="w-full"><Button variant="secondary" className="w-full flex items-center justify-center"><FolderIcon className="w-5 h-5 mr-2"/> Manage Categories</Button></Link>
                </div>
            </Card>
        </div>
    );
}

const TransactionsPage: React.FC = () => {
    const { transactions, categories, deleteTransaction, updateTransaction } = useData();
    const { searchTerm, setSearchTerm, setIsSearchable } = useSearch();
    
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: 'month', value: new Date().toISOString().slice(0, 7) });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    useEffect(() => {
        setIsSearchable(true);
        return () => {
            setIsSearchable(false);
            setSearchTerm(''); // Clear search on unmount
        };
    }, [setIsSearchable, setSearchTerm]);

    const getIconForCategory = (categoryName: string) => {
        const lowerCategory = categoryName.toLowerCase();
        if (lowerCategory.includes('food')) return '🍎';
        if (lowerCategory.includes('shopping')) return '🛍️';
        if (lowerCategory.includes('transport')) return '🚌';
        if (lowerCategory.includes('rent')) return '🏠';
        if (lowerCategory.includes('salary')) return '💼';
        if (lowerCategory.includes('freelance')) return '💻';
        if (lowerCategory.includes('entertainment')) return '🎬';
        if (lowerCategory.includes('utilities')) return '💡';
        if (lowerCategory.includes('gifts')) return '🎁';
        if (lowerCategory.includes('credit return paid')) return '💸';
        if (lowerCategory.includes('credit return')) return '💰';
        if (lowerCategory.includes('credit received')) return '📥';
        if (lowerCategory.includes('credit')) return '📤';
        return '🧾';
    };

    const groupedTransactions = useMemo(() => {
        const { mode, value } = dateFilter;
        
        const filtered = transactions
            .filter(t => {
                if (!value) return true;
                if (mode === 'month') return toYYYYMMDD(new Date(t.date)).startsWith(value as string);
                if (mode === 'day') return toYYYYMMDD(new Date(t.date)) === toYYYYMMDD(value as Date);
                if (mode === 'range') {
                    const { start, end } = value as { start: Date | null; end: Date | null };
                    if (!start || !end) return true;
                    const time = new Date(t.date).getTime();
                    return time >= new Date(start).setHours(0,0,0,0) && time <= new Date(end).setHours(23,59,59,999);
                }
                return true;
            })
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => filterCategory === 'all' || t.category === filterCategory)
            .filter(t => t.note.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'amount-desc': return b.amount - a.amount;
                case 'amount-asc': return a.amount - b.amount;
                default: return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
        
        // FIX: The `reduce` method's initial empty object `{}` caused TypeScript to infer an incorrect type for the accumulator.
        // This led to `groupedTransactions` being improperly typed, which in turn made `transactionsInMonth` have the type `unknown`,
        // causing the error "Property 'map' does not exist on type 'unknown'".
        // By providing the explicit generic type argument `<Record<string, Transaction[]>>` to `reduce`, we ensure that
        // the accumulator and the return value are correctly typed, resolving the error.
        return filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
            const monthYear = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(t);
            return acc;
        }, {});

    }, [transactions, searchTerm, filterType, filterCategory, dateFilter, sortBy]);
    
    const typeOptions: SelectOption[] = [ { value: 'all', label: 'All Types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' } ];
    const categoryOptions: SelectOption[] = useMemo(() => [ { value: 'all', label: 'All Categories' }, ...categories.filter(c => filterType === 'all' || c.type === filterType).map(c => ({ value: c.name, label: c.name })) ], [categories, filterType]);
    const sortOptions: SelectOption[] = [ { value: 'date-desc', label: 'Date: Newest' }, { value: 'date-asc', label: 'Date: Oldest' }, { value: 'amount-desc', label: 'Amount: High to Low' }, { value: 'amount-asc', label: 'Amount: Low to High' }, ];

    const handleEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setIsEditModalOpen(true); };
    const handleUpdateTransaction = (updatedTransaction: Transaction) => { updateTransaction(updatedTransaction); setIsEditModalOpen(false); setEditingTransaction(null); };
    const handleConfirmDelete = () => { if (transactionToDelete) { deleteTransaction(transactionToDelete.id); setTransactionToDelete(null); } };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 items-start">
            <div className="space-y-6">
                <Card className="animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><PremierDatePicker value={dateFilter} onChange={setDateFilter} /></div>
                        <CustomSelect icon={<ArrowRightLeftIcon className="w-5 h-5" />} value={filterType} onChange={(v) => { setFilterType(v); setFilterCategory('all'); }} options={typeOptions} />
                        <CustomSelect icon={<FolderIcon className="w-5 h-5" />} value={filterCategory} onChange={setFilterCategory} options={categoryOptions} />
                        <div className="md:col-span-2"><CustomSelect icon={<ArrowUpDownIcon className="w-5 h-5" />} value={sortBy} onChange={setSortBy} options={sortOptions} /></div>
                    </div>
                </Card>

                {Object.keys(groupedTransactions).length > 0 ? (
                    Object.entries(groupedTransactions).map(([month, transactionsInMonth]) => (
                        <div key={month} className="space-y-4 animate-fade-in-up">
                            <h2 className="text-xl font-bold text-zinc-800 dark:text-white px-2">{month}</h2>
                            <MonthSummaryCard transactions={transactionsInMonth} />
                            {transactionsInMonth.map((t, index) => (
                                <Card key={t.id} className="!p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-xl flex-shrink-0">{getIconForCategory(t.category)}</div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">{t.category}</p>
                                                <p className={`font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                                                    {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            {t.note && <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 truncate">Note: {t.note}</p>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleEdit(t)} title="Edit" className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setTransactionToDelete(t)} title="Delete" className="p-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"><Trash2Icon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ))
                ) : (
                    <Card className="text-center py-16 animate-fade-in-up">
                        <ArrowRightLeftIcon className="mx-auto w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
                        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No Transactions Found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Try adjusting your filters or add a new transaction.</p>
                    </Card>
                )}
            </div>
            <div className="hidden xl:block"><TransactionsSidebar /></div>

            {isEditModalOpen && editingTransaction && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
                    <Card style={{animationDuration: '300ms'}} className="w-full max-w-md animate-fade-in-up !p-0" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-zinc-700/80">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Transaction</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-4 sm:p-6"><EditTransactionForm transaction={editingTransaction} onSubmit={handleUpdateTransaction} onClose={() => setIsEditModalOpen(false)} categories={categories} /></div>
                    </Card>
                </div>
            )}
            {transactionToDelete && (
                <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <Card style={{animationDuration: '300ms'}} className="w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50"><Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" /></div>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-5">Delete Transaction</h3>
                            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <p>Are you sure you want to delete this transaction?</p>
                                <div className="font-semibold text-left mt-2 p-3 bg-slate-100 dark:bg-zinc-700/50 rounded-md space-y-1">
                                    <p><span className="font-normal">Date:</span> {new Date(transactionToDelete.date).toLocaleDateString()}</p>
                                    <p><span className="font-normal">Category:</span> {transactionToDelete.category}</p>
                                    <p><span className="font-normal">Amount:</span> <span className={transactionToDelete.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>Rs. {transactionToDelete.amount.toLocaleString('en-IN')}</span></p>
                                    {transactionToDelete.note && <p><span className="font-normal">Note:</span> <span className="italic">"{transactionToDelete.note}"</span></p>}
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                                <Button variant="secondary" onClick={() => setTransactionToDelete(null)}>Cancel</Button>
                                <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;