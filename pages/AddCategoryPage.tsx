import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { TransactionType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { XIcon, PlusCircleIcon } from '../components/icons';
import SegmentedControl from '../components/ui/SegmentedControl';

const AddCategoryPage: React.FC = () => {
    const { addCategory } = useData();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [name, setName] = useState('');
    const [type, setType] = useState<TransactionType>('expense');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
             addToast("Please enter a category name.", 'error');
             return;
        }
        const success = addCategory({ name, type });
        if (success) {
            addToast('Category added successfully!', 'success');
            navigate('/categories');
        } else {
            addToast(`A category named "${name}" for ${type} already exists.`, 'error');
        }
    };
    
    const typeOptions = [
      { value: 'expense' as TransactionType, label: 'Expense' },
      { value: 'income' as TransactionType, label: 'Income' },
    ];
    
    const formInputClasses = "block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";


    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center animate-fade-in-up">
            <Card className="w-full max-w-lg mx-auto !p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Add New Category</h2>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                aria-label="Cancel and go back"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={formInputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
                                <SegmentedControl
                                    value={type}
                                    onChange={(value) => setType(value as TransactionType)}
                                    options={typeOptions}
                                />
                            </div>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800/80">
                        <Button type="submit" className="w-full flex items-center justify-center text-base py-3">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add Category
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddCategoryPage;
