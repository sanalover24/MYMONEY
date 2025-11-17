import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreditEntry } from '../types';
import { Link } from 'react-router-dom';
import { UsersIcon } from '../components/icons';
import { useSearch } from '../context/SearchContext';

const CreditEntryCard: React.FC<{ entry: CreditEntry }> = ({ entry }) => {
    const remaining = entry.amount - entry.returnedAmount;
    const progress = (entry.returnedAmount / entry.amount) * 100;
    const isOverdue = new Date(entry.dueDate) < new Date() && entry.status !== 'completed';
    
    const statusInfo = {
        pending: { text: 'Pending', color: 'bg-rose-500', textColor: 'text-rose-500' },
        'partially-paid': { text: 'Partially Paid', color: 'bg-amber-500', textColor: 'text-amber-500' },
        completed: { text: 'Completed', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    };

    return (
        <Card className="!p-0 overflow-hidden transition-all hover:shadow-lg">
            <Link to={`/credit/${entry.id}`} className="block">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <Link to={`/credit/person/${encodeURIComponent(entry.personName)}`} className="hover:underline">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{entry.personName}</h3>
                        </Link>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo[entry.status].color} text-white`}>
                           {isOverdue ? 'Overdue' : statusInfo[entry.status].text}
                        </div>
                    </div>
                    <p className={`text-sm ${isOverdue ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        Due: {new Date(entry.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="px-4 pb-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                            Returned: Rs. {entry.returnedAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                           Total: Rs. {entry.amount.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2.5">
                        <div className={`${statusInfo[entry.status].color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className={`text-right mt-1 font-bold text-sm ${statusInfo[entry.status].textColor}`}>
                        Remaining: Rs. {remaining.toLocaleString('en-IN')}
                    </div>
                </div>
            </Link>
        </Card>
    );
};

const CreditPage: React.FC = () => {
  const { creditEntries } = useData();
  const { searchTerm, setSearchTerm, setIsSearchable } = useSearch();

  useEffect(() => {
      setIsSearchable(true);
      return () => {
          setIsSearchable(false);
          setSearchTerm('');
      };
  }, [setIsSearchable, setSearchTerm]);

  const filteredEntries = useMemo(() => {
    return creditEntries.filter(entry =>
        entry.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creditEntries, searchTerm]);

  const summary = useMemo(() => {
    const totalGiven = creditEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalReturned = creditEntries.reduce((sum, e) => sum + e.returnedAmount, 0);
    const totalPending = totalGiven - totalReturned;
    
    const personFrequency: { [key: string]: number } = {};
    creditEntries.forEach(e => {
        personFrequency[e.personName] = (personFrequency[e.personName] || 0) + 1;
    });
    const mostFrequent = Object.entries(personFrequency).sort(([,a],[,b]) => b-a)[0];

    return { totalGiven, totalReturned, totalPending, mostFrequentPerson: mostFrequent ? mostFrequent[0] : 'N/A' };
  }, [creditEntries]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Credit Lent</h2>
        <Link to="/add-credit">
            <Button>Add Credit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Given</h4><p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Rs. {summary.totalGiven.toLocaleString('en-IN')}</p></Card>
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Pending</h4><p className="text-2xl font-bold text-rose-600 dark:text-rose-500">Rs. {summary.totalPending.toLocaleString('en-IN')}</p></Card>
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Returned</h4><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Rs. {summary.totalReturned.toLocaleString('en-IN')}</p></Card>
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Most Frequent</h4><p className="text-2xl font-bold text-brand-600 dark:text-brand-400 truncate">{summary.mostFrequentPerson}</p></Card>
      </div>
      
      {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEntries.map((entry, index) => (
                  <div key={entry.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                      <CreditEntryCard entry={entry} />
                  </div>
              ))}
          </div>
      ) : (
        <Card className="text-center py-20">
            <UsersIcon className="mx-auto w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No Credit History</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm mt-2">
                {searchTerm ? `No entries found for "${searchTerm}".` : "When you give credit to someone, it will appear here."}
            </p>
        </Card>
      )}

    </div>
  );
};

export default CreditPage;
