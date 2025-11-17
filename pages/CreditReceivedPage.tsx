import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreditReceivedEntry } from '../types';
import { DownloadIcon } from '../components/icons';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const CreditReceivedCard: React.FC<{ entry: CreditReceivedEntry }> = ({ entry }) => {
    const remaining = entry.amount - entry.returnedAmount;
    const progress = entry.amount > 0 ? (entry.returnedAmount / entry.amount) * 100 : 100;
    const isOverdue = new Date(entry.returnDate) < new Date() && entry.status !== 'completed';
    
    const statusInfo = {
        pending: { text: 'Pending', color: 'bg-orange-500', textColor: 'text-orange-500' },
        'partially-paid': { text: 'Partially Paid', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
        completed: { text: 'Completed', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    };

    const displayStatus = isOverdue ? { text: 'Overdue', color: 'bg-rose-500', textColor: 'text-rose-500'} : statusInfo[entry.status];

    return (
        <Card className="!p-0 overflow-hidden transition-all hover:shadow-lg">
            <Link to={`/credit-received/${entry.id}`} className="block">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{entry.personName}</h3>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${displayStatus.color} text-white`}>
                           {displayStatus.text}
                        </div>
                    </div>
                    <p className={`text-sm ${isOverdue ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        Return By: {new Date(entry.returnDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                        <div className={`${displayStatus.color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className={`text-right mt-1 font-bold text-sm ${displayStatus.textColor}`}>
                        Pending: Rs. {remaining.toLocaleString('en-IN')}
                    </div>
                </div>
            </Link>
        </Card>
    );
};

const CreditReceivedPage: React.FC = () => {
  const { creditReceivedEntries } = useData();
  const { searchTerm, setSearchTerm, setIsSearchable } = useSearch();

  useEffect(() => {
    setIsSearchable(true);
    return () => {
        setIsSearchable(false);
        setSearchTerm('');
    };
  }, [setIsSearchable, setSearchTerm]);

  const filteredEntries = useMemo(() => {
    return creditReceivedEntries.filter(entry =>
        entry.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creditReceivedEntries, searchTerm]);

  const summary = useMemo(() => {
    const totalBorrowed = creditReceivedEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalReturned = creditReceivedEntries.reduce((sum, e) => sum + e.returnedAmount, 0);
    const totalPending = totalBorrowed - totalReturned;
    
    return { totalBorrowed, totalReturned, totalPending };
  }, [creditReceivedEntries]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Credit Received</h2>
        <Link to="/add-credit-received">
            <Button>Add Received Credit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Borrowed</h4><p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Rs. {summary.totalBorrowed.toLocaleString('en-IN')}</p></Card>
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Returned</h4><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Rs. {summary.totalReturned.toLocaleString('en-IN')}</p></Card>
          <Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Pending</h4><p className="text-2xl font-bold text-orange-600 dark:text-orange-500">Rs. {summary.totalPending.toLocaleString('en-IN')}</p></Card>
      </div>
      
      {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEntries.map((entry, index) => (
                  <div key={entry.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                      <CreditReceivedCard entry={entry} />
                  </div>
              ))}
          </div>
      ) : (
        <Card className="text-center py-20">
            <DownloadIcon className="mx-auto w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No Debt History</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm mt-2">
                 {searchTerm ? `No entries found for "${searchTerm}".` : "When you receive credit from someone, it will appear here."}
            </p>
        </Card>
      )}

    </div>
  );
};

export default CreditReceivedPage;
