import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TransactionType, Category } from '../types';
import { Trash2Icon, EditIcon, XIcon, ArrowUpDownIcon, PlusCircleIcon } from '../components/icons';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';


const EditCategoryForm: React.FC<{ category: Category; onSubmit: (data: Category) => void; onClose: () => void; }> = ({ category, onSubmit, onClose }) => {
    const [formData, setFormData] = useState(category);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const formInputClasses = "block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={formInputClasses}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`${formInputClasses} disabled:opacity-50`}
                disabled
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
               <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Category type cannot be changed to maintain data integrity.</p>
            </div>
            <div className="flex justify-end pt-4 gap-3 border-t dark:border-zinc-700/80">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};


const CategoriesPage: React.FC = () => {
  const { categories, transactions, deleteCategory, updateCategory } = useData();
  const { addToast } = useToast();
  const { searchTerm, setSearchTerm, setIsSearchable } = useSearch();
  
  const [sortCategoriesBy, setSortCategoriesBy] = useState('name-asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    setIsSearchable(true);
    return () => {
        setIsSearchable(false);
        setSearchTerm('');
    };
  }, [setIsSearchable, setSearchTerm]);


  const handleConfirmDelete = () => {
    if (categoryToDelete) {
        deleteCategory(categoryToDelete.id);
        addToast('Category and associated transactions deleted!', 'success');
        setCategoryToDelete(null);
    }
  };
  
  const categoryInUse = useMemo(() => {
    if (!categoryToDelete) return false;
    return transactions.some(t => t.category === categoryToDelete.name);
  }, [transactions, categoryToDelete]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory);
    addToast('Category updated successfully!', 'success');
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };
  
  const sortOptions: SelectOption[] = [
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'type-asc', label: 'Type (Income first)' },
    { value: 'type-desc', label: 'Type (Expense first)' },
  ];
  
  const sortedAndFilteredCategories = useMemo(() => {
    return [...categories]
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (sortCategoriesBy) {
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'type-asc':
                    return a.type.localeCompare(b.type);
                case 'type-desc':
                    return b.type.localeCompare(a.type);
                case 'name-asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
  }, [categories, sortCategoriesBy, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in-up">
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">All Categories</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
                        <CustomSelect
                            icon={<ArrowUpDownIcon className="w-5 h-5" />}
                            value={sortCategoriesBy}
                            onChange={setSortCategoriesBy}
                            options={sortOptions}
                        />
                    </div>
                     <Link to="/add-category">
                        <Button><PlusCircleIcon className="w-5 h-5 mr-2" /> Add New</Button>
                     </Link>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-zinc-600 dark:text-zinc-400 uppercase bg-white/30 dark:bg-zinc-800/30">
                        <tr>
                            <th scope="col" className="px-6 py-3 rounded-l-lg">Category Name</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3 text-center rounded-r-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredCategories.length > 0 ? sortedAndFilteredCategories.map((c, index) => (
                            <tr key={c.id} className="bg-transparent border-b dark:border-zinc-700 hover:bg-slate-500/10 dark:hover:bg-zinc-700/50 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>{c.type}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleEdit(c)} title="Edit Category" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mr-2"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setCategoryToDelete(c)} title="Delete Category" className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200"><Trash2Icon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                               <td colSpan={3} className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                   No categories found. Start by adding one!
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </Card>
      
       {isEditModalOpen && editingCategory && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
                <Card className="w-full max-w-md animate-fade-in-up !p-0" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-zinc-700/80">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Category</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 sm:p-6">
                       <EditCategoryForm
                            category={editingCategory}
                            onSubmit={handleUpdateCategory}
                            onClose={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </Card>
            </div>
        )}

        {categoryToDelete && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                <Card className="w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                            <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-5">Delete Category</h3>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>Are you sure you want to delete the category "<strong>{categoryToDelete.name}</strong>"?</p>
                            {categoryInUse && (
                                <p className="mt-2 p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-md">
                                    <strong>Warning:</strong> This category is used in one or more transactions. Deleting it will also permanently delete all associated transactions.
                                </p>
                            )}
                            <p className="mt-4">This action cannot be undone.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}
    </div>
  );
};

export default CategoriesPage;
