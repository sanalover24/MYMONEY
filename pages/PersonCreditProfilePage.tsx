

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { CreditEntry } from '../types';
import { ChevronLeftIcon } from '../components/icons';

const CreditEntryRow: React.FC<{ entry: CreditEntry }> = ({ entry }) => {
    const remaining = entry.amount - entry.returnedAmount;
    const isOverdue = new Date(entry.dueDate) < new Date() && entry.status !== 'completed';

    const statusInfo = {
        pending: { text: 'Pending', textColor: 'text-rose-500' },
        'partially-paid': { text: 'Partially Paid', textColor: 'text-amber-500' },
        completed: { text: 'Completed', textColor: 'text-emerald-500' },
    };

    return (
        <tr className="border-b dark:border-zinc-700 hover:bg-slate-500/10 dark:hover:bg-zinc-700/50">
            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                <Link to={`/credit/${entry.id}`} className="hover:underline text-brand-600 dark:text-brand-400">
                    {new Date(entry.givenDate).toLocaleDateString()}
                </Link>
            </td>
            <td className="px-6 py-4">Rs. {entry.amount.toLocaleString('en-IN')}</td>
            <td className="px-6 py-4 text-emerald-600 dark:text-emerald-500">Rs. {entry.returnedAmount.toLocaleString('en-IN')}</td>
            <td className="px-6 py-4 font-bold">Rs. {remaining.toLocaleString('en-IN')}</td>
            <td className={`px-6 py-4 ${isOverdue ? 'text-rose-500 font-bold' : ''}`}>
                {new Date(entry.dueDate + 'T00:00:00').toLocaleDateString()}
            </td>
            <td className={`px-6 py-4 font-semibold ${statusInfo[entry.status].textColor}`}>
                {isOverdue ? 'Overdue' : statusInfo[entry.status].text}
            </td>
        </tr>
    );
};

const PersonCreditProfilePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { creditEntries } = useData();
  const personName = name ? decodeURIComponent(name) : '';

  const personCreditHistory = useMemo(() => {
    return creditEntries
      .filter(e => e.personName === personName)
      .sort((a, b) => new Date(b.givenDate).getTime() - new Date(a.givenDate).getTime());
  }, [creditEntries, personName]);

  const summary = useMemo(() => {
    const totalLent = personCreditHistory.reduce((sum, e) => sum + e.amount, 0);
    const totalReturned = personCreditHistory.reduce((sum, e) => sum + e.returnedAmount, 0);
    const totalPending = totalLent - totalReturned;
    return { totalLent, totalReturned, totalPending };
  }, [personCreditHistory]);
  
  const userAvatarUrl = `https://api.dicebear.com/8.x/avataaars/svg?seed=${personName}`;

  return (
    <div className="space-y-6 animate-fade-in-up">
        <Link to="/credit" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors">
            <ChevronLeftIcon className="w-5 h-5"/>
            Back to All Credit
        </Link>
        <Card className="flex flex-col sm:flex-row items-center gap-6">
            <img src={userAvatarUrl} alt={`${personName}'s avatar`} className="w-24 h-24 rounded-full ring-4 ring-offset-4 ring-brand-500 dark:ring-offset-zinc-800" />
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{personName}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Credit History Profile</p>
            </div>
        </Card>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Lent</h4><p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Rs. {summary.totalLent.toLocaleString('en-IN')}</p></Card>
            <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Returned</h4><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Rs. {summary.totalReturned.toLocaleString('en-IN')}</p></Card>
            <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Pending</h4><p className="text-2xl font-bold text-rose-600 dark:text-rose-500">Rs. {summary.totalPending.toLocaleString('en-IN')}</p></Card>
        </div>
        
        <Card>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">All Credit Entries</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-zinc-600 dark:text-zinc-400 uppercase bg-white/30 dark:bg-zinc-800/30">
                        <tr>
                            <th scope="col" className="px-6 py-3 rounded-l-lg">Given Date</th>
                            <th scope="col" className="px-6 py-3">Total Amount</th>
                            <th scope="col" className="px-6 py-3">Returned</th>
                            <th scope="col" className="px-6 py-3">Pending</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3 rounded-r-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {personCreditHistory.length > 0 ? (
                           personCreditHistory.map(entry => <CreditEntryRow key={entry.id} entry={entry} />)
                        ) : (
                           <tr>
                               <td colSpan={6} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                   No credit history found for this person.
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </Card>
    </div>
  );
};

export default PersonCreditProfilePage;