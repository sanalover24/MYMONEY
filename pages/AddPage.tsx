import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { ArrowRightLeftIcon, WalletIcon, FolderIcon, ChevronRightIcon, UsersIcon, DownloadIcon } from '../components/icons';

const addLinks = [
    { path: '/add-transaction', icon: ArrowRightLeftIcon, label: 'New Transaction', description: 'Record a new income or expense.' },
    { path: '/add-wallet', icon: WalletIcon, label: 'New Wallet Card', description: 'Add a new credit or debit card.' },
    { path: '/add-credit', icon: UsersIcon, label: 'New Credit Lent', description: 'Track money you have lent to others.'},
    { path: '/add-credit-received', icon: DownloadIcon, label: 'New Credit Received', description: 'Manage money you have borrowed.'},
    { path: '/add-category', icon: FolderIcon, label: 'New Category', description: 'Create a new category for transactions.' },
];

const AddPage: React.FC = () => {
    return (
        <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white px-1">Add New Entry</h1>
            {addLinks.map((item) => (
                <Link to={item.path} key={item.path} className="block">
                    <Card className="!p-4 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-700/50 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                                </div>
                                <div>
                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-zinc-400" />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default AddPage;